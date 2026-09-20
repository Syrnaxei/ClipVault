import type { WsEvent } from './types';

export function connectWs(
  apiKey: string,
  onEvent: (event: WsEvent) => void,
  onStatusChange?: (connected: boolean) => void,
): () => void {
  let closed = false;
  let ws: WebSocket | null = null;
  let retryDelay = 1000;

  function open() {
    if (closed) return;
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(`${protocol}//${location.host}/ws?key=${encodeURIComponent(apiKey)}`);

    ws.onopen = () => {
      retryDelay = 1000;
      onStatusChange?.(true);
    };
    ws.onmessage = (e) => {
      try {
        onEvent(JSON.parse(e.data));
      } catch {
        // ignore malformed messages
      }
    };
    ws.onclose = () => {
      onStatusChange?.(false);
      if (!closed) {
        setTimeout(open, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 30_000);
      }
    };
    ws.onerror = () => ws?.close();
  }

  open();

  return () => {
    closed = true;
    ws?.close();
  };
}
