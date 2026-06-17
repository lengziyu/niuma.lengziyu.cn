import { tools } from './tools';
import { localizeTool } from './toolLocale';

const zhHeaderNavItems = [
  { key: 'home', label: '首页', path: '/' },
  { key: 'all', label: '工具', path: '/tools' },
  { key: 'favorites', label: '收藏', path: '/favorites' }
];

const enHeaderNavItems = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'all', label: 'Tools', path: '/tools' },
  { key: 'favorites', label: 'Favorites', path: '/favorites' }
];

const zhHeroHotTags = ['图片压缩', '生成二维码', '修改图片尺寸', 'PDF 转 Word'];
const enHeroHotTags = ['Compress', 'QR Code', 'Resize', 'PDF to Word'];

const zhFeatureItems = [
  {
    title: '打开就能用',
    description: '无需注册登录，打开网页就能使用，简单直接。',
    icon: 'instant'
  },
  {
    title: '本地优先处理',
    description: '文件在本地处理，保护你的隐私和数据安全。',
    icon: 'local'
  },
  {
    title: '永久免费',
    description: '所有工具永久免费开放，无需付费也能放心使用。',
    icon: 'free'
  }
];

const enFeatureItems = [
  {
    title: 'Instantly Usable',
    description: 'No signup required. Open and use every tool directly.',
    icon: 'instant'
  },
  {
    title: 'Local-First Processing',
    description: 'Files are processed locally to protect privacy and data.',
    icon: 'local'
  },
  {
    title: 'Always Free',
    description: 'All tools are free to use with no paid lock-ins.',
    icon: 'free'
  }
];

const zhCornerActions = [
  { key: 'coffee', label: '喝一杯', icon: 'coffee' },
  { key: 'relax', label: '10秒放松', icon: 'relax' },
  { key: 'encourage', label: '随机鼓励', icon: 'encourage' }
];

const enCornerActions = [
  { key: 'coffee', label: 'Take a Sip', icon: 'coffee' },
  { key: 'relax', label: '10s Relax', icon: 'relax' },
  { key: 'encourage', label: 'Motivate Me', icon: 'encourage' }
];

export const miniGameBoxes = [
  { type: 'pdf', label: 'PDF文档' },
  { type: 'image', label: 'IMG图片' },
  { type: 'word', label: 'DOC文档' },
  { type: 'sheet', label: 'XLS表格' }
];

export const miniGameFilePool = [
  { type: 'pdf', label: 'PDF' },
  { type: 'image', label: 'PNG' },
  { type: 'image', label: 'JPG' },
  { type: 'image', label: 'WEBP' },
  { type: 'word', label: 'DOC' },
  { type: 'word', label: 'DOCX' },
  { type: 'word', label: 'Word' },
  { type: 'sheet', label: 'XLS' },
  { type: 'sheet', label: 'XLSX' },
  { type: 'sheet', label: 'CSV' },
  { type: 'sheet', label: 'Excel' }
];

const zhMiniGameTips = {
  idle: '拖拽文件到正确箱子里。',
  progress: '拖到正确箱子里。',
  success: '文件终于找到家啦！',
  error: '哎呀，放错箱子啦～',
  finished: '整理好了，继续加油鸭！'
};

const enMiniGameTips = {
  idle: 'Drag files into the correct box.',
  progress: 'Drop it into the right box.',
  success: 'Nice! The file found its place.',
  error: 'Oops, wrong box.',
  finished: 'All sorted. Keep the momentum!'
};

const recommendedToolIds = ['image-compress', 'qr-generator', 'image-resize', 'pdf-to-word'];

const zhToolMetaMap = {
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
  'image-id-photo-bg': {
    title: '证件照换底',
    description: '证件照蓝底、白底、红底快速切换。',
    keywords: ['证件照', '换底色', '蓝底'],
    format: 'ID',
    iconKind: 'imagepdf',
    accent: 'blue'
  },
  'pdf-compress': {
    title: 'PDF压缩',
    description: '清理并压缩 PDF，附件上传更省心。',
    keywords: ['PDF压缩', '文件压缩', '附件'],
    format: 'ZIP',
    iconKind: 'doc',
    accent: 'green'
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
  'pdf-organize': {
    title: 'PDF页面整理',
    description: '删除多余页、重排页序后导出新 PDF。',
    keywords: ['PDF删除页面', 'PDF重排', '页码整理'],
    format: 'PAGES',
    iconKind: 'split',
    accent: 'violet'
  },
  'pdf-unlock': {
    title: 'PDF去密码',
    description: '知道打开密码时，导出一份无密码 PDF。',
    keywords: ['PDF密码', 'PDF解密', '去密码'],
    format: 'UNLOCK',
    iconKind: 'doc',
    accent: 'blue'
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
  'excel-merge-split': {
    title: 'Excel合并拆分',
    description: '多个 XLSX 合并，或按工作表拆成文件。',
    keywords: ['Excel合并', 'Excel拆分', 'Sheet'],
    format: 'XLS',
    iconKind: 'sheet',
    accent: 'blue'
  },
  'json-excel': {
    title: 'JSON转Excel',
    description: '接口数据和表格互转，协作更顺手。',
    keywords: ['JSON', 'Excel', '接口数据'],
    format: 'JSON',
    iconKind: 'sheet',
    accent: 'violet'
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

const enToolMetaMap = {
  'image-compress': {
    title: 'PNG / JPG',
    description: 'Reduce image size while keeping quality.',
    keywords: ['compress image', 'PNG to JPG', 'JPG', 'PNG'],
    format: 'PNG',
    iconKind: 'compress',
    accent: 'violet'
  },
  'image-resize': {
    title: 'Resize',
    description: 'Use common presets for covers, avatars, and posters.',
    keywords: ['resize', 'crop', 'pixel'],
    format: 'SIZE',
    iconKind: 'resize',
    accent: 'blue'
  },
  'image-convert': {
    title: 'Convert Image',
    description: 'Convert PNG, JPG, and WebP formats quickly.',
    keywords: ['format conversion', 'WebP', 'JPG', 'PNG'],
    format: 'IMG',
    iconKind: 'convert',
    accent: 'pink'
  },
  'image-to-pdf': {
    title: 'Image to PDF',
    description: 'Merge multiple images into one PDF.',
    keywords: ['image to PDF', 'screenshot to PDF'],
    format: 'IMG',
    iconKind: 'imagepdf',
    accent: 'amber'
  },
  'image-ocr': {
    title: 'Image OCR',
    description: 'Extract text from screenshots, posters, and scans.',
    keywords: ['OCR', 'text recognition'],
    format: 'OCR',
    iconKind: 'ocr',
    accent: 'violet'
  },
  'image-id-photo-bg': {
    title: 'ID Photo BG',
    description: 'Switch ID photo backgrounds quickly.',
    keywords: ['ID photo', 'background', 'blue background'],
    format: 'ID',
    iconKind: 'imagepdf',
    accent: 'blue'
  },
  'pdf-compress': {
    title: 'Compress PDF',
    description: 'Clean and compress PDF attachments.',
    keywords: ['compress PDF', 'file size', 'attachment'],
    format: 'ZIP',
    iconKind: 'doc',
    accent: 'green'
  },
  'pdf-to-word': {
    title: 'PDF',
    description: 'Convert PDF formats, extract text, split and merge easily.',
    keywords: ['PDF to Word', 'PDF edit', 'document conversion'],
    format: 'PDF',
    iconKind: 'doc',
    accent: 'red'
  },
  'word-to-pdf': {
    title: 'DOC / DOCX',
    description: 'Convert Word docs with stable layout output.',
    keywords: ['Word to PDF', 'DOCX', 'document export'],
    format: 'DOC',
    iconKind: 'doc',
    accent: 'blue'
  },
  'pdf-merge': {
    title: 'Merge Docs',
    description: 'Merge PDFs in sequence into one clean file.',
    keywords: ['merge PDF', 'document merge'],
    format: 'MERGE',
    iconKind: 'merge',
    accent: 'violet'
  },
  'pdf-split': {
    title: 'Split PDF',
    description: 'Split PDFs by page range for easier sharing.',
    keywords: ['split PDF', 'page extract'],
    format: 'SPLIT',
    iconKind: 'split',
    accent: 'amber'
  },
  'pdf-organize': {
    title: 'Organize PDF',
    description: 'Delete or reorder pages before exporting.',
    keywords: ['delete PDF pages', 'reorder PDF', 'page order'],
    format: 'PAGES',
    iconKind: 'split',
    accent: 'violet'
  },
  'pdf-unlock': {
    title: 'Unlock PDF',
    description: 'Remove password protection when you know the password.',
    keywords: ['PDF password', 'unlock PDF', 'decrypt PDF'],
    format: 'UNLOCK',
    iconKind: 'doc',
    accent: 'blue'
  },
  'pdf-to-image': {
    title: 'PDF to Image',
    description: 'Export PDF pages as images for quick sharing.',
    keywords: ['PDF to image', 'PDF screenshot', 'PNG'],
    format: 'PDF',
    iconKind: 'pdfimg',
    accent: 'pink'
  },
  'pdf-watermark': {
    title: 'PDF Watermark',
    description: 'Add watermark labels to drafts and internal files.',
    keywords: ['watermark', 'internal doc'],
    format: 'MARK',
    iconKind: 'watermark',
    accent: 'red'
  },
  'excel-to-csv': {
    title: 'Excel to CSV',
    description: 'Useful for imports, exchange, and batch cleanup.',
    keywords: ['sheet conversion', 'CSV', 'Excel'],
    format: 'XLS',
    iconKind: 'sheet',
    accent: 'green'
  },
  'csv-to-excel': {
    title: 'CSV to Excel',
    description: 'Turn raw CSV into Excel for easier handoff.',
    keywords: ['CSV to Excel', 'sheet'],
    format: 'CSV',
    iconKind: 'sheet',
    accent: 'green'
  },
  'excel-merge-split': {
    title: 'Excel Merge/Split',
    description: 'Merge XLSX files or split workbooks by sheet.',
    keywords: ['merge Excel', 'split Excel', 'sheet'],
    format: 'XLS',
    iconKind: 'sheet',
    accent: 'blue'
  },
  'json-excel': {
    title: 'JSON to Excel',
    description: 'Convert API data and sheets back and forth.',
    keywords: ['JSON', 'Excel', 'API data'],
    format: 'JSON',
    iconKind: 'sheet',
    accent: 'violet'
  },
  'text-dedup': {
    title: 'Text Dedup',
    description: 'Remove duplicates from names and keywords quickly.',
    keywords: ['text process', 'deduplicate'],
    format: 'TXT',
    iconKind: 'text',
    accent: 'violet'
  },
  'qr-generator': {
    title: 'QR Generator',
    description: 'Generate QR codes for links and text with custom styles.',
    keywords: ['QR code', 'share link'],
    format: 'QR',
    iconKind: 'qr',
    accent: 'green'
  },
  'timestamp-convert': {
    title: 'Timestamp',
    description: 'Convert timestamps and dates for logs and APIs.',
    keywords: ['time', 'date', 'log'],
    format: 'TIME',
    iconKind: 'time',
    accent: 'amber'
  }
};

function resolveLocaleData(locale, zhValue, enValue) {
  return locale === 'en' ? enValue : zhValue;
}

function fallbackIconKind(category) {
  if (category.includes('图片') || category.toLowerCase().includes('image')) {
    return 'convert';
  }

  if (category.includes('文档') || category.toLowerCase().includes('document')) {
    return 'doc';
  }

  if (category.includes('表格') || category.toLowerCase().includes('sheet')) {
    return 'sheet';
  }

  return 'qr';
}

function fallbackAccent(category) {
  if (category.includes('图片') || category.toLowerCase().includes('image')) {
    return 'violet';
  }

  if (category.includes('文档') || category.toLowerCase().includes('document')) {
    return 'blue';
  }

  if (category.includes('表格') || category.toLowerCase().includes('sheet')) {
    return 'green';
  }

  return 'pink';
}

export const headerNavItems = zhHeaderNavItems;
export const heroHotTags = zhHeroHotTags;
export const featureItems = zhFeatureItems;
export const cornerActions = zhCornerActions;
export const miniGameTips = zhMiniGameTips;

export function getHeaderNavItems(locale = 'zh') {
  return resolveLocaleData(locale, zhHeaderNavItems, enHeaderNavItems);
}

export function getHeroHotTags(locale = 'zh') {
  return resolveLocaleData(locale, zhHeroHotTags, enHeroHotTags);
}

export function getFeatureItems(locale = 'zh') {
  return resolveLocaleData(locale, zhFeatureItems, enFeatureItems);
}

export function getCornerActions(locale = 'zh') {
  return resolveLocaleData(locale, zhCornerActions, enCornerActions);
}

export function getMiniGameTips(locale = 'zh') {
  return resolveLocaleData(locale, zhMiniGameTips, enMiniGameTips);
}

export function getHomeToolCatalog(locale = 'zh') {
  const metaMap = locale === 'en' ? enToolMetaMap : zhToolMetaMap;

  return tools.map((sourceTool) => {
    const tool = localizeTool(sourceTool, locale);
    const meta = metaMap[tool.id] ?? {};

    return {
      ...tool,
      title: meta.title ?? tool.name,
      description: meta.description ?? tool.tagline,
      keywords: meta.keywords ?? [],
      format: meta.format ?? tool.name.slice(0, 3).toUpperCase(),
      iconKind: meta.iconKind ?? fallbackIconKind(tool.category),
      iconImage: meta.iconImage ?? null,
      accent: meta.accent ?? fallbackAccent(tool.category),
      isRecommended: recommendedToolIds.includes(tool.id),
      recommendedOrder: recommendedToolIds.indexOf(tool.id)
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
