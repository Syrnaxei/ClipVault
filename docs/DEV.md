# 本地开发指南

当前阶段（M1-M3）未容器化，前后端分开启动。

## 一键启动（推荐）

```bash
API_KEY=<你的密钥> bash scripts/dev.sh
```

脚本会自动安装缺失的依赖、同时启动 server（3000）与 web（5173），`Ctrl+C` 一起停止。也可以在项目根目录创建 `.env` 文件（内容 `API_KEY=<密钥>`），脚本会自动读取，之后直接 `bash scripts/dev.sh` 即可。

前后端也可以按下面的方式分别手动启动。

## 前置要求

- Node.js 22+（开发机当前为 v24）
- npm

## 启动 Server（端口 3000）

```bash
cd server
npm install
API_KEY=<你的密钥> npm run dev
```

- 必须通过环境变量 `API_KEY` 提供密钥，缺失时启动直接报错
- 可选环境变量：`PORT`（默认 3000）、`DATA_DIR`（默认 `./data`，SQLite 数据库所在目录）
- `npm run dev` 使用 tsx watch，修改 `server/src` 下任意文件会自动重启服务
- 生产模式：`npm run build && npm start`

## 启动 Web 开发服务器（端口 5173）

```bash
cd web
npm install
npm run dev
```

- 浏览器访问 http://localhost:5173 ，首次进入输入 `API_KEY` 登录（存储于 localStorage）
- `web/vite.config.ts` 已配置代理：`/api` → `http://localhost:3000`，`/ws` → `ws://localhost:3000`，因此前端无需关心后端地址

## 热重载开发流程

1. **后端改动**：编辑 `server/src/**` → tsx watch 自动重启 Node 进程（约 1 秒），前端无需任何操作；但 WS 连接会断开，页面右下角状态点变红，几秒内自动重连并重新拉取数据
2. **前端改动**：编辑 `web/src/**` → Vite HMR 即时生效，组件状态尽量保留，无需手动刷新
3. **改了 `vite.config.ts` 或后端环境变量**：需要手动重启对应进程

## 模拟外部客户端插入（验证实时同步）

server 运行时另开一个终端：

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <你的密钥>" \
  -H "Content-Type: application/json" \
  -d '{"clipboard_uuid":"<剪切板UUID>","content":"hello"}'
```

浏览器中打开的页面应秒级出现该条目（WebSocket 推送）。

可选携带设备来源字段 `device`（设备显示名）与 `device_type`（枚举：`iPhone` / `iPad` / `Mac` / `PC` / `Web`，大小写不敏感，其他值归一化为 `Unknown`）：

```bash
curl -X POST http://localhost:3000/api/items \
  -H "Authorization: Bearer <你的密钥>" \
  -H "Content-Type: application/json" \
  -d '{"clipboard_uuid":"<剪切板UUID>","content":"hello","device":"我的iPhone","device_type":"iPhone"}'
```

- 条目左下角会显示对应的设备图标与设备名
- 不传这两个字段时条目不显示设备信息（兼容旧客户端）
