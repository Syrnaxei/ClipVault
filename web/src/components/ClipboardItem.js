import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import PopConfirm from './PopConfirm';
import './ClipboardItem.css';
function ClipboardItem({ item, duplicate, onDelete, onEdit, onCopy }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(item.content);
    const handleEdit = () => {
        setIsEditing(true);
        setEditContent(item.content);
    };
    const handleSave = async () => {
        await onEdit(item.id, editContent);
        setIsEditing(false);
    };
    const handleCancel = () => {
        setIsEditing(false);
        setEditContent(item.content);
    };
    return (_jsx("div", { className: `clipboard-item-content ${duplicate ? 'duplicate' : ''}`, children: isEditing ? (_jsxs("div", { className: "edit-mode", children: [_jsx("input", { type: "text", value: editContent, onChange: (e) => setEditContent(e.target.value), className: "edit-input", autoFocus: true }), _jsxs("div", { className: "edit-actions", children: [_jsx("button", { onClick: handleSave, className: "save-button", children: "\u4FDD\u5B58" }), _jsx("button", { onClick: handleCancel, className: "cancel-button", children: "\u53D6\u6D88" })] })] })) : (_jsxs("div", { className: "view-mode", children: [_jsxs("div", { className: "item-body", children: [_jsx("span", { className: "content-text", children: item.content }), _jsx("span", { className: "item-time", children: new Date(item.created_at).toLocaleString('zh-CN', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                            }) })] }), _jsxs("div", { className: "action-buttons", children: [_jsx("button", { onClick: handleEdit, className: "action-button edit", title: "\u7F16\u8F91", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }), _jsx("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })] }) }), _jsx(PopConfirm, { title: "\u786E\u5B9A\u5220\u9664\u8FD9\u6761\u5185\u5BB9\u5417\uFF1F", onConfirm: () => onDelete(item.id), children: _jsx("button", { className: "action-button delete", title: "\u5220\u9664", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("polyline", { points: "3 6 5 6 21 6" }), _jsx("path", { d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })] }) }) }), _jsx("button", { onClick: () => onCopy(item.content), className: "action-button copy", title: "\u590D\u5236", children: _jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("rect", { x: "9", y: "9", width: "13", height: "13", rx: "2", ry: "2" }), _jsx("path", { d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })] }) })] })] })) }));
}
export default ClipboardItem;
