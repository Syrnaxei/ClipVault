import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import './Sidebar.css';
function Sidebar({ clipboards, activeId, collapsed, onSelectClipboard, onAddClipboard, onDeleteClipboard, }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [adding, setAdding] = useState(false);
    const [newName, setNewName] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const filtered = clipboards.filter((clipboard) => clipboard.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const openForm = () => {
        setAdding(true);
        setNewName('');
        setError('');
    };
    const closeForm = () => {
        setAdding(false);
        setNewName('');
        setError('');
    };
    const submitNewClipboard = async () => {
        const name = newName.trim();
        if (!name) {
            setError('请输入剪切板名称');
            return;
        }
        if (clipboards.some((c) => c.name.toLowerCase() === name.toLowerCase())) {
            setError('已存在同名剪切板');
            return;
        }
        setSubmitting(true);
        try {
            await onAddClipboard(name);
            closeForm();
        }
        catch {
            setError('创建失败，请重试');
        }
        finally {
            setSubmitting(false);
        }
    };
    return (_jsx("div", { className: `sidebar ${collapsed ? 'collapsed' : ''}`, children: _jsxs("div", { className: "sidebar-inner", children: [_jsxs("div", { className: "search-box", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", className: "search-icon", children: [_jsx("circle", { cx: "11", cy: "11", r: "8" }), _jsx("path", { d: "m21 21-4.35-4.35" })] }), _jsx("input", { type: "text", placeholder: "\u641C\u7D22\u526A\u5207\u677F", value: searchTerm, onChange: (e) => setSearchTerm(e.target.value), className: "search-input" })] }), _jsxs("div", { className: "clipboard-list", children: [filtered.length === 0 && (_jsx("div", { className: "sidebar-empty", children: clipboards.length === 0 ? '还没有剪切板' : '没有匹配的结果' })), filtered.map((clipboard) => (_jsxs("div", { className: `clipboard-card ${activeId === clipboard.id ? 'active' : ''}`, onClick: () => onSelectClipboard(clipboard.id), children: [_jsxs("div", { className: "clipboard-info", children: [_jsx("span", { className: "clipboard-name", children: clipboard.name }), _jsxs("div", { className: "clipboard-meta", children: [_jsx("span", { className: "clipboard-time", children: clipboard.latest_item_at
                                                        ? new Date(clipboard.latest_item_at).toLocaleString('zh-CN', {
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })
                                                        : '暂无内容' }), _jsxs("span", { className: "clipboard-preview", children: [clipboard.item_count ?? 0, " \u6761"] })] })] }), _jsx("button", { className: "delete-button", onClick: (e) => {
                                        e.stopPropagation();
                                        onDeleteClipboard(clipboard.id);
                                    }, children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "3 6 5 6 21 6" }), _jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })] }) })] }, clipboard.id)))] }), _jsx("div", { className: "add-clipboard-section", children: adding ? (_jsxs("div", { className: "add-clipboard-form", children: [_jsx("input", { className: "add-clipboard-input", placeholder: "\u526A\u5207\u677F\u540D\u79F0", value: newName, maxLength: 255, onChange: (e) => {
                                    setNewName(e.target.value);
                                    setError('');
                                }, onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        submitNewClipboard();
                                    if (e.key === 'Escape')
                                        closeForm();
                                }, autoFocus: true }), error && _jsx("div", { className: "add-clipboard-error", children: error }), _jsxs("div", { className: "add-clipboard-actions", children: [_jsx("button", { className: "confirm-add-clipboard", onClick: submitNewClipboard, disabled: submitting, children: "\u521B\u5EFA" }), _jsx("button", { className: "cancel-add-clipboard", onClick: closeForm, children: "\u53D6\u6D88" })] })] })) : (_jsxs("button", { className: "add-button", onClick: openForm, children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", children: [_jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), _jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })] }), "\u65B0\u5EFA\u526A\u5207\u677F"] })) })] }) }));
}
export default Sidebar;
