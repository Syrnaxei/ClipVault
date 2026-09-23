export class PluginRunError extends Error {}

const RUN_TIMEOUT_MS = 3000;

const WORKER_SOURCE_PREFIX = `self.onmessage = (e) => {
  const input = e.data;
  try {
    const fn = new Function('input', '"use strict";\\n' + code + '\\n;return typeof process === "function" ? process : null;')(input);
    if (!fn) {
      self.postMessage({ ok: false, error: '插件代码缺少 process(input) 函数' });
      return;
    }
    const result = fn(input);
    if (typeof result !== 'string') {
      self.postMessage({ ok: false, error: 'process 必须返回字符串,实际返回: ' + typeof result });
      return;
    }
    self.postMessage({ ok: true, result });
  } catch (err) {
    self.postMessage({ ok: false, error: String((err && err.message) || err) });
  }
};`;

export function buildWorkerSource(code: string): string {
  return `const code = ${JSON.stringify(code)};\n${WORKER_SOURCE_PREFIX}`;
}

export function runPlugin(code: string, input: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(
      new Blob([buildWorkerSource(code)], { type: 'text/javascript' }),
    );
    const worker = new Worker(url, { name: 'cvt-plugin' });
    const cleanup = () => {
      clearTimeout(timer);
      URL.revokeObjectURL(url);
      worker.terminate();
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(new PluginRunError(`插件执行超时(${RUN_TIMEOUT_MS / 1000}秒)`));
    }, RUN_TIMEOUT_MS);
    worker.onmessage = (e: MessageEvent<{ ok: boolean; result?: string; error?: string }>) => {
      cleanup();
      if (e.data.ok && typeof e.data.result === 'string') {
        resolve(e.data.result);
      } else {
        reject(new PluginRunError(e.data.error ?? '插件执行失败'));
      }
    };
    worker.onerror = (e) => {
      cleanup();
      reject(new PluginRunError(e.message || '插件执行失败'));
    };
    worker.postMessage(input);
  });
}
