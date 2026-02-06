# Netlify 部署 - 操作指南（做什么 vs 不要做什么）

---

## 填写构建设置时

### ✓ DO（要这样做）

#### Base directory
```
✓ 填写: design-case-collection
✓ 这是项目文件夹的名称
✓ GitHub 仓库里的文件夹结构：
  repo-root/
  └── design-case-collection/    ← 这个！
      ├── src/
      ├── package.json
      └── netlify.toml
```

#### Build command
```
✓ 填写: npm run build
✓ 这是 package.json 中定义的脚本
✓ 会执行：
  1. tsc -b (TypeScript 编译)
  2. vite build (打包)
  3. 生成 dist 文件夹
```

#### Publish directory
```
✓ 填写: dist
✓ 这是构建输出文件夹
✓ 相对于 Base directory 的路径
✓ 内容包括：
  - index.html
  - assets/
  - 其他资源文件
```

---

### ❌ DON'T（不要这样做）

#### ❌ Base directory 常见错误

```
❌ 不要填: ./design-case-collection
   理由：路径前缀不需要

❌ 不要填: design-case-collection/
   理由：末尾不需要斜杠

❌ 不要填空
   理由：会在根目录找不到文件

❌ 不要填: /
   理由：项目不在根目录

❌ 不要填: dist
   理由：dist 在 design-case-collection 里面
```

#### ❌ Build command 常见错误

```
❌ 不要填: npm install && npm run build
   理由：Netlify 自动运行 npm install

❌ 不要填: npm build
   理由：应该是 npm run build（run 很重要）

❌ 不要填: build
   理由：需要 npm run 前缀

❌ 不要填: tsc && vite build
   理由：应该用 package.json 中的脚本

❌ 不要填: yarn build
   理由：项目用的是 npm
```

#### ❌ Publish directory 常见错误

```
❌ 不要填: design-case-collection/dist
   理由：应该是相对于 Base directory 的路径

❌ 不要填: ./dist
   理由：不需要 ./ 前缀

❌ 不要填: /dist
   理由：不需要前导斜杠

❌ 不要填: build
   理由：输出目录是 dist，不是 build

❌ 不要填空
   理由：Netlify 不知道发布哪个文件夹
```

---

## 部署时

### ✓ DO（要这样做）

#### 准备工作
```
✓ 确认代码已推送到 GitHub
  $ git push

✓ 打开浏览器访问 netlify.com
  https://netlify.com

✓ 用 GitHub 账号登录
  选择 GitHub 登录方式

✓ 给予 Netlify 访问权限
  授权 GitHub 连接
```

#### 创建项目
```
✓ 点击 "Add new site"

✓ 选择 "Import an existing project"

✓ 选择 "GitHub"

✓ 选择正确的仓库
  1784810963-afk/design-case-collection
```

#### 填写信息
```
✓ 检查所有字段都正确填写

✓ 点击 "Deploy site" 按钮

✓ 等待 Netlify 自动构建
  通常需要 3-5 分钟
```

#### 验证部署
```
✓ 看到绿色对勾表示成功

✓ 复制部署链接
  https://your-site.netlify.app

✓ 访问链接测试应用

✓ 点击导航、刷新页面测试路由

✓ 按 F12 检查控制台无错误
```

---

### ❌ DON'T（不要这样做）

#### ❌ 填写错误信息
```
❌ 不要乱填字段
   后果：构建失败，浪费时间

❌ 不要复制别人的配置
   理由：每个项目不同

❌ 不要跳过任何字段
   理由：所有字段都必填
```

#### ❌ 部署时的错误
```
❌ 不要在代码未推送时部署
   理由：Netlify 看不到最新代码

❌ 不要修改 netlify.toml 然后忘记推送
   理由：Netlify 会使用老版本

❌ 不要同时改代码和部署
   理由：容易出现不同步的情况

❌ 不要点击多次 "Deploy site"
   理由：多个构建会互相冲突
```

#### ❌ 验证时的错误
```
❌ 不要只看首页就觉得成功了
   理由：需要测试路由和交互

❌ 不要忽略浏览器控制台的错误
   理由：错误说明有问题

❌ 不要在 24 小时内放弃
   理由：Netlify 缓存可能需要时间

❌ 不要清除浏览器缓存后就假设成功
   理由：需要多个浏览器验证
```

---

## 部署后

### ✓ DO（要这样做）

#### 立即验证
```
✓ 访问部署链接
  https://your-site.netlify.app

✓ 点击各个导航链接
  确保路由正常

✓ 刷新页面（按 F5）
  非常重要！检查是否 404

✓ 检查页面样式
  CSS 应该正确应用

✓ 打开浏览器开发者工具（F12）
  Console 标签应该无红色错误
```

#### 长期维护
```
✓ 定期更新代码
  Netlify 会自动重新部署

✓ 监控构建日志
  如果失败，及时修复

✓ 检查性能指标
  使用 Netlify Analytics

✓ 设置备份
  GitHub 即是最好的备份
```

---

### ❌ DON'T（不要这样做）

#### ❌ 部署后的常见错误
```
❌ 不要立即分享链接
   理由：先验证功能正常

❌ 不要只测试一次就觉得完成
   理由：需要彻底验证

❌ 不要忽视浏览器的警告（黄色）
   理由：可能导致功能异常

❌ 不要只用手机测试
   理由：需要在多个设备测试
```

#### ❌ 长期维护的错误
```
❌ 不要随意删除旧部署
   理由：可能需要回滚

❌ 不要忽视构建失败通知
   理由：可能影响用户体验

❌ 不要修改 Base directory 或 Publish directory
   理由：会破坏部署流程

❌ 不要手动删除 netlify.toml
   理由：会丧失 SPA 路由支持
```

---

## 遇到问题时

### ✓ DO（要这样做）

```
✓ 查看 Netlify 构建日志
  Dashboard → Deployments → 点击部署 → Deploy log

✓ 搜索红色错误信息
  找到具体的错误原因

✓ 检查本地构建
  $ cd design-case-collection
  $ npm run build
  如果本地成功，Netlify 也会成功

✓ 清除缓存后重试
  浏览器：Ctrl+Shift+Delete
  Netlify：点击 "Clear cache and redeploy"

✓ 查阅相关文档
  - NETLIFY_STEP_BY_STEP.md
  - NETLIFY_QUICK_START.md
  - https://docs.netlify.com
```

---

### ❌ DON'T（不要这样做）

```
❌ 不要乱修改配置后再尝试
   理由：会更混乱

❌ 不要放弃并回到 Vercel
   理由：这次会成功！

❌ 不要修改 netlify.toml 而不理解后果
   理由：可能破坏配置

❌ 不要在不理解错误的情况下删除文件
   理由：可能导致更多问题

❌ 不要跳过检查构建日志
   理由：日志包含所有关键信息
```

---

## 快速检查表

### 部署前（最后的检查）

- [ ] ✓ 代码已推送到 GitHub
- [ ] ✓ netlify.toml 在 design-case-collection 文件夹里
- [ ] ✓ 已读完 NETLIFY_STEP_BY_STEP.md
- [ ] ✓ Netlify 账户已登录

### 部署时（填写字段）

- [ ] ✓ Base directory: `design-case-collection`
- [ ] ✓ Build command: `npm run build`
- [ ] ✓ Publish directory: `dist`
- [ ] ✓ 没有其他修改

### 部署后（验证清单）

- [ ] ✓ 访问部署链接成功
- [ ] ✓ 页面样式正确显示
- [ ] ✓ 点击导航链接工作
- [ ] ✓ 刷新页面无 404
- [ ] ✓ 浏览器控制台无红色错误

---

## 最常犯的 3 个错误

### 错误 1：Base directory 填错（50% 的用户会犯）
```
❌ 错误示例：填写 "./design-case-collection"

✓ 正确做法：填写 "design-case-collection"

💡 记住：不需要路径前缀
```

### 错误 2：只验证首页就觉得成功（30% 的用户会犯）
```
❌ 错误示例：看到主页就关闭浏览器

✓ 正确做法：
  1. 点击导航链接
  2. 刷新页面（F5）
  3. 按 F12 检查控制台

💡 记住：刷新页面是最关键的测试！
```

### 错误 3：没有推送代码就部署（20% 的用户会犯）
```
❌ 错误示例：在本地修改后直接点 Deploy

✓ 正确做法：
  1. git add .
  2. git commit -m "message"
  3. git push
  4. 然后在 Netlify 部署

💡 记住：Netlify 从 GitHub 获取代码
```

---

## 总结

### 三个最重要的字段
1. **Base directory**: `design-case-collection`
2. **Build command**: `npm run build`
3. **Publish directory**: `dist`

### 三个最关键的验证
1. 访问部署链接
2. 点击导航链接
3. 刷新页面（F5）

### 三个最容易犯的错误
1. Base directory 填错
2. 只测试首页
3. 代码未推送

---

**记住这些要点，部署就会一次成功！✅**

现在打开 https://netlify.com，按照正确的步骤操作吧！🚀
