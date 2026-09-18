# OwnMenu Dashboard (商户管理后台)

OwnMenu 多租户在线点餐与商户运营管理系统前端单页应用（React SPA）。

---

## 🛠️ 技术栈

- **框架**: React 18 + React Router 6 + Redux Thunk
- **样式与组件库**: Bootstrap 5, Sass, MetisMenu, Chart.js, Recharts, FullCalendar
- **编辑器与上传**: CKEditor 5, Smart Media Uploader, dnd-kit

---

## 🚀 本地开发快速上手

### 1. 安装依赖
由于部分依赖库版本间存在 peerDependencies 约束，请直接使用 npm 安装（项目已预置 `.npmrc` 中配置 `legacy-peer-deps=true`）：

```bash
npm install
```

### 2. 环境变量配置 (可选)
复制 `.env.example` 为 `.env`：
```bash
cp .env.example .env
```
- **本地联调**：若本地启动了 `OwnMenu-API` 后端服务（运行在 8000 端口），可将 `REACT_APP_API_URL` 留空，系统将自动通过 `src/setupProxy.js` 将 `/api/*` 请求代理转发至 `http://localhost:8000`。
- **连接远程测试服**：若需直连远程 API，配置 `REACT_APP_API_URL=https://<your-api-endpoint>`。

### 3. 启动开发服务
```bash
npm start
```
开发服务器将默认运行在 `http://localhost:3000`。

---

## 📦 生产环境构建与部署

### 本地构建验证
```bash
npm run build
```
编译产物将输出在 `build/` 目录下。

### Render 静态网站 (Static Site) 部署配置

在 Render 控制台创建 **New + -> Static Site**，连接本仓库：

| 配置项 | 推荐值 |
| :--- | :--- |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `build` |

#### 必配项 1：SPA 重写规则（防止子路由刷新 404）
在 **Redirects/Rewrites** 页面添加：
- **Type**: `Rewrite`
- **Source**: `/*`
- **Destination**: `/index.html`

#### 必配项 2：环境变量
在 **Environment** 中添加：
- `REACT_APP_API_URL`: 生产后端 API 地址（例如 `https://api.ownmenu.com`）
- `GENERATE_SOURCEMAP`: `false`（降低构建内存消耗、加速部署、防源码泄露）
