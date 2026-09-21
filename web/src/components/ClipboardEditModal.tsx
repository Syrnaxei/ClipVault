import { useEffect, useState } from 'react';
import type { Clipboard } from '../types';
import './ClipboardEditModal.css';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

interface ClipboardEditModalProps {
  clipboard: Clipboard;
  onCancel: () => void;
  onSave: (data: { name: string; uuid: string }) => Promise<void>;
}

function ClipboardEditModal({ clipboard, onCancel, onSave }: ClipboardEditModalProps) {
  const [name, setName] = useState(clipboard.name);
  const [uuid, setUuid] = useState(clipboard.uuid);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel, saving]);

  const submit = async () => {
    if (!name.trim()) {
      setError('请输入剪切板名称');
      return;
    }
    if (!uuid.trim()) {
      setError('请输入 UUID');
      return;
    }
    if (!UUID_RE.test(uuid.trim())) {
      setError('UUID 格式不正确');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({ name: name.trim(), uuid: uuid.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试');
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && !saving && onCancel()}>
      <div className="modal-card" role="dialog" aria-modal="true">
        <h3 className="modal-title">{clipboard.name}</h3>
        <div className="modal-field">
          <label className="modal-label" htmlFor="clipboard-name-input">剪切板名称</label>
          <input
            id="clipboard-name-input"
            className="modal-input"
            value={name}
            maxLength={255}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            autoFocus
          />
        </div>
        <div className="modal-field">
          <label className="modal-label" htmlFor="clipboard-uuid-input">剪切板 UUID</label>
          <input
            id="clipboard-uuid-input"
            className="modal-input modal-input-mono"
            value={uuid}
            onChange={(e) => {
              setUuid(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            spellCheck={false}
          />
          <p className="modal-hint">供外部 API 调用时标识此剪切板</p>
        </div>
        {error && <div className="modal-error">{error}</div>}
        <div className="modal-actions">
          <button className="modal-cancel" onClick={onCancel} disabled={saving}>
            取消
          </button>
          <button className="modal-confirm" onClick={submit} disabled={saving}>
            确认
          </button>
        </div>
      </div>
    </div>
  );
}

export default ClipboardEditModal;
