import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ClipboardItemView from './ClipboardItem';
import './ClipboardList.css';
function ClipboardList({ items, loading, dupGroups, onAddItem, onDeleteItem, onEditItem, onCopyItem, onCheckDuplicates, onClearDuplicates, }) {
    const [adding, setAdding] = useState(false);
    const [newContent, setNewContent] = useState('');
    const submitNewItem = () => {
        const content = newContent.trim();
        if (!content)
            return;
        onAddItem(content);
        setNewContent('');
        setAdding(false);
    };
    const duplicateIds = new Set(dupGroups?.flatMap((group) => group.items.map((item) => item.id)) ?? []);
    return (_jsxs("div", { className: "clipboard-list-container", children: [_jsxs("div", { className: "clipboard-list-header", children: [_jsx("h2", { children: "\u526A\u5207\u677F\u5185\u5BB9" }), _jsxs("div", { className: "header-actions", children: [_jsx("button", { className: "check-duplicates-button", onClick: onCheckDuplicates, children: "\u68C0\u67E5\u91CD\u590D" }), _jsx("button", { className: "add-item-button", onClick: () => setAdding((v) => !v), children: "+" })] })] }), adding && (_jsxs("div", { className: "add-item-row", children: [_jsx("input", { className: "add-item-input", placeholder: "\u8F93\u5165\u8981\u6DFB\u52A0\u7684\u5185\u5BB9", value: newContent, onChange: (e) => setNewContent(e.target.value), onKeyDown: (e) => {
                            if (e.key === 'Enter')
                                submitNewItem();
                            if (e.key === 'Escape') {
                                setNewContent('');
                                setAdding(false);
                            }
                        }, autoFocus: true }), _jsx("button", { className: "confirm-add-button", onClick: submitNewItem, children: "\u6DFB\u52A0" })] })), dupGroups !== null && (_jsxs("div", { className: `duplicates-banner ${duplicateIds.size > 0 ? 'has-duplicates' : ''}`, children: [duplicateIds.size > 0
                        ? `发现 ${dupGroups.length} 组重复条目，已高亮显示`
                        : '未发现重复条目', _jsx("button", { className: "clear-duplicates-button", onClick: onClearDuplicates, children: "\u5173\u95ED" })] })), _jsxs("div", { className: "clipboard-items", children: [loading && _jsx("div", { className: "empty-state", children: _jsx("p", { children: "\u52A0\u8F7D\u4E2D..." }) }), !loading &&
                        items.map((item) => (_jsx(ClipboardItemView, { item: item, duplicate: duplicateIds.has(item.id), onDelete: onDeleteItem, onEdit: onEditItem, onCopy: onCopyItem }, item.id))), !loading && items.length === 0 && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "\u6682\u65E0\u5185\u5BB9\uFF0C\u70B9\u51FB\"+\"\u6DFB\u52A0" }) }))] })] }));
}
export default ClipboardList;
