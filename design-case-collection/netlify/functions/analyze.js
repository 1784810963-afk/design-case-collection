const axios = require('axios');
const cheerio = require('cheerio');

// 通用网页内容提取器
async function scrapeWebPage(url) {
  try {
    console.log(`[Scraper] 开始抓取: ${url}`);

    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0'
      },
      timeout: 15000,
      maxRedirects: 5
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // 提取标题
    let title =
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      $('h1').first().text() ||
      '设计案例';

    title = title.trim();

    // 提取作者
    let author =
      $('meta[name="author"]').attr('content') ||
      $('.author').first().text() ||
      $('.designer').first().text() ||
      $('[class*="author"]').first().text() ||
      'Designer';

    author = author.trim();

    // 提取描述
    let description =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      '';

    description = description.trim().substring(0, 500);

    // 提取封面图
    let coverImage =
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      $('img').first().attr('src') ||
      '';

    if (coverImage) {
      coverImage = new URL(coverImage, url).href;
    }

    // 提取关键词
    let keywords = [];
    const keywordsText = $('meta[name="keywords"]').attr('content');
    if (keywordsText) {
      keywords = keywordsText.split(',').map(k => k.trim()).filter(k => k);
    }

    return {
      success: true,
      data: {
        title: title || '设计案例',
        author: author || 'Unknown',
        coverImage: coverImage || 'https://placehold.co/600x400/E0E0E0/666666?text=No+Image',
        description: description || '暂无描述',
        keywords: keywords.slice(0, 5),
        source: 'scraped'
      }
    };
  } catch (error) {
    console.error('[Scraper] 抓取失败:', error.message);
    throw new Error(`无法访问或解析网页: ${error.message}`);
  }
}

// Netlify Function 处理器
exports.handler = async (event) => {
  // 处理 CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const { url } = JSON.parse(event.body || '{}');

    if (!url) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: false,
          error: '请提供URL'
        })
      };
    }

    console.log(`[API] 收到分析请求: ${url}`);

    const result = await scrapeWebPage(url);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('[API] 处理请求失败:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: error.message || '服务器内部错误',
        data: {
          title: '分析失败',
          author: 'Unknown',
          coverImage: 'https://placehold.co/600x400/FF4D4F/FFFFFF?text=Server+Error',
          description: '服务器处理请求时出错，请稍后重试。',
          keywords: [],
          source: 'other'
        }
      })
    };
  }
};
