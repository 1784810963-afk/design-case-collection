# Netlify 部署指南 - 设计案例收集应用

## 问题分析
Vercel 部署遇到 404 问题通常是因为 SPA (Single Page Application) 的路由配置。Netlify 对 React SPA 的支持更好，已预配置重定向规则。

## 部署步骤

### 第 1 步：创建 Netlify 账户（如果还没有）
1. 访问 https://netlify.com
2. 点击"Sign up" (注册)
3. 选择"GitHub" 登录方式
4. 授权 GitHub 连接

### 第 2 步：创建新项目
1. 在 Netlify 仪表盘，点击"Add new site"（添加新站点）
2. 选择"Import an existing project"（导入现有项目）
3. 点击"GitHub" 连接器
4. 授权 Netlify 访问你的 GitHub 账户

### 第 3 步：选择仓库
1. 搜索并选择：`design-case-collection`
2. 仓库地址：https://github.com/1784810963-afk/design-case-collection

### 第 4 步：配置构建设置
**重要**：使用以下设置

- **Base directory**: `design-case-collection`（这是项目文件夹）
- **Build command**: `npm run build`
- **Publish directory**: `dist`

**截图示例**：
```
Base directory (optional):        design-case-collection
Build command:                    npm run build
Publish directory:                dist
```

### 第 5 步：部署
1. 点击"Deploy site"（部署站点）
2. Netlify 会自动：
   - 克隆您的 GitHub 仓库
   - 在 `design-case-collection` 文件夹中运行 `npm run build`
   - 使用 `dist` 文件夹作为发布内容
   - 应用 SPA 重定向规则

### 第 6 步：获取站点链接
部署完成后，您会看到：
```
Your site is live at: https://your-site-name.netlify.app
```

## 配置说明

### netlify.toml 文件
已在项目根目录创建 `netlify.toml` 配置文件，包含：

```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

**这个配置的作用**：
- 告诉 Netlify 在 `design-case-collection` 文件夹中执行构建
- 将所有 URL 请求重定向到 `index.html`（解决 React Router 404 问题）
- 状态码 200 确保浏览器不会显示错误

## 可能的问题与解决方案

### 问题 1：构建失败
**检查**：
- Node.js 版本是否正确（需要 20.19+ 或 22.12+）
- `npm install` 是否能成功运行
- `package.json` 中的依赖是否都已安装

**Netlify 构建日志**：在仪表盘 → Deploys → 点击构建 → 查看"Deploy log"

### 问题 2：部署后出现 404
**原因**：重定向规则未生效
**解决**：
- 确保 `netlify.toml` 已提交到 GitHub
- 清除浏览器缓存
- 在 Netlify 仪表盘 → Deploys → 点击"Trigger deploy" 重新部署

### 问题 3：样式或资源加载失败
**检查**：
- 确保发布目录设置正确为 `dist`
- 查看浏览器开发者工具中资源的加载路径

## 验证部署成功

部署完成后，验证以下内容：

1. **访问主页**
   - 打开 `https://your-site-name.netlify.app`
   - 应该能看到应用主页

2. **测试路由**
   - 点击应用中的链接
   - 刷新页面（F5）
   - 应该不会出现 404 错误

3. **查看网络请求**
   - 打开浏览器开发者工具 (F12)
   - Network 标签
   - 所有资源应该返回 200 状态码

## 环境变量（如需要）

如果应用需要环境变量：

1. 在 Netlify 仪表盘 → Site settings → Build & deploy → Environment
2. 添加环境变量
3. 重新部署

## 项目构建信息

- **框架**: React 19
- **构建工具**: Vite
- **样式**: Tailwind CSS
- **类型检查**: TypeScript
- **包管理**: npm
- **输出目录**: dist
- **输出大小**: 约 72 KB (gzip)

## 成功部署后

1. **自定义域名**（可选）
   - Netlify 仪表盘 → Site settings → Domain management
   - 添加自定义域名

2. **启用 HTTPS**
   - Netlify 自动为所有站点启用 SSL 证书

3. **设置自动部署**
   - 每次推送到 main/master 分支时自动部署
   - 在 Netlify 仪表盘中自动配置

## 联系支持

如遇到问题：
- Netlify 文档: https://docs.netlify.com
- Netlify 支持: https://support.netlify.com
- GitHub 问题: https://github.com/1784810963-afk/design-case-collection/issues

---

**预期结果**：
✓ 应用可以访问
✓ 路由正常工作（无 404 错误）
✓ 自动部署配置完成
✓ HTTPS 已启用
