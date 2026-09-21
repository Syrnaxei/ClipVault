import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import './PopConfirm.css';

interface PopConfirmProps {
  title: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  children: ReactNode;
}

function PopConfirm({
  title,
  confirmText = '删除',
  cancelText = '取消',
  onConfirm,
  children,
}: PopConfirmProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const triggerRect = useRef<DOMRect | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRect.current || !popRef.current) return;
    const el = popRef.current;
    const rect = triggerRect.current;
    const { offsetHeight: h, offsetWidth: w } = el;
    let top = rect.top - h - 8;
    if (top < 8) top = rect.bottom + 8;
    let left = rect.right - w;
    if (left < 8) left = 8;
    if (left + w > window.innerWidth - 8) left = window.innerWidth - w - 8;
    el.style.top = `${top}px`;
    el.style.left = `${left}px`;
  }, [open]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!open && triggerRef.current) {
      triggerRect.current = triggerRef.current.getBoundingClientRect();
    }
    setOpen((v) => !v);
  };

  return (
    <span className="popconfirm" ref={triggerRef}>
      <span className="popconfirm-trigger" onClick={toggle}>
        {children}
      </span>
      {open && (
        <div className="popconfirm-popover" ref={popRef} onClick={(e) => e.stopPropagation()}>
          <div className="popconfirm-title">{title}</div>
          <div className="popconfirm-actions">
            <button className="popconfirm-cancel" onClick={() => setOpen(false)}>
              {cancelText}
            </button>
            <button
              className="popconfirm-confirm"
              onClick={() => {
                setOpen(false);
                onConfirm();
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      )}
    </span>
  );
}

export default PopConfirm;
