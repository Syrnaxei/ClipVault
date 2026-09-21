import { useEffect, useRef, useState } from 'react';
import type { Clipboard, ClipboardItem, DuplicateGroup } from '../types';
import ClipboardItemView from './ClipboardItem';
import ClipboardEditModal from './ClipboardEditModal';
import PopConfirm from './PopConfirm';
import './ClipboardList.css';

interface ClipboardListProps {
  clipboard: Clipboard | null;
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
  onUpdateClipboard: (id: number, data: { name: string; uuid: string }) => Promise<void>;
  onTogglePinned: (id: number, pinned: boolean) => Promise<void>;
}

function ClipboardList({
  clipboard,
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
  onUpdateClipboard,
  onTogglePinned,
}: ClipboardListProps) {
  const [expanded, setExpanded] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocMouseDown = (e: MouseEvent) => {
      if (actionsRef.current?.contains(e.target as Node)) return;
      setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setEditModalOpen(false);
  }, [clipboard?.id]);

  const submitNewItem = () => {
    const content = newContent.trim();
    if (!content || clipboard === null) return;
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
        <h2>{clipboard?.name ?? '未选择剪切板'}</h2>
        {clipboard !== null && (
          <div className={`header-actions ${menuOpen ? 'open' : ''}`} ref={actionsRef}>
            <button
              className="menu-toggle"
              onClick={() => setMenuOpen((v) => !v)}
              title={menuOpen ? '收起' : '更多操作'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="5" cy="12" r="1.8"></circle>
                <circle cx="12" cy="12" r="1.8"></circle>
                <circle cx="19" cy="12" r="1.8"></circle>
              </svg>
            </button>
            <button
              className={`menu-action pin ${clipboard.pinned ? 'active' : ''}`}
              onClick={() => {
                onTogglePinned(clipboard.id, !clipboard.pinned);
                setMenuOpen(false);
              }}
              title={clipboard.pinned ? '取消置顶' : '置顶'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 17v5"></path>
                <path d="M9 10.76V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3.76a2 2 0 0 0 .59 1.42l1.82 1.82a1 1 0 0 1-.71 1.71H7.3a1 1 0 0 1-.71-1.71l1.82-1.82a2 2 0 0 0 .59-1.42z"></path>
              </svg>
            </button>
            <button
              className="menu-action edit"
              onClick={() => {
                setEditModalOpen(true);
                setMenuOpen(false);
              }}
              title="编辑"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <PopConfirm
              title={`确定删除剪切板「${clipboard.name}」吗？其中的所有条目都会被删除。`}
              onConfirm={() => onDeleteClipboard(clipboard.id)}
            >
              <button className="menu-action delete" title="删除">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </PopConfirm>
          </div>
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
            placeholder={clipboard !== null ? '输入要添加的内容，Enter 添加，Shift+Enter 换行' : '请先选择剪切板'}
            rows={1}
            value={newContent}
            disabled={clipboard === null}
            onChange={(e) => setNewContent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitNewItem();
              }
              if (e.key === 'Enter' && e.shiftKey) {
                setExpanded(true);
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
          disabled={clipboard === null}
        >
          检查重复
        </button>
      </div>

      {editModalOpen && clipboard !== null && (
        <ClipboardEditModal
          clipboard={clipboard}
          onCancel={() => setEditModalOpen(false)}
          onSave={async (data) => {
            await onUpdateClipboard(clipboard.id, data);
            setEditModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

export default ClipboardList;
