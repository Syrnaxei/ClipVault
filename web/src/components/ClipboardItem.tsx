import { useState } from 'react';
import type { ClipboardItem } from '../types';
import './ClipboardItem.css';

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
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="edit-input"
            autoFocus
          />
          <div className="edit-actions">
            <button onClick={handleSave} className="save-button">保存</button>
            <button onClick={handleCancel} className="cancel-button">取消</button>
          </div>
        </div>
      ) : (
        <div className="view-mode">
          <span className="content-text">{item.content}</span>
          <div className="action-buttons">
            <button onClick={handleEdit} className="action-button edit" title="编辑">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button onClick={() => onDelete(item.id)} className="action-button delete" title="删除">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
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
