const axios = require('axios');
const cheerio = require('cheerio');

// 通用网页内容提取器 - 增强版
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
        'Cache-Control': 'max-age=0',
        'Referer': 'https://www.google.com/',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none'
      },
      timeout: 20000,
      maxRedirects: 5,
      validateStatus: function (status) {
        return status < 500; // 接受 4xx 和 3xx
      }
    });

    if (response.status >= 400) {
      throw new Error(`服务器返回错误: ${response.status}`);
    }

    const html = response.data;
    const $ = cheerio.load(html);

    // 提取标题（优先级顺序）
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
      $('p').first().text() ||
      '';

    description = description.trim().substring(0, 500);

    // 提取所有图片
    const images = [];

    // 从og:image获取
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      try {
        const absoluteUrl = new URL(ogImage, url).href;
        images.push(absoluteUrl);
      } catch (e) {
        console.log(`[Scraper] og:image 解析失败: ${ogImage}`);
      }
    }

    // Twitter 图片
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage && !images.includes(twitterImage)) {
      try {
        const absoluteUrl = new URL(twitterImage, url).href;
        images.push(absoluteUrl);
      } catch (e) {
        console.log(`[Scraper] twitter:image 解析失败`);
      }
    }

    // 从 img 标签获取
    $('img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
      if (src && !src.includes('data:')) {
        try {
          const absoluteUrl = new URL(src, url).href;
          if (!images.includes(absoluteUrl) && images.length < 20) {
            images.push(absoluteUrl);
          }
        } catch (e) {
          console.log(`[Scraper] img URL 解析失败`);
        }
      }
    });

    // 选择最佳封面图
    let coverImage = images[0] || 'https://placehold.co/600x400/E0E0E0/666666?text=No+Image';

    // 提取关键词
    const keywords = extractKeywords(title, description);
    console.log(`[Scraper] 标题: "${title}"`);
    console.log(`[Scraper] 提取关键词: [${keywords.join(', ')}]`);

    console.log(`[Scraper] 提取成功: ${title}`);

    return {
      success: true,
      data: {
        title: title || '设计案例',
        author: author || 'Unknown',
        coverImage: coverImage || 'https://placehold.co/600x400/E0E0E0/666666?text=No+Image',
        description: description || '暂无描述',
        keywords: keywords || [],
        source: 'scraped'
      }
    };
  } catch (error) {
    console.error('[Scraper] 抓取失败:', error.message);
    throw error;
  }
}

// 从文本中提取关键词
function extractKeywords(title, description = '') {
  const keywords = [];

  const titleParts = title.split(/[\/\|｜]/);
  const mainTitle = titleParts[0].trim();

  // 提取英文品牌名
  const englishBrandMatch = mainTitle.match(/^([A-Z][a-zA-Z]+)(?:\s|[\u4e00-\u9fa5])/);
  if (englishBrandMatch) {
    const brand = englishBrandMatch[1].trim();
    if (brand && !['The', 'And', 'For', 'With', 'Design', 'Architecture', 'By', 'Store', 'Shop'].includes(brand)) {
      keywords.push(brand);
    }
  }

  // 提取中文品牌名
  const chineseBrandMatch = mainTitle.match(/^([\u4e00-\u9fa5]{2,4})(?=[\u4e00-\u9fa5\s])/);
  if (chineseBrandMatch) {
    const brand = chineseBrandMatch[1];
    const excludeWords = [
      '教育', '办公', '住宅', '商业', '文化', '艺术', '设计',
      '北京', '上海', '广州', '深圳', '成都', '杭州', '南京',
      '现代', '传统', '复古', '时尚', '创意', '新型',
      '陶瓷', '木材', '金属', '玻璃', '混凝土'
    ];

    if (!excludeWords.includes(brand) && !keywords.includes(brand)) {
      const restOfTitle = mainTitle.substring(brand.length);
      if (restOfTitle.match(/[\u4e00-\u9fa5]{2,}/) || restOfTitle.includes(' ')) {
        keywords.push(brand);
      }
    }
  }

  // 提取空间类型
  const spaceTypes = {
    '旗舰店': ['旗舰店', 'flagship store', 'flagship'],
    '精品店': ['精品店', 'boutique'],
    '快闪店': ['快闪店', 'pop-up store', 'pop up'],
    '展厅': ['展厅', 'showroom'],
    '专卖店': ['专卖店', 'store', '门店'],
    '餐厅': ['餐厅', 'restaurant'],
    '咖啡厅': ['咖啡厅', '咖啡馆', 'cafe'],
    '办公室': ['办公室', '办公空间', 'office'],
    '博物馆': ['博物馆', 'museum'],
    '酒店': ['酒店', 'hotel'],
  };

  const fullText = (title + ' ' + description).toLowerCase();

  for (const [label, patterns] of Object.entries(spaceTypes)) {
    for (const pattern of patterns) {
      if (title.toLowerCase().includes(pattern.toLowerCase())) {
        if (!keywords.includes(label)) {
          keywords.push(label);
          break;
        }
      }
    }
  }

  if (keywords.length === 0) {
    keywords.push('空间设计');
  }

  return keywords.slice(0, 8);
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
