import { useState } from 'react';
import type { ClipboardItem, DuplicateGroup } from '../types';
import ClipboardItemView from './ClipboardItem';
import './ClipboardList.css';

interface ClipboardListProps {
  items: ClipboardItem[];
  loading: boolean;
  dupGroups: DuplicateGroup[] | null;
  onAddItem: (content: string) => void;
  onDeleteItem: (id: number) => void;
  onEditItem: (id: number, newContent: string) => void;
  onCopyItem: (content: string) => void;
  onCheckDuplicates: () => void;
  onClearDuplicates: () => void;
}

function ClipboardList({
  items,
  loading,
  dupGroups,
  onAddItem,
  onDeleteItem,
  onEditItem,
  onCopyItem,
  onCheckDuplicates,
  onClearDuplicates,
}: ClipboardListProps) {
  const [adding, setAdding] = useState(false);
  const [newContent, setNewContent] = useState('');

  const submitNewItem = () => {
    const content = newContent.trim();
    if (!content) return;
    onAddItem(content);
    setNewContent('');
    setAdding(false);
  };

  const duplicateIds = new Set(
    dupGroups?.flatMap((group) => group.items.map((item) => item.id)) ?? [],
  );

  return (
    <div className="clipboard-list-container">
      <div className="clipboard-list-header">
        <h2>剪切板内容</h2>
        <div className="header-actions">
          <button className="check-duplicates-button" onClick={onCheckDuplicates}>
            检查重复
          </button>
          <button className="add-item-button" onClick={() => setAdding((v) => !v)}>
            +
          </button>
        </div>
      </div>

      {adding && (
        <div className="add-item-row">
          <input
            className="add-item-input"
            placeholder="输入要添加的内容"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitNewItem();
              if (e.key === 'Escape') {
                setNewContent('');
                setAdding(false);
              }
            }}
            autoFocus
          />
          <button className="confirm-add-button" onClick={submitNewItem}>添加</button>
        </div>
      )}

      {dupGroups !== null && (
        <div className={`duplicates-banner ${duplicateIds.size > 0 ? 'has-duplicates' : ''}`}>
          {duplicateIds.size > 0
            ? `发现 ${dupGroups.length} 组重复条目，已高亮显示`
            : '未发现重复条目'}
          <button className="clear-duplicates-button" onClick={onClearDuplicates}>
            关闭
          </button>
        </div>
      )}

      <div className="clipboard-items">
        {loading && <div className="empty-state"><p>加载中...</p></div>}
        {!loading &&
          items.map((item) => (
            <ClipboardItemView
              key={item.id}
              item={item}
              duplicate={duplicateIds.has(item.id)}
              onDelete={onDeleteItem}
              onEdit={onEditItem}
              onCopy={onCopyItem}
            />
          ))}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            <p>暂无内容，点击"+"添加</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClipboardList;
