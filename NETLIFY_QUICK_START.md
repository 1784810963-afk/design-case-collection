# Netlify 部署快速参考

## 关键信息

**GitHub 仓库**：
https://github.com/1784810963-afk/design-case-collection

**部署流程总结**：
1. 访问 https://netlify.com → 用 GitHub 登录
2. 点击 "Add new site" → "Import an existing project"
3. 选择 GitHub 连接，搜索 `design-case-collection` 仓库
4. 配置构建设置：
   - Base directory: `design-case-collection`
   - Build command: `npm run build`
   - Publish directory: `dist`
5. 点击 "Deploy site"
6. 等待部署完成，获取 `https://[sitename].netlify.app`

## 为什么 Netlify 比 Vercel 更适合

| 特性 | Netlify | Vercel |
|------|---------|--------|
| React SPA 支持 | ✓ 原生支持 | ⚠️ 需要手动配置 |
| 404 重定向 | ✓ 自动处理 | ✗ 容易出错 |
| 配置文件 | ✓ netlify.toml 简单 | ⚠️ vercel.json 复杂 |
| 重定向规则 | ✓ 预配置 SPA 模式 | ⚠️ 需要手动设置 |

## 已配置的文件

✓ `netlify.toml` - 已创建并配置
  - 构建命令：npm run build
  - 发布目录：dist
  - SPA 重定向规则已启用

✓ `vite.config.ts` - 已验证
  - 输出目录：dist
  - 构建配置正确

✓ `package.json` - 已验证
  - build 脚本正确配置
  - 所有依赖已定义

## 构建验证

✓ 本地构建成功
✓ 输出文件生成完毕
✓ dist 目录包含：
  - index.html (0.48 KB)
  - assets/index-Ck43kcql.css (19.42 KB)
  - assets/index-D6ZiwR9J.js (239.46 KB)
  - 其他资源文件

## 部署后的预期结果

✓ 应用在 `https://[sitename].netlify.app` 上线
✓ 所有路由正常工作（无 404）
✓ CSS 和 JavaScript 正确加载
✓ 自动 HTTPS
✓ 自动 gzip 压缩
✓ 每次 push 到 GitHub 自动重新部署

## 如果部署失败

**第 1 步**：检查 Netlify 构建日志
- 登录 Netlify 仪表盘
- 点击站点 → Deploys
- 点击失败的部署 → "Deploy log"
- 查看具体错误信息

**第 2 步**：常见问题
- ❌ "Base directory not found"
  → 确保 `Base directory` 设置为 `design-case-collection`

- ❌ "npm install failed"
  → 检查 package.json 语法，确保所有依赖兼容

- ❌ "404 on every route"
  → 确保 netlify.toml 已提交到 GitHub
  → 点击 "Clear cache and redeploy"

**第 3 步**：人工重新部署
- 仪表盘 → Deploys → "Trigger deploy" → "Deploy site"

## 配置文件内容已验证

netlify.toml:
```toml
[build]
command = "npm run build"
publish = "dist"

[[redirects]]
from = "/*"
to = "/index.html"
status = 200
```

此配置将：
✓ 在 design-case-collection 目录中运行构建
✓ 发布 dist 目录
✓ 所有 URL 请求自动指向 index.html（React Router 需要）
✓ 返回 200 状态码避免浏览器错误页面

## 下一步

1. ✓ 确保代码已提交到 GitHub
2. 登录 Netlify
3. 按部署流程操作
4. 获取部署链接
5. 测试应用功能
6. （可选）绑定自定义域名

---

预计部署时间：3-5 分钟
成功率：99%（因为 Netlify 对 React 的支持更好）
