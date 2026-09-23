import { useEffect, useRef, useState } from 'react';
import './PluginsView.css';
import PopConfirm from './PopConfirm';
import { api } from '../api';
import { parseCvt, CvtParseError } from '../plugins/parseCvt';
import type { Plugin } from '../types';

interface PluginsViewProps {
  onBack: () => void;
}

function PluginsView({ onBack }: PluginsViewProps) {
  const [plugins, setPlugins] = useState<Plugin[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .listPlugins()
      .then(({ plugins: list }) => {
        setPlugins(list);
        setSelectedId((cur) => cur ?? list[0]?.id ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : '加载插件失败'))
      .finally(() => setLoaded(true));
  }, []);

  const reload = async (preferId?: number) => {
    const { plugins: list } = await api.listPlugins();
    setPlugins(list);
    setSelectedId((cur) => {
      if (preferId !== undefined && list.some((p) => p.id === preferId)) return preferId;
      if (list.some((p) => p.id === cur)) return cur;
      return list[0]?.id ?? null;
    });
  };

  const selected = plugins.find((p) => p.id === selectedId) ?? null;

  const handleImport = async (file: File) => {
    setError('');
    setBusy(true);
    try {
      const text = await file.text();
      const { meta, code } = parseCvt(text);
      const { plugin } = await api.createPlugin({ ...meta, code });
      await reload(plugin.id);
    } catch (e) {
      setError(
        e instanceof CvtParseError
          ? `插件解析失败: ${e.message}`
          : e instanceof Error
            ? e.message
            : '导入失败',
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleToggleEnabled = async () => {
    if (!selected) return;
    setError('');
    setBusy(true);
    try {
      await api.updatePlugin(selected.id, { enabled: !selected.enabled });
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setError('');
    setBusy(true);
    try {
      await api.deletePlugin(selected.id);
      await reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : '删除失败');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="plugins">
      <div className="plugins-container">
        <button className="plugins-back" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回
        </button>

        <div className="plugins-head">
          <div>
            <h1 className="plugins-title">插件管理</h1>
            <p className="plugins-sub">
              {loaded ? `${plugins.length} 个插件 · 条目按钮执行当前启用的插件` : '加载中...'}
            </p>
          </div>
          <button
            className="plugins-import-button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            导入 .CVT 插件
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".cvt,text/plain"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImport(file);
            }}
          />
        </div>

        {error && (
          <div className="plugins-error" role="alert">
            {error}
          </div>
        )}

        <div className="plugins-layout">
          <div className="plugins-master">
            {loaded && plugins.length === 0 ? (
              <div className="plugins-empty">
                <p>还没有插件</p>
                <p>点击右上角导入 .CVT 插件开始使用</p>
              </div>
            ) : (
              plugins.map((p) => (
                <button
                  key={p.id}
                  className={`plugins-master-item ${p.id === selectedId ? 'selected' : ''}`}
                  onClick={() => setSelectedId(p.id)}
                >
                  <span className="plugins-master-name">
                    {p.name}
                    {p.enabled && <span className="plugins-tag">启用中</span>}
                  </span>
                  <span className="plugins-master-desc">{p.description}</span>
                  <span className="plugins-master-meta">
                    <span className={`plugins-dot ${p.enabled ? 'on' : 'off'}`} />
                    <span>v{p.version}</span>
                    <span>{p.author}</span>
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="plugins-detail">
            {selected ? (
              <>
                <div className="plugins-card">
                  <div className="plugins-detail-head">
                    <div>
                      <h2 className="plugins-detail-title">{selected.name}</h2>
                      <div className="plugins-author-line">
                        <span className="plugins-avatar">{selected.author.slice(0, 1)}</span>
                        <span className="plugins-author-name">{selected.author}</span>
                        <span className="plugins-version">v{selected.version}</span>
                      </div>
                    </div>
                    {selected.enabled && <span className="plugins-tag">启用中</span>}
                  </div>

                  <p className="plugins-description">{selected.description}</p>

                  <div className="plugins-divider" />

                  <div className="plugins-switch-row">
                    <div>
                      <span className="plugins-switch-label">启用插件</span>
                      <span className="plugins-switch-hint">
                        启用后主界面条目显示插件按钮，再次点击恢复未启用状态
                      </span>
                    </div>
                    <button
                      className={`toggle-switch ${selected.enabled ? 'on' : ''}`}
                      role="switch"
                      aria-checked={selected.enabled}
                      aria-label="启用插件"
                      disabled={busy}
                      onClick={handleToggleEnabled}
                    >
                      <span className="toggle-knob" />
                    </button>
                  </div>

                  <div className="plugins-detail-actions">
                    <PopConfirm title={`确定删除插件「${selected.name}」？`} onConfirm={handleDelete}>
                      <button className="plugins-delete-button" disabled={busy}>
                        删除插件
                      </button>
                    </PopConfirm>
                  </div>
                </div>

                <pre className="plugins-code">{selected.code}</pre>
              </>
            ) : (
              loaded && (
                <div className="plugins-empty">
                  <p>选择左侧插件查看详情</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PluginsView;
