import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './PopConfirm.css';
function PopConfirm({ title, confirmText = '删除', cancelText = '取消', onConfirm, children, }) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef(null);
    const popRef = useRef(null);
    const triggerRect = useRef(null);
    useEffect(() => {
        if (!open)
            return;
        const onDocMouseDown = (e) => {
            if (triggerRef.current?.contains(e.target) ||
                popRef.current?.contains(e.target)) {
                return;
            }
            setOpen(false);
        };
        const onKey = (e) => {
            if (e.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('mousedown', onDocMouseDown);
        document.addEventListener('keydown', onKey);
        return () => {
            document.removeEventListener('mousedown', onDocMouseDown);
            document.removeEventListener('keydown', onKey);
        };
    }, [open]);
    useLayoutEffect(() => {
        if (!open || !triggerRect.current || !popRef.current)
            return;
        const el = popRef.current;
        const rect = triggerRect.current;
        const { offsetHeight: h, offsetWidth: w } = el;
        let top = rect.top - h - 8;
        if (top < 8)
            top = rect.bottom + 8;
        let left = rect.right - w;
        if (left < 8)
            left = 8;
        if (left + w > window.innerWidth - 8)
            left = window.innerWidth - w - 8;
        el.style.top = `${top}px`;
        el.style.left = `${left}px`;
    }, [open]);
    const toggle = (e) => {
        e.stopPropagation();
        if (!open && triggerRef.current) {
            triggerRect.current = triggerRef.current.getBoundingClientRect();
        }
        setOpen((v) => !v);
    };
    return (_jsxs("span", { className: "popconfirm", ref: triggerRef, children: [_jsx("span", { className: "popconfirm-trigger", onClick: toggle, children: children }), open && (_jsxs("div", { className: "popconfirm-popover", ref: popRef, onClick: (e) => e.stopPropagation(), children: [_jsx("div", { className: "popconfirm-title", children: title }), _jsxs("div", { className: "popconfirm-actions", children: [_jsx("button", { className: "popconfirm-cancel", onClick: () => setOpen(false), children: cancelText }), _jsx("button", { className: "popconfirm-confirm", onClick: () => {
                                    setOpen(false);
                                    onConfirm();
                                }, children: confirmText })] })] }))] }));
}
export default PopConfirm;
