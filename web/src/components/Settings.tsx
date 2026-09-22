import './Settings.css';
import { PIN_STYLES, type PinStyle } from '../pinStyle';

interface SettingsProps {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  pinStyle: PinStyle;
  onPinStyleChange: (style: PinStyle) => void;
  deviceName: string;
  onDeviceNameChange: (name: string) => void;
  connected: boolean;
  onBack: () => void;
  onLogout: () => void;
}

function Settings({
  theme,
  onThemeChange,
  pinStyle,
  onPinStyleChange,
  deviceName,
  onDeviceNameChange,
  connected,
  onBack,
  onLogout,
}: SettingsProps) {
  return (
    <div className="settings">
      <div className="settings-container">
        <button className="settings-back" onClick={onBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          返回
        </button>

        <h1 className="settings-title">设置</h1>

        <section className="settings-section">
          <h2 className="settings-section-title">外观</h2>
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">夜间模式</span>
              <span className="settings-row-desc">使用深色暖色调界面</span>
            </div>
            <button
              className={`toggle-switch ${theme === 'dark' ? 'on' : ''}`}
              role="switch"
              aria-checked={theme === 'dark'}
              aria-label="夜间模式"
              onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
            >
              <span className="toggle-knob" />
            </button>
          </div>
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">置顶选中样式</span>
              <span className="settings-row-desc">置顶剪切板的几何标识样式</span>
            </div>
            <div className="pin-style-options">
              {PIN_STYLES.map(({ value, label }) => (
                <button
                  key={value}
                  className={`pin-style-option ${pinStyle === value ? 'selected' : ''}`}
                  onClick={() => onPinStyleChange(value)}
                >
                  <span className={`pin-style-swatch ${value}`} />
                  <span className="pin-style-name">{label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">设备名称</span>
              <span className="settings-row-desc">添加条目时记录的来源设备，留空则不记录</span>
            </div>
            <input
              className="settings-input"
              value={deviceName}
              maxLength={100}
              placeholder="我的电脑"
              onChange={(e) => onDeviceNameChange(e.target.value)}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">连接</h2>
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">实时同步</span>
              <span className="settings-row-desc">通过 WebSocket 推送变更</span>
            </div>
            <span className={`connection-badge ${connected ? 'online' : 'offline'}`}>
              <span className="connection-badge-dot" />
              {connected ? '已连接' : '连接中...'}
            </span>
          </div>
        </section>

        <section className="settings-section">
          <h2 className="settings-section-title">账户</h2>
          <div className="settings-row">
            <div className="settings-row-text">
              <span className="settings-row-label">退出登录</span>
              <span className="settings-row-desc">清除本机保存的 API Key</span>
            </div>
            <button className="logout-button" onClick={onLogout}>
              退出
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
