import { useState } from 'react';
import type { Clipboard } from '../types';
import './Sidebar.css';

interface SidebarProps {
  clipboards: Clipboard[];
  activeId: number | null;
  connected: boolean;
  onSelectClipboard: (id: number) => void;
  onAddClipboard: () => void;
  onDeleteClipboard: (id: number) => void;
}

function Sidebar({
  clipboards,
  activeId,
  connected,
  onSelectClipboard,
  onAddClipboard,
  onDeleteClipboard,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = clipboards.filter((clipboard) =>
    clipboard.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="sidebar">
      <div className={`connection-status ${connected ? 'online' : 'offline'}`}>
        <span className="status-dot" />
        {connected ? '已连接' : '连接中...'}
      </div>

      <div className="search-box">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          placeholder="搜索剪切板"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="clipboard-list">
        {filtered.map((clipboard) => (
          <div
            key={clipboard.id}
            className={`clipboard-item ${activeId === clipboard.id ? 'active' : ''}`}
            onClick={() => onSelectClipboard(clipboard.id)}
          >
            <div className="clipboard-info">
              <span className="clipboard-name">{clipboard.name}</span>
              <div className="clipboard-meta">
                <span className="clipboard-time">
                  {clipboard.latest_item_at
                    ? new Date(clipboard.latest_item_at).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '暂无内容'}
                </span>
                <span className="clipboard-preview">
                  {clipboard.item_count ?? 0} 条
                </span>
              </div>
            </div>
            <button
              className="delete-button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClipboard(clipboard.id);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        ))}
      </div>

      <button className="add-button" onClick={onAddClipboard}>
        +
      </button>
    </div>
  );
}

export default Sidebar;
