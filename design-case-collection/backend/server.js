const express = require('express');
const cors = require('cors');
const { scrapeWebPage } = require('./scraper');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors()); // 允许跨域请求
app.use(express.json());

// 健康检查接口
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 分析设计案例接口
app.post('/api/analyze', async (req, res) => {
  try {
    const { url } = req.body;

    // 验证URL
    if (!url) {
      return res.status(400).json({
        success: false,
        error: '请提供URL'
      });
    }

    console.log(`[API] 收到分析请求: ${url}`);

    // 模拟延迟（让用户看到加载动画）
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 抓取网页内容
    const result = await scrapeWebPage(url);

    // 返回结果
    res.json(result);

  } catch (error) {
    console.error('[API] 处理请求失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器内部错误',
      data: {
        title: '分析失败',
        author: 'Unknown',
        coverImage: 'https://placehold.co/600x400/FF4D4F/FFFFFF?text=Server+Error',
        images: [],
        description: '服务器处理请求时出错，请稍后重试。',
        keywords: [],
        source: 'other'
      }
    });
  }
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   设计案例收集 - 后端服务已启动        ║
╚════════════════════════════════════════╝

🚀 服务器地址: http://localhost:${PORT}
📡 API端点: http://localhost:${PORT}/api/analyze
✅ 健康检查: http://localhost:${PORT}/health

等待前端连接...
  `);
});

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('未处理的Promise拒绝:', error);
});
