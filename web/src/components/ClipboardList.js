import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import ClipboardItemView from './ClipboardItem';
import PopConfirm from './PopConfirm';
import './ClipboardList.css';
function ClipboardList({ clipboardId, clipboardName, items, loading, dupGroups, onAddItem, onDeleteItem, onEditItem, onCopyItem, onCheckDuplicates, onClearDuplicates, onDeleteClipboard, }) {
    const [expanded, setExpanded] = useState(false);
    const [newContent, setNewContent] = useState('');
    const submitNewItem = () => {
        const content = newContent.trim();
        if (!content || clipboardId === null)
            return;
        onAddItem(content);
        setNewContent('');
        setExpanded(false);
    };
    const duplicateIds = new Set(dupGroups?.flatMap((group) => group.items.map((item) => item.id)) ?? []);
    return (_jsxs("div", { className: "clipboard-list-container", children: [_jsxs("div", { className: "clipboard-list-header", children: [_jsx("h2", { children: clipboardName ?? '未选择剪切板' }), clipboardId !== null && (_jsx(PopConfirm, { title: `确定删除剪切板「${clipboardName}」吗？其中的所有条目都会被删除。`, onConfirm: () => onDeleteClipboard(clipboardId), children: _jsxs("button", { className: "delete-clipboard-button", children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "15", height: "15", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "3 6 5 6 21 6" }), _jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })] }), "\u5220\u9664\u526A\u5207\u677F"] }) }))] }), dupGroups !== null && (_jsxs("div", { className: `duplicates-banner ${duplicateIds.size > 0 ? 'has-duplicates' : ''}`, children: [duplicateIds.size > 0
                        ? `发现 ${dupGroups.length} 组重复条目，已高亮显示`
                        : '未发现重复条目', _jsx("button", { className: "clear-duplicates-button", onClick: onClearDuplicates, children: "\u5173\u95ED" })] })), _jsxs("div", { className: "clipboard-items", children: [loading && _jsx("div", { className: "empty-state", children: _jsx("p", { children: "\u52A0\u8F7D\u4E2D..." }) }), !loading &&
                        items.map((item) => (_jsx(ClipboardItemView, { item: item, duplicate: duplicateIds.has(item.id), onDelete: onDeleteItem, onEdit: onEditItem, onCopy: onCopyItem }, item.id))), !loading && items.length === 0 && (_jsx("div", { className: "empty-state", children: _jsx("p", { children: "\u6682\u65E0\u5185\u5BB9\uFF0C\u5728\u4E0B\u65B9\u8F93\u5165\u6846\u6DFB\u52A0" }) }))] }), _jsxs("div", { className: "list-footer", children: [_jsxs("div", { className: "add-item-box", children: [_jsx("textarea", { className: `add-item-input ${expanded ? 'expanded' : ''}`, placeholder: clipboardId !== null ? '输入要添加的内容，Enter 添加，Shift+Enter 换行' : '请先选择剪切板', rows: 1, value: newContent, disabled: clipboardId === null, onChange: (e) => setNewContent(e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        submitNewItem();
                                    }
                                    if (e.key === 'Escape') {
                                        setNewContent('');
                                        setExpanded(false);
                                        e.currentTarget.blur();
                                    }
                                } }), _jsx("button", { className: `add-item-expand ${expanded ? 'expanded' : ''}`, onClick: () => setExpanded((v) => !v), title: expanded ? '收起' : '展开', children: _jsx("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "6 9 12 15 18 9" }) }) })] }), _jsx("button", { className: "check-duplicates-button", onClick: onCheckDuplicates, disabled: clipboardId === null, children: "\u68C0\u67E5\u91CD\u590D" })] })] }));
}
export default ClipboardList;
