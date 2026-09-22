import { useState, type ReactNode } from 'react';
import type { ClipboardItem } from '../types';
import { DEVICE_TYPES } from '../types';
import PopConfirm from './PopConfirm';
import './ClipboardItem.css';

const DEVICE_ICONS: Record<string, ReactNode> = {
  iPhone: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  iPad: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  ),
  Mac: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="12" rx="2" ry="2"></rect>
      <path d="M2 19h20"></path>
    </svg>
  ),
  PC: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
      <line x1="8" y1="21" x2="16" y2="21"></line>
      <line x1="12" y1="17" x2="12" y2="21"></line>
    </svg>
  ),
  Web: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect>
      <line x1="3" y1="9" x2="21" y2="9"></line>
      <line x1="6" y1="6.5" x2="6.01" y2="6.5"></line>
    </svg>
  ),
  Unknown: (
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
      <line x1="12" y1="17" x2="12.01" y2="17"></line>
    </svg>
  ),
};

function DeviceIcon({ type }: { type: string | null }) {
  const key = type
    ? DEVICE_TYPES.find((t) => t.toLowerCase() === type.toLowerCase())
    : undefined;
  return <>{DEVICE_ICONS[key ?? ''] ?? DEVICE_ICONS.Unknown}</>;
}

interface ClipboardItemProps {
  item: ClipboardItem;
  duplicate: boolean;
  onDelete: (id: number) => void;
  onEdit: (id: number, newContent: string) => void;
  onCopy: (content: string) => void;
}

function ClipboardItem({ item, duplicate, onDelete, onEdit, onCopy }: ClipboardItemProps) {
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

  return (
    <div className={`clipboard-item-content ${duplicate ? 'duplicate' : ''}`}>
      {isEditing ? (
        <div className="edit-mode">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
              if (e.key === 'Escape') handleCancel();
            }}
            className="edit-input"
            rows={3}
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-button">保存</button>
            <button onClick={handleCancel} className="cancel-button">取消</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <div className="item-body">
            <span className="content-text">{item.content}</span>
            <div className="item-meta">
              <span className="item-time">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>
                  {new Date(item.created_at).toLocaleString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
              {(item.device || item.device_type) && (
                <span className="item-device">
                  <DeviceIcon type={item.device_type} />
                  {item.device && <span className="item-device-name">{item.device}</span>}
                </span>
              )}
            </div>
          </div>
          <div className="action-buttons">
            <button onClick={handleEdit} className="action-button edit" title="编辑">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <PopConfirm title="确定删除这条内容吗？" onConfirm={() => onDelete(item.id)}>
              <button className="action-button delete" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </PopConfirm>
            <button onClick={() => onCopy(item.content)} className="action-button copy" title="复制">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClipboardItem;
