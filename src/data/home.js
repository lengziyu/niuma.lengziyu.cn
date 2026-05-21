import { tools } from './tools';

export const headerNavItems = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'all', label: '工具', path: '/tools' },
  { key: 'favorites', label: '收藏', path: '/favorites' }
];

export const heroHotTags = ['PDF转Word', '图片压缩', '生成二维码', 'PDF转图片'];

export const featureItems = [
  {
    title: '打开就能用',
    description: '无需注册登录，打开网页直接开始',
    icon: 'instant'
  },
  {
    title: '本地处理',
    description: '文件不上传服务器，隐私安全有保障',
    icon: 'local'
  },
  {
    title: '永久免费',
    description: '所有工具完全免费，无限制使用',
    icon: 'free'
  }
];

export const cornerActions = [
  { key: 'coffee', label: '喝杯咖啡', icon: 'coffee' },
  { key: 'relax', label: '10秒放松', icon: 'relax' },
  { key: 'encourage', label: '随机鼓励', icon: 'encourage' }
];

export const miniGameBoxes = [
  { type: 'pdf', label: 'PDF文档' },
  { type: 'image', label: 'PNG图片' },
  { type: 'word', label: 'DOC文档' },
  { type: 'sheet', label: 'XLS表格' }
];

export const miniGameFilePool = [
  { type: 'pdf', label: 'PDF' },
  { type: 'image', label: 'PNG' },
  { type: 'word', label: 'DOC' },
  { type: 'sheet', label: 'XLS' }
];

export const miniGameTips = {
  idle: '拖拽文件到正确箱子里。',
  progress: '拖到正确箱子里。',
  success: '文件终于找到家啦！',
  error: '哎呀，放错箱子啦～',
  finished: '整理好了，继续加油鸭！'
};

const recommendedToolIds = ['image-compress', 'pdf-to-word', 'word-to-pdf', 'qr-generator'];

const toolMetaMap = {
  'image-compress': {
    title: 'PNG / JPG',
    description: '压缩图片大小，支持多种格式转换，保持高清不失真。',
    keywords: ['PNG转JPG', '图片压缩', 'JPG', 'PNG'],
    format: 'PNG',
    iconKind: 'compress',
    accent: 'violet'
  },
  'image-resize': {
    title: '修改尺寸',
    description: '常见像素和比例预设一键套用，适合封面、头像和海报。',
    keywords: ['尺寸调整', '裁切', '像素'],
    format: 'SIZE',
    iconKind: 'resize',
    accent: 'blue'
  },
  'image-convert': {
    title: '图片转换',
    description: 'PNG、JPG、WebP 灵活互转，导出更轻巧。',
    keywords: ['格式转换', 'WebP', 'JPG', 'PNG'],
    format: 'IMG',
    iconKind: 'convert',
    accent: 'pink'
  },
  'image-to-pdf': {
    title: '图片转PDF',
    description: '多张图片整理成一个 PDF，报销和归档更省事。',
    keywords: ['图片合成PDF', '截图转PDF'],
    format: 'IMG',
    iconKind: 'imagepdf',
    accent: 'amber'
  },
  'image-ocr': {
    title: '图片转文字',
    description: '截图、海报、扫描件里的文字快速提取。',
    keywords: ['OCR', '识别文字'],
    format: 'OCR',
    iconKind: 'ocr',
    accent: 'violet'
  },
  'pdf-to-word': {
    title: 'PDF',
    description: 'PDF 与多种格式互转，提取文字，拆分合并更轻松。',
    keywords: ['PDF转Word', 'PDF编辑', '文档转换'],
    format: 'PDF',
    iconKind: 'doc',
    accent: 'red'
  },
  'word-to-pdf': {
    title: 'DOC / DOCX',
    description: 'Word 文档在线转换，格式不紊乱，排版更稳定。',
    keywords: ['Word转PDF', 'DOCX', '文档导出'],
    format: 'DOC',
    iconKind: 'doc',
    accent: 'blue'
  },
  'pdf-merge': {
    title: '文档合并',
    description: '多个 PDF 按顺序合并，一个文件发出去更清爽。',
    keywords: ['PDF合并', '文档合并'],
    format: 'MERGE',
    iconKind: 'merge',
    accent: 'violet'
  },
  'pdf-split': {
    title: 'PDF拆分',
    description: '按页码范围拆分文件，节选分享更方便。',
    keywords: ['PDF拆分', '页码提取'],
    format: 'SPLIT',
    iconKind: 'split',
    accent: 'amber'
  },
  'pdf-to-image': {
    title: 'PDF转图片',
    description: '把文档按页导出为图片，转发到群里更直观。',
    keywords: ['PDF转图片', 'PDF截图', 'PNG'],
    format: 'PDF',
    iconKind: 'pdfimg',
    accent: 'pink'
  },
  'pdf-watermark': {
    title: 'PDF加水印',
    description: '给草稿和内部资料添加统一水印标识。',
    keywords: ['水印', '内部资料'],
    format: 'MARK',
    iconKind: 'watermark',
    accent: 'red'
  },
  'excel-to-csv': {
    title: 'Excel转CSV',
    description: '适合系统导入、数据交换和批量整理。',
    keywords: ['表格转换', 'CSV', 'Excel'],
    format: 'XLS',
    iconKind: 'sheet',
    accent: 'green'
  },
  'csv-to-excel': {
    title: 'CSV转Excel',
    description: '把原始 CSV 转回 Excel，交付给同事更顺手。',
    keywords: ['CSV转Excel', '表格'],
    format: 'CSV',
    iconKind: 'sheet',
    accent: 'green'
  },
  'text-dedup': {
    title: '文本去重',
    description: '名单、关键词、标签快速去重，复制即用。',
    keywords: ['文本处理', '去重'],
    format: 'TXT',
    iconKind: 'text',
    accent: 'violet'
  },
  'qr-generator': {
    title: '生成二维码',
    description: '链接、文本一键生成二维码，美观清晰，可自定义样式。',
    keywords: ['二维码', '链接分享'],
    format: 'QR',
    iconKind: 'qr',
    accent: 'green'
  },
  'timestamp-convert': {
    title: '时间戳转换',
    description: '时间戳和日期互转，查日志和调接口更方便。',
    keywords: ['时间', '日期', '日志'],
    format: 'TIME',
    iconKind: 'time',
    accent: 'amber'
  }
};

function fallbackIconKind(category) {
  if (category.includes('图片')) {
    return 'convert';
  }

  if (category.includes('文档')) {
    return 'doc';
  }

  if (category.includes('表格')) {
    return 'sheet';
  }

  return 'qr';
}

function fallbackAccent(category) {
  if (category.includes('图片')) {
    return 'violet';
  }

  if (category.includes('文档')) {
    return 'blue';
  }

  if (category.includes('表格')) {
    return 'green';
  }

  return 'pink';
}

export function getHomeToolCatalog() {
  return tools.map((tool) => {
    const meta = toolMetaMap[tool.id] ?? {};

    return {
      ...tool,
      title: meta.title ?? tool.name,
      description: meta.description ?? tool.tagline,
      keywords: meta.keywords ?? [],
      format: meta.format ?? tool.name.slice(0, 3).toUpperCase(),
      iconKind: meta.iconKind ?? fallbackIconKind(tool.category),
      iconImage: meta.iconImage ?? null,
      accent: meta.accent ?? fallbackAccent(tool.category),
      isRecommended: recommendedToolIds.includes(tool.id)
    };
  });
}

export function matchesToolSearch(tool, keyword) {
  if (!keyword) {
    return true;
  }

  const text = [
    tool.name,
    tool.title,
    tool.category,
    tool.description,
    tool.tagline,
    ...tool.keywords
  ]
    .join(' ')
    .toLowerCase();

  return text.includes(keyword.toLowerCase());
}
