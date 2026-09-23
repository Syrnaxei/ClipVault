export interface CvtMeta {
  name: string;
  author: string;
  version: string;
  description: string;
}

export interface CvtPlugin {
  meta: CvtMeta;
  code: string;
}

export class CvtParseError extends Error {}

const META_BLOCK_RE = /\/\*\s*ClipVault-Plugin\s*([\s\S]*?)\*\//;
const VERSION_RE = /^\d+\.\d+\.\d+$/;

function requireString(
  value: unknown,
  field: string,
  min: number,
  max: number,
): string {
  if (typeof value !== 'string') {
    throw new CvtParseError(`元数据缺少字段: ${field}`);
  }
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new CvtParseError(`元数据字段 ${field} 长度须在 ${min}-${max} 之间`);
  }
  return trimmed;
}

export function parseCvt(source: string): CvtPlugin {
  const match = META_BLOCK_RE.exec(source);
  if (!match) {
    throw new CvtParseError('未找到插件元数据块(须为 /* ClipVault-Plugin { … } */)');
  }
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(match[1]) as Record<string, unknown>;
  } catch {
    throw new CvtParseError('元数据块不是合法 JSON');
  }
  const meta: CvtMeta = {
    name: requireString(raw.name, 'name', 1, 100),
    author: requireString(raw.author, 'author', 1, 100),
    version: requireString(raw.version, 'version', 1, 20),
    description: requireString(raw.description, 'description', 1, 1000),
  };
  if (!VERSION_RE.test(meta.version)) {
    throw new CvtParseError('version 须为 x.y.z 格式');
  }
  const code = source.slice(match.index + match[0].length).trim();
  if (!code) {
    throw new CvtParseError('插件代码为空');
  }
  if (!/\bfunction\s+process\s*\(/.test(code)) {
    throw new CvtParseError('插件代码缺少 process(input) 函数');
  }
  return { meta, code };
}
