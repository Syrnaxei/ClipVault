import { useState } from 'react';
import type { ClipboardItem, DuplicateGroup } from '../types';
import ClipboardItemView from './ClipboardItem';
import PopConfirm from './PopConfirm';
import './ClipboardList.css';

interface ClipboardListProps {
  clipboardId: number | null;
  clipboardName: string | null;
  items: ClipboardItem[];
  loading: boolean;
  dupGroups: DuplicateGroup[] | null;
  onAddItem: (content: string) => void;
  onDeleteItem: (id: number) => void;
  onEditItem: (id: number, newContent: string) => void;
  onCopyItem: (content: string) => void;
  onCheckDuplicates: () => void;
  onClearDuplicates: () => void;
  onDeleteClipboard: (id: number) => void;
}

function ClipboardList({
  clipboardId,
  clipboardName,
  items,
  loading,
  dupGroups,
  onAddItem,
  onDeleteItem,
  onEditItem,
  onCopyItem,
  onCheckDuplicates,
  onClearDuplicates,
  onDeleteClipboard,
}: ClipboardListProps) {
  const [expanded, setExpanded] = useState(false);
  const [newContent, setNewContent] = useState('');

  const submitNewItem = () => {
    const content = newContent.trim();
    if (!content || clipboardId === null) return;
    onAddItem(content);
    setNewContent('');
    setExpanded(false);
  };

  const duplicateIds = new Set(
    dupGroups?.flatMap((group) => group.items.map((item) => item.id)) ?? [],
  );

  return (
    <div className="clipboard-list-container">
      <div className="clipboard-list-header">
        <h2>{clipboardName ?? '未选择剪切板'}</h2>
        {clipboardId !== null && (
          <PopConfirm
            title={`确定删除剪切板「${clipboardName}」吗？其中的所有条目都会被删除。`}
            onConfirm={() => onDeleteClipboard(clipboardId)}
          >
            <button className="delete-clipboard-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              删除剪切板
            </button>
          </PopConfirm>
        )}
      </div>

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
            <p>暂无内容，在下方输入框添加</p>
          </div>
        )}
      </div>

      <div className="list-footer">
        <div className="add-item-box">
          <textarea
            className={`add-item-input ${expanded ? 'expanded' : ''}`}
            placeholder={clipboardId !== null ? '输入要添加的内容，Enter 添加，Shift+Enter 换行' : '请先选择剪切板'}
            rows={1}
            value={newContent}
            disabled={clipboardId === null}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitNewItem();
              }
              if (e.key === 'Escape') {
                setNewContent('');
                setExpanded(false);
                e.currentTarget.blur();
              }
            }}
          />
          <button
            className={`add-item-expand ${expanded ? 'expanded' : ''}`}
            onClick={() => setExpanded((v) => !v)}
            title={expanded ? '收起' : '展开'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        </div>
        <button
          className="check-duplicates-button"
          onClick={onCheckDuplicates}
          disabled={clipboardId === null}
        >
          检查重复
        </button>
      </div>
    </div>
  );
}

export default ClipboardList;
