# 设计案例收集应用 - Demo v1.0

一款AI驱动的设计案例收集工具，帮助设计师快速收集、整理和管理设计灵感。

## 功能特性

- 📝 **智能案例收集**：粘贴设计案例URL，AI自动分析
- 🎨 **封面图提取**：自动选择最佳封面图展示
- 💡 **设计理念概括**：AI生成专业的设计评析（200-300字）
- 🏷️ **提示词生成**：自动提取设计关键词标签
- 💾 **本地持久化**：使用localStorage保存数据
- 🎯 **美观界面**：基于Tailwind CSS的现代化设计
- ⚡ **流畅交互**：骨架屏加载、动画过渡

## 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **状态管理**：React Hooks
- **数据持久化**：LocalStorage

## 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动开发服务器

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:5173 即可查看应用。

### 构建生产版本

\`\`\`bash
npm run build
\`\`\`

## 使用指南

### 添加设计案例

1. 点击右上角的"添加案例"按钮
2. 在弹窗中粘贴设计案例的URL（支持Dribbble、Behance、Pinterest等）
3. 点击"插入并分析"按钮
4. 等待2-3秒，AI将自动分析案例
5. 案例卡片将展示封面图、标题、设计理念和提示词

### 查看案例详情

- **展开/收起设计理念**：点击卡片中的"展开全部 ▼"按钮
- **查看更多标签**：点击标签区域的"+N 更多"按钮

### 访问原网页

点击卡片底部的"访问原网页"按钮，将在新标签页打开原始链接。

### 删除案例

1. 点击卡片底部的"删除"按钮
2. 在确认提示中点击"确定删除"

## Demo说明

当前版本为前端Demo，使用Mock数据模拟AI分析：

- **Mock数据库**：预设了3种不同的案例数据（Dribbble、Behance、Pinterest）
- **模拟延迟**：2-3秒的分析时间，模拟真实AI分析过程
- **本地存储**：案例数据保存在浏览器localStorage中

## 支持的网站

- ✅ Dribbble (dribbble.com)
- ✅ Behance (behance.net)
- ✅ Pinterest (pinterest.com)
- ✅ 其他设计网站（使用默认模板）

## 项目结构

\`\`\`
design-case-collection/
├── src/
│   ├── components/         # React组件
│   │   ├── CaseCard.tsx    # 案例卡片
│   │   ├── AddCaseModal.tsx # 添加案例弹窗
│   │   └── TagList.tsx     # 标签列表
│   ├── hooks/              # 自定义Hooks
│   │   └── useCases.ts     # 案例管理
│   ├── types/              # TypeScript类型
│   │   └── index.ts
│   ├── utils/              # 工具函数
│   │   └── mockAI.ts       # Mock AI分析
│   ├── App.tsx             # 主应用
│   ├── main.tsx            # 入口文件
│   └── index.css           # 样式文件
├── public/                 # 静态资源
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
\`\`\`

## 核心组件

### CaseCard 案例卡片

展示单个设计案例的卡片组件，支持三种状态：

- **Loading**：显示骨架屏加载动画
- **Success**：展示完整的案例信息
- **Error**：显示错误提示和重试按钮

### AddCaseModal 添加案例弹窗

输入URL并触发AI分析的弹窗组件：

- URL验证
- 支持的网站提示
- 加载状态反馈
- 错误处理

### TagList 标签列表

显示案例关键词标签的组件：

- Pill样式设计
- 展开/收起功能（超过6个标签时）
- 悬停交互效果

## 后续扩展计划

- [ ] 集成真实的AI分析API（OpenAI GPT-4V / Claude）
- [ ] 实现富文本编辑器
- [ ] 添加搜索和筛选功能
- [ ] 实现文件夹分类管理
- [ ] 支持拖拽排序
- [ ] 添加后端数据库
- [ ] 支持导出案例数据
- [ ] 开发浏览器插件

## 开发说明

### 添加新的Mock数据

编辑 `src/utils/mockAI.ts` 文件，在 `mockDatabase` 对象中添加新的网站数据：

\`\`\`typescript
const mockDatabase: Record<string, MockCaseData> = {
  'yoursite.com': {
    title: '案例标题',
    author: '作者名称',
    coverImage: '封面图URL',
    aiSummary: '设计理念描述...',
    aiKeywords: ['关键词1', '关键词2']
  }
};
\`\`\`

### 自定义主题色

编辑 `tailwind.config.js` 文件修改配色方案：

\`\`\`javascript
colors: {
  primary: {
    DEFAULT: '#5B7FFF',  // 主色
    light: '#E8F0FF',    // 浅色
    dark: '#4A66CC'      // 深色
  }
}
\`\`\`

## 许可证

MIT

## 作者

Claude Code - AI驱动的开发助手
