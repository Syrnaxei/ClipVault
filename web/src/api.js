const KEY_STORAGE = 'clipvault_api_key';
let apiKey = localStorage.getItem(KEY_STORAGE) ?? '';
export class ApiKeyError extends Error {
}
export function hasApiKey() {
    return apiKey.length > 0;
}
export function getApiKey() {
    return apiKey;
}
export function setApiKey(key) {
    apiKey = key.trim();
    localStorage.setItem(KEY_STORAGE, apiKey);
}
export function clearApiKey() {
    apiKey = '';
    localStorage.removeItem(KEY_STORAGE);
}
async function request(path, init) {
    const res = await fetch(path, {
        ...init,
        headers: {
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
            Authorization: `Bearer ${apiKey}`,
        },
    });
    if (res.status === 401) {
        throw new ApiKeyError('Invalid API key');
    }
    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error?.message ?? `Request failed: ${res.status}`);
    }
    if (res.status === 204) {
        return undefined;
    }
    return res.json();
}
export const api = {
    listClipboards: () => request('/api/clipboards'),
    createClipboard: (name) => request('/api/clipboards', {
        method: 'POST',
        body: JSON.stringify({ name }),
    }),
    deleteClipboard: (id) => request(`/api/clipboards/${id}`, { method: 'DELETE' }),
    listItems: (clipboardId) => request(`/api/clipboards/${clipboardId}/items`),
    createItem: (clipboardId, content) => request(`/api/clipboards/${clipboardId}/items`, {
        method: 'POST',
        body: JSON.stringify({ content }),
    }),
    updateItem: (id, content) => request(`/api/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ content }),
    }),
    deleteItem: (id) => request(`/api/items/${id}`, { method: 'DELETE' }),
    duplicates: (clipboardId) => request(`/api/clipboards/${clipboardId}/duplicates`),
};
