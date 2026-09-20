import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ClipboardList from './components/ClipboardList';
import Settings from './components/Settings';
import { api, ApiKeyError, clearApiKey, getApiKey, hasApiKey, setApiKey } from './api';
import { connectWs } from './ws';
function initialTheme() {
    return localStorage.getItem('clipvault_theme') === 'dark' ? 'dark' : 'light';
}
function KeyGate({ onAuthed }) {
    const [key, setKey] = useState('');
    const [error, setError] = useState('');
    const submit = async (e) => {
        e.preventDefault();
        setError('');
        setApiKey(key);
        try {
            await api.listClipboards();
            onAuthed();
        }
        catch (err) {
            clearApiKey();
            setError(err instanceof ApiKeyError ? 'API Key 无效' : '连接服务器失败');
        }
    };
    return (_jsx("div", { className: "key-gate", children: _jsxs("form", { className: "key-gate-card", onSubmit: submit, children: [_jsx("h1", { children: "ClipVault" }), _jsx("p", { children: "\u8BF7\u8F93\u5165 API Key \u4EE5\u8BBF\u95EE\u526A\u5207\u677F" }), _jsx("input", { type: "password", value: key, onChange: (e) => setKey(e.target.value), placeholder: "API Key", autoFocus: true }), error && _jsx("div", { className: "key-gate-error", children: error }), _jsx("button", { type: "submit", disabled: !key.trim(), children: "\u8FDB\u5165" })] }) }));
}
function App() {
    const [authed, setAuthed] = useState(hasApiKey());
    const [theme, setTheme] = useState(initialTheme);
    const [view, setView] = useState('main');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [clipboards, setClipboards] = useState([]);
    const [itemsByClipboard, setItemsByClipboard] = useState({});
    const [activeId, setActiveId] = useState(null);
    const [dupGroups, setDupGroups] = useState(null);
    const [connected, setConnected] = useState(false);
    const activeIdRef = useRef(null);
    activeIdRef.current = activeId;
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('clipvault_theme', theme);
    }, [theme]);
    const refreshAll = useCallback(async () => {
        const { clipboards: list } = await api.listClipboards();
        setClipboards(list);
        const active = activeIdRef.current;
        if (active !== null) {
            const { items } = await api.listItems(active);
            setItemsByClipboard((prev) => ({ ...prev, [active]: items }));
        }
    }, []);
    const refreshAggregates = useCallback(() => {
        api
            .listClipboards()
            .then(({ clipboards: list }) => setClipboards(list))
            .catch(() => { });
    }, []);
    useEffect(() => {
        if (!authed)
            return;
        let disposed = false;
        (async () => {
            try {
                await refreshAll();
                if (disposed)
                    return;
                setClipboards((list) => {
                    if (list.length > 0 && activeIdRef.current === null) {
                        setActiveId(list[0].id);
                    }
                    return list;
                });
            }
            catch (err) {
                if (err instanceof ApiKeyError) {
                    clearApiKey();
                    setAuthed(false);
                }
            }
        })();
        const closeWs = connectWs(getApiKey(), (event) => {
            switch (event.type) {
                case 'clipboard.created':
                    setClipboards((prev) => prev.some((c) => c.id === event.payload.id) ? prev : [...prev, event.payload]);
                    break;
                case 'clipboard.renamed':
                    setClipboards((prev) => prev.map((c) => (c.id === event.payload.id ? { ...c, ...event.payload } : c)));
                    break;
                case 'clipboard.deleted': {
                    const { id } = event.payload;
                    setClipboards((prev) => prev.filter((c) => c.id !== id));
                    setItemsByClipboard((prev) => {
                        const next = { ...prev };
                        delete next[id];
                        return next;
                    });
                    setActiveId((cur) => (cur === id ? null : cur));
                    break;
                }
                case 'item.created':
                    refreshAggregates();
                    setItemsByClipboard((prev) => {
                        const list = prev[event.payload.clipboard_id];
                        if (!list)
                            return prev;
                        return {
                            ...prev,
                            [event.payload.clipboard_id]: [
                                event.payload,
                                ...list.filter((i) => i.id !== event.payload.id),
                            ],
                        };
                    });
                    break;
                case 'item.updated':
                    setItemsByClipboard((prev) => {
                        const list = prev[event.payload.clipboard_id];
                        if (!list)
                            return prev;
                        return {
                            ...prev,
                            [event.payload.clipboard_id]: list.map((i) => i.id === event.payload.id ? event.payload : i),
                        };
                    });
                    break;
                case 'item.deleted': {
                    refreshAggregates();
                    const { id, clipboardId } = event.payload;
                    setItemsByClipboard((prev) => {
                        const list = prev[clipboardId];
                        if (!list)
                            return prev;
                        return { ...prev, [clipboardId]: list.filter((i) => i.id !== id) };
                    });
                    break;
                }
            }
        }, (status) => {
            setConnected(status);
            if (status) {
                refreshAll().catch(() => { });
            }
        });
        return () => {
            disposed = true;
            closeWs();
        };
    }, [authed, refreshAll, refreshAggregates]);
    useEffect(() => {
        if (activeId !== null && itemsByClipboard[activeId] === undefined) {
            api
                .listItems(activeId)
                .then(({ items }) => setItemsByClipboard((prev) => ({ ...prev, [activeId]: items })))
                .catch(() => { });
        }
    }, [activeId, itemsByClipboard]);
    const handleAddClipboard = async (name) => {
        await api.createClipboard(name);
    };
    const handleDeleteClipboard = async (id) => {
        await api.deleteClipboard(id);
        if (activeId === id)
            setActiveId(null);
    };
    const handleAddItem = async (content) => {
        if (activeId === null)
            return;
        await api.createItem(activeId, content);
    };
    const handleEditItem = async (id, newContent) => {
        if (!newContent.trim())
            return;
        await api.updateItem(id, newContent);
    };
    const handleCopyItem = (content) => {
        navigator.clipboard.writeText(content);
    };
    const handleCheckDuplicates = async () => {
        if (activeId === null)
            return;
        const { groups } = await api.duplicates(activeId);
        setDupGroups(groups.length > 0 ? groups : []);
    };
    const activeItems = activeId !== null ? itemsByClipboard[activeId] : undefined;
    if (!authed) {
        return (_jsx(KeyGate, { onAuthed: () => {
                setAuthed(true);
            } }));
    }
    return (_jsxs("div", { className: "app", children: [_jsx(Header, { sidebarOpen: sidebarOpen, onToggleSidebar: () => setSidebarOpen((v) => !v), settingsOpen: view === 'settings', onToggleSettings: () => setView((v) => (v === 'settings' ? 'main' : 'settings')) }), view === 'settings' ? (_jsx(Settings, { theme: theme, onThemeChange: setTheme, connected: connected, onBack: () => setView('main'), onLogout: () => {
                    clearApiKey();
                    setAuthed(false);
                    setView('main');
                } })) : (_jsxs("div", { className: "main-container", children: [_jsx(Sidebar, { clipboards: clipboards, activeId: activeId, collapsed: !sidebarOpen, onSelectClipboard: setActiveId, onAddClipboard: handleAddClipboard, onDeleteClipboard: handleDeleteClipboard }), _jsx(ClipboardList, { clipboardName: clipboards.find((c) => c.id === activeId)?.name ?? null, items: activeItems ?? [], loading: activeId !== null && activeItems === undefined, dupGroups: dupGroups, onAddItem: handleAddItem, onDeleteItem: async (id) => {
                            await api.deleteItem(id);
                        }, onEditItem: handleEditItem, onCopyItem: handleCopyItem, onCheckDuplicates: handleCheckDuplicates, onClearDuplicates: () => setDupGroups(null) })] }))] }));
}
export default App;
