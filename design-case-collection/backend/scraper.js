const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 通用网页内容提取器
 * 提取标题、图片、描述等基本信息
 */
async function scrapeWebPage(url) {
  try {
    console.log(`[Scraper] 开始抓取: ${url}`);

    // 发送请求获取HTML
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
      timeout: 15000, // 15秒超时
      maxRedirects: 5
    });

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

    // 提取作者/设计师
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

    description = description.trim().slice(0, 500); // 限制长度

    // 提取所有图片
    const images = [];

    // 从og:image获取（通常是最佳封面图）
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      try {
        const absoluteUrl = new URL(ogImage, url).href;
        images.push(absoluteUrl);
        console.log(`[Scraper] 找到 og:image: ${absoluteUrl}`);
      } catch (e) {
        console.log(`[Scraper] og:image URL 解析失败: ${ogImage}`);
      }
    }

    // Twitter图片
    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage && !images.includes(twitterImage)) {
      try {
        const absoluteUrl = new URL(twitterImage, url).href;
        images.push(absoluteUrl);
        console.log(`[Scraper] 找到 twitter:image: ${absoluteUrl}`);
      } catch (e) {
        console.log(`[Scraper] twitter:image URL 解析失败: ${twitterImage}`);
      }
    }

    // 从img标签获取
    $('img').each((i, elem) => {
      const src = $(elem).attr('src') || $(elem).attr('data-src') || $(elem).attr('data-lazy-src');
      if (src) {
        // 过滤掉logo、icon等小图
        const width = $(elem).attr('width');
        const height = $(elem).attr('height');

        // 如果没有尺寸信息，或者尺寸足够大，就收集
        if (!width || parseInt(width) > 200) {
          try {
            // 转换相对路径为绝对路径
            const absoluteUrl = new URL(src, url).href;
            if (!images.includes(absoluteUrl)) {
              images.push(absoluteUrl);
            }
          } catch (e) {
            console.log(`[Scraper] 图片URL解析失败: ${src}`);
          }
        }
      }
    });

    // 从background-image CSS属性获取
    $('*').each((i, elem) => {
      const style = $(elem).attr('style');
      if (style) {
        const bgMatch = style.match(/background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/i);
        if (bgMatch && bgMatch[1]) {
          try {
            const absoluteUrl = new URL(bgMatch[1], url).href;
            if (!images.includes(absoluteUrl) && images.length < 5) {
              images.push(absoluteUrl);
            }
          } catch (e) {
            console.log(`[Scraper] 背景图片URL解析失败: ${bgMatch[1]}`);
          }
        }
      }
    });

    // 从picture标签获取
    $('picture').each((i, elem) => {
      $('source', elem).each((j, source) => {
        const srcset = $(source).attr('srcset');
        if (srcset) {
          // srcset可能包含多个URL，提取第一个
          const urlMatch = srcset.match(/^([^\s]+)/);
          if (urlMatch) {
            try {
              const absoluteUrl = new URL(urlMatch[1], url).href;
              if (!images.includes(absoluteUrl)) {
                images.push(absoluteUrl);
              }
            } catch (e) {
              console.log(`[Scraper] picture标签URL解析失败: ${urlMatch[1]}`);
            }
          }
        }
      });
    });

    // 从整个HTML页面中提取所有图片URL（用于动态加载的图片）
    const htmlContent = html;
    const imageUrlPattern = /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|gif|webp)/gi;
    const allUrlsInPage = htmlContent.match(imageUrlPattern);

    if (allUrlsInPage) {
      // 过滤掉小图标和logo（通过URL路径和域名判断）
      allUrlsInPage.forEach(imgUrl => {
        try {
          const urlObj = new URL(imgUrl);
          // 过滤掉明显是icon/logo的图片
          if (!imgUrl.toLowerCase().includes('icon') &&
              !imgUrl.toLowerCase().includes('logo') &&
              !imgUrl.toLowerCase().includes('static/imgs') &&
              !images.includes(imgUrl) &&
              images.length < 20) {
            images.push(imgUrl);
          }
        } catch (e) {
          // 忽略URL解析错误
        }
      });
    }

    console.log(`[Scraper] 总共找到 ${images.length} 张图片`);

    // 选择最佳封面图
    let coverImage = images[0] || '';

    // 如果没有找到图片，使用占位符
    if (!coverImage) {
      console.log(`[Scraper] 未找到任何图片，使用占位符`);
      coverImage = 'https://placehold.co/600x400/E0E0E0/666666?text=No+Image';
    }

    // 提取关键词（从标题和描述中，标题权重更高）
    const keywords = extractKeywords(title, description);
    console.log(`[Scraper] 标题: "${title}"`);
    console.log(`[Scraper] 提取关键词: [${keywords.join(', ')}]`);

    // 识别来源
    const hostname = new URL(url).hostname;
    let source = 'other';
    if (hostname.includes('dribbble')) source = 'dribbble';
    else if (hostname.includes('behance')) source = 'behance';
    else if (hostname.includes('pinterest')) source = 'pinterest';

    console.log(`[Scraper] 提取成功: ${title}`);

    return {
      success: true,
      data: {
        title,
        author,
        coverImage,
        images,
        description,
        keywords,
        source
      }
    };

  } catch (error) {
    console.error(`[Scraper] 抓取失败: ${error.message}`);

    return {
      success: false,
      error: error.message,
      data: {
        title: '无法获取标题',
        author: 'Unknown',
        coverImage: 'https://placehold.co/600x400/FF4D4F/FFFFFF?text=Error',
        images: [],
        description: '无法访问该链接，可能是网络问题或网站限制访问。',
        keywords: [],
        source: 'other'
      }
    };
  }
}

/**
 * 从文本中提取关键词
 * 智能提取品牌名称和空间类型
 */
function extractKeywords(title, description = '') {
  const keywords = [];

  // 1. 从标题中提取品牌名称
  // 常见标题格式：
  // "品牌名 + 地点 + 空间类型" 如："观夏北京旗舰店"、"苹果吉隆坡 TRX 店"
  // "空间名称 / 设计师" 如："Lemaire 成都精品店 / F.O.G. Architecture"

  const titleParts = title.split(/[\/\|｜]/);
  const mainTitle = titleParts[0].trim();

  // 提取英文品牌名（标题开头的单词，大写字母开头）
  // 注意：要在空格或汉字之前停止，避免提取到 "App"
  const englishBrandMatch = mainTitle.match(/^([A-Z][a-zA-Z]+)(?:\s|[\u4e00-\u9fa5])/);
  if (englishBrandMatch) {
    const brand = englishBrandMatch[1].trim();
    // 过滤掉非品牌词
    if (brand && !['The', 'And', 'For', 'With', 'Design', 'Architecture', 'By', 'Store', 'Shop'].includes(brand)) {
      keywords.push(brand);
    }
  }

  // 提取中文品牌名（标题开头的2-4个汉字）
  // 例如："观夏北京旗舰店" -> "观夏"
  //      "苹果吉隆坡 TRX 店" -> "苹果"
  //      "陶瓷工坊" -> "陶瓷"（但这个不是品牌）
  const chineseBrandMatch = mainTitle.match(/^([\u4e00-\u9fa5]{2,4})(?=[\u4e00-\u9fa5\s])/);
  if (chineseBrandMatch) {
    const brand = chineseBrandMatch[1];
    // 排除常见的非品牌词汇（空间类型、方位等）
    const excludeWords = [
      '教育', '办公', '住宅', '商业', '文化', '艺术', '设计',
      '北京', '上海', '广州', '深圳', '成都', '杭州', '南京',
      '现代', '传统', '复古', '时尚', '创意', '新型',
      '陶瓷', '木材', '金属', '玻璃', '混凝土'  // 材料类词汇
    ];

    if (!excludeWords.includes(brand) && !keywords.includes(brand)) {
      // 额外验证：品牌名后面应该有地点或者空间类型
      const restOfTitle = mainTitle.substring(brand.length);
      if (restOfTitle.match(/[\u4e00-\u9fa5]{2,}/) || restOfTitle.includes(' ')) {
        keywords.push(brand);
      }
    }
  }

  // 2. 提取空间类型关键词
  const spaceTypes = {
    // 商业空间
    '旗舰店': ['旗舰店', 'flagship store', 'flagship'],
    '精品店': ['精品店', 'boutique'],
    '快闪店': ['快闪店', 'pop-up store', 'pop up'],
    '展厅': ['展厅', 'showroom'],
    '专卖店': ['专卖店', 'store', '门店'],
    '商场': ['商场', 'mall', 'shopping center'],
    '零售': ['retail'],

    // 餐饮空间
    '餐厅': ['餐厅', 'restaurant'],
    '咖啡厅': ['咖啡厅', '咖啡馆', 'cafe', 'coffee shop'],
    '酒吧': ['酒吧', 'bar', 'pub'],
    '茶室': ['茶室', '茶馆', 'tea house', 'tea room'],

    // 办公空间
    '办公室': ['办公室', '办公空间', 'office'],
    '总部': ['总部', 'headquarters', 'hq'],
    '工作室': ['工作室', 'studio', 'workspace'],
    '联合办公': ['联合办公', 'coworking'],

    // 文化空间
    '博物馆': ['博物馆', 'museum'],
    '美术馆': ['美术馆', 'art gallery', 'gallery'],
    '图书馆': ['图书馆', 'library'],
    '剧院': ['剧院', '剧场', 'theater', 'theatre'],
    '展览': ['展览', 'exhibition'],

    // 住宅空间
    '住宅': ['住宅', 'residence', 'residential'],
    '别墅': ['别墅', 'villa'],
    '公寓': ['公寓', 'apartment'],
    '酒店': ['酒店', 'hotel'],

    // 教育空间
    '学校': ['学校', 'school'],
    '幼儿园': ['幼儿园', 'kindergarten'],
    '培训中心': ['培训中心', 'training center'],
    '教育建筑': ['教育建筑', 'educational'],

    // 其他空间
    '工坊': ['工坊', 'workshop', 'atelier'],
    '会所': ['会所', 'club', 'clubhouse'],
    '装置': ['装置', 'installation'],
    '建筑群': ['建筑群', 'complex']
  };

  const fullText = (title + ' ' + description).toLowerCase();

  // 匹配空间类型（优先从标题匹配）
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

  // 3. 提取设计风格关键词（次要，从完整文本）
  const styleKeywords = {
    '极简主义': ['极简', 'minimalist', 'minimal'],
    '现代风格': ['现代', 'modern', 'contemporary'],
    '工业风': ['工业', 'industrial', 'loft'],
    '北欧风': ['北欧', 'scandinavian', 'nordic'],
    '日式': ['日式', 'japanese', 'zen'],
    '中式': ['中式', 'chinese'],
    '复古': ['复古', 'vintage', 'retro'],
  };

  for (const [label, patterns] of Object.entries(styleKeywords)) {
    for (const pattern of patterns) {
      if (fullText.includes(pattern.toLowerCase())) {
        if (!keywords.includes(label) && keywords.length < 8) {
          keywords.push(label);
          break;
        }
      }
    }
  }

  // 4. 如果关键词太少，补充通用标签（但不要UI/Web设计这类）
  if (keywords.length === 0) {
    keywords.push('空间设计');
  }

  return keywords.slice(0, 8); // 最多8个关键词
}

module.exports = {
  scrapeWebPage
};
