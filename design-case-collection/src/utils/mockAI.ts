import type { MockCaseData } from '../types';

// 后端API地址 - 支持环境变量配置
// 开发环境：http://localhost:3001
// 生产环境：使用 Netlify Functions (/.netlify/functions)
const API_BASE_URL = import.meta.env.VITE_API_URL ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : '');

// 验证URL格式 - 接受任何有效的URL
export function validateUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('.');
  } catch {
    return false;
  }
}

// 真实的网页分析 - 调用后端API
export async function analyzeCaseUrl(url: string): Promise<MockCaseData> {
  // 确定 API 路由
  let apiUrl: string;

  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // 开发环境
    apiUrl = `${API_BASE_URL}/api/analyze`;
  } else {
    // 生产环境使用 Netlify Functions
    apiUrl = '/.netlify/functions/analyze';
  }

  console.log('[mockAI] 开始调用后端API:', apiUrl);
  console.log('[mockAI] 请求URL:', url);

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url })
    });

    console.log('[mockAI] 收到响应:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('[mockAI] 解析结果:', result);

    if (!result.success) {
      throw new Error(result.error || '分析失败');
    }

    // 将后端返回的数据转换为前端需要的格式
    const caseData = {
      title: result.data.title || '未知标题',
      author: result.data.author || '未知作者',
      coverImage: result.data.coverImage || 'https://placehold.co/600x400/E0E0E0/666666?text=No+Image',
      aiSummary: result.data.description || '暂无描述',
      aiKeywords: result.data.keywords || []
    };

    console.log('[mockAI] 最终返回的关键词:', caseData.aiKeywords);

    return caseData;
  } catch (error) {
    console.error('分析URL失败:', error);
    throw new Error(error instanceof Error ? error.message : 'AI分析失败，请重试');
  }
}

