export const tools = [
  {
    id: 'image-compress',
    name: '图片压缩',
    category: '图片处理',
    inputMode: 'file',
    tagline: '活动海报、汇报截图、报名表附件，先瘦身再发。',
    description:
      '参考常见在线压缩工具的顺手流程，支持拖拽上传、批量排队和本地处理语气。',
    actionLabel: '开始压缩',
    successMessage: '图片已经压好，可以继续下载或重新调整压缩强度。',
    inputLabel: '拖拽 PNG、JPG、WebP 到这里，或者点一下选文件',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'quality',
        label: '压缩强度',
        type: 'segmented',
        options: ['轻一点', '平衡', '更省体积'],
        defaultValue: '平衡'
      },
      {
        id: 'limit',
        label: '目标大小',
        type: 'select',
        options: ['保持画质优先', '控制在 2MB 内', '控制在 1MB 内'],
        defaultValue: '控制在 2MB 内'
      }
    ],
    tips: [
      '支持批量处理，适合邮件附件、企业微信和投递系统上传前准备。',
      '默认优先压缩图片体积，不走“上传云端”的夸张表达，整体更像真实办公产品。',
      '后续可继续接入真实压缩逻辑、打包下载和前后对比预览。'
    ],
    sampleFile: {
      name: '周报封面-v3.png',
      origin: '4.8 MB',
      result: '1.6 MB',
      status: '已准备好'
    },
    related: ['image-resize', 'image-convert', 'image-to-pdf']
  },
  {
    id: 'image-resize',
    name: '修改图片尺寸',
    category: '图片处理',
    inputMode: 'file',
    tagline: '公众号头图、工牌照片、报名封面，一键改好尺寸。',
    description:
      '常用比例和像素预设都先帮你备好，减少来回试错。',
    actionLabel: '生成新尺寸',
    successMessage: '新尺寸已经准备好，确认预设无误后就可以导出。',
    inputLabel: '上传需要调整尺寸的图片，支持批量排队',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'preset',
        label: '尺寸预设',
        type: 'select',
        options: ['公众号封面 900×383', '工牌照 358×441', '自定义尺寸'],
        defaultValue: '公众号封面 900×383'
      },
      {
        id: 'fit',
        label: '适配方式',
        type: 'segmented',
        options: ['完整显示', '居中裁切', '拉伸填满'],
        defaultValue: '完整显示'
      }
    ],
    tips: [
      '适合活动报名、商城素材、社群配图尺寸统一。',
      '后续可继续接入裁切框、自定义像素输入和批量改尺寸。'
    ],
    sampleFile: {
      name: '活动主视觉.jpg',
      origin: '1600 × 1200',
      result: '900 × 383',
      status: '等待生成'
    },
    related: ['image-compress', 'image-convert', 'qr-generator']
  },
  {
    id: 'image-convert',
    name: '图片格式转换',
    category: '图片处理',
    inputMode: 'file',
    tagline: 'PNG、JPG、WebP 来回切，不必为了导出开大软件。',
    description:
      '适合素材格式调整、上传兼容处理和页面资源优化。',
    actionLabel: '开始转换',
    successMessage: '格式转换已完成，导出前可以继续切换目标格式。',
    inputLabel: '上传图片后选择要导出的格式',
    accept: '.png,.jpg,.jpeg,.webp,.avif',
    formats: ['PNG', 'JPG', 'WebP', 'AVIF'],
    settings: [
      {
        id: 'target',
        label: '导出格式',
        type: 'segmented',
        options: ['PNG', 'JPG', 'WebP'],
        defaultValue: 'WebP'
      },
      {
        id: 'background',
        label: '透明背景处理',
        type: 'select',
        options: ['保留透明', '自动铺白底', '自动铺浅灰底'],
        defaultValue: '保留透明'
      }
    ],
    tips: [
      '适合网页资源优化和常见系统上传兼容。',
      '透明图转 JPG 时建议自动铺底色，避免导出异常。'
    ],
    sampleFile: {
      name: 'logo-final.webp',
      origin: 'WebP',
      result: 'PNG',
      status: '可导出'
    },
    related: ['image-compress', 'image-resize', 'pdf-to-image']
  },
  {
    id: 'image-to-pdf',
    name: '图片转 PDF',
    category: '图片处理',
    inputMode: 'file',
    tagline: '截图、扫描件、票据照片，整理成一个 PDF 再发更省心。',
    description:
      '适合报销票据、会议材料和截图归档，上传多张图片后统一导出。',
    actionLabel: '导出 PDF',
    successMessage: 'PDF 已准备好，可以继续调整排序后再导出。',
    inputLabel: '上传一张或多张图片，按顺序合成 PDF',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'page',
        label: '页面尺寸',
        type: 'select',
        options: ['自适应内容', 'A4 纵向', 'A4 横向'],
        defaultValue: 'A4 纵向'
      },
      {
        id: 'margin',
        label: '页边距',
        type: 'segmented',
        options: ['紧凑', '标准'],
        defaultValue: '标准'
      }
    ],
    tips: [
      '适合票据整理、扫描件归档和汇报截图打包。',
      '后续可支持拖拽排序和页码连续导出。'
    ],
    sampleFile: {
      name: '报销票据 4 张',
      origin: '4 张图片',
      result: '1 个 PDF',
      status: '待导出'
    },
    related: ['pdf-merge', 'pdf-to-image', 'image-compress']
  },
  {
    id: 'image-ocr',
    name: '图片转文字',
    category: '图片处理',
    inputMode: 'file',
    tagline: '海报文案、截图说明、扫描件里的字，提出来继续改。',
    description:
      '适合从海报、表格截图和扫描图片里快速提取文字内容。',
    actionLabel: '提取文字',
    successMessage: '文字内容已提取，可以继续复制整理。',
    inputLabel: '上传需要识别的图片，支持单张或多张排队',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'language',
        label: '识别语言',
        type: 'select',
        options: ['中文优先', '中英混排'],
        defaultValue: '中文优先'
      },
      {
        id: 'layout',
        label: '版式保留',
        type: 'segmented',
        options: ['纯文本', '尽量保留段落'],
        defaultValue: '尽量保留段落'
      }
    ],
    tips: [
      '适合截图文案复用、扫描件录入和图片资料摘录。',
      '后续可支持 OCR 结果校对和导出 TXT / DOCX。'
    ],
    sampleFile: {
      name: '会议纪要截图.png',
      origin: '1 张图片',
      result: '文本结果',
      status: '待识别'
    },
    related: ['pdf-to-word', 'image-compress', 'text-dedup']
  },
  {
    id: 'pdf-to-word',
    name: 'PDF 转 Word',
    category: '文档转换',
    inputMode: 'file',
    tagline: '收到 PDF 版材料还要改字时，先转成可编辑稿。',
    description:
      '用于方案、制度、合同等常见办公文档的可编辑处理入口。',
    actionLabel: '开始转换',
    successMessage: '可编辑文档已经准备好，继续校对版式即可。',
    inputLabel: '上传 PDF 文档后生成可编辑 Word',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'layout',
        label: '版式优先',
        type: 'segmented',
        options: ['尽量还原', '文本可编辑优先'],
        defaultValue: '尽量还原'
      },
      {
        id: 'language',
        label: '文档语言',
        type: 'select',
        options: ['中文为主', '中英混排'],
        defaultValue: '中文为主'
      }
    ],
    tips: [
      '适合需要继续修改内容的办公材料。',
      '扫描件建议后续配合 OCR 能力一起接入。'
    ],
    sampleFile: {
      name: '客户修改意见.pdf',
      origin: '12 页',
      result: 'DOCX',
      status: '待转换'
    },
    related: ['word-to-pdf', 'pdf-merge', 'image-ocr']
  },
  {
    id: 'word-to-pdf',
    name: 'Word 转 PDF',
    category: '文档转换',
    inputMode: 'file',
    tagline: '定稿要发领导、发客户、发打印店时，统一导成 PDF。',
    description:
      '适合汇报材料、合同终稿、报名表和培训讲义的稳定输出。',
    actionLabel: '导出 PDF',
    successMessage: 'PDF 已生成，版式和分页可以继续复查。',
    inputLabel: '上传 Word 文档后输出稳定版 PDF',
    accept: '.doc,.docx',
    formats: ['DOC', 'DOCX'],
    settings: [
      {
        id: 'quality',
        label: '导出质量',
        type: 'segmented',
        options: ['标准', '清晰打印'],
        defaultValue: '标准'
      },
      {
        id: 'mode',
        label: '版式模式',
        type: 'select',
        options: ['保持原分页', '自动适应 A4'],
        defaultValue: '保持原分页'
      }
    ],
    tips: [
      '适合终稿输出和跨设备分享。',
      '后续可接入批量导出和页眉页脚检查。'
    ],
    sampleFile: {
      name: '月度复盘.docx',
      origin: 'DOCX',
      result: 'PDF',
      status: '待导出'
    },
    related: ['pdf-to-word', 'pdf-merge', 'excel-to-csv']
  },
  {
    id: 'pdf-merge',
    name: 'PDF 合并',
    category: '文档转换',
    inputMode: 'file',
    tagline: '合同附件、报名材料、审批文件，一次整理成一个包。',
    description:
      '按顺序拖放多个 PDF，统一整理后导出，适合提交流程使用。',
    actionLabel: '合并文档',
    successMessage: '合并文件已准备好，顺序确认后就能导出。',
    inputLabel: '上传多个 PDF，按顺序合并成一个文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'order',
        label: '排序方式',
        type: 'segmented',
        options: ['上传顺序', '文件名排序'],
        defaultValue: '上传顺序'
      },
      {
        id: 'bookmark',
        label: '导出选项',
        type: 'select',
        options: ['仅合并', '生成目录书签'],
        defaultValue: '仅合并'
      }
    ],
    tips: [
      '适合审批流附件打包和资料归档。',
      '后续可支持拖拽调整顺序和封面页插入。'
    ],
    sampleFile: {
      name: '三份报名材料',
      origin: '3 个 PDF',
      result: '1 个 PDF',
      status: '待合并'
    },
    related: ['pdf-split', 'pdf-watermark', 'image-to-pdf']
  },
  {
    id: 'pdf-split',
    name: 'PDF 拆分',
    category: '文档转换',
    inputMode: 'file',
    tagline: '只想发其中几页，或者按章节拆文件时更省事。',
    description:
      '支持按页码范围拆分，适合资料分发和单页提取。',
    actionLabel: '拆分文档',
    successMessage: '拆分结果已准备好，可以继续调整页码范围。',
    inputLabel: '上传 PDF 后选择页码范围拆分',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'range',
        label: '拆分页码',
        type: 'select',
        options: ['第 1-3 页', '第 4-6 页', '自定义范围'],
        defaultValue: '第 1-3 页'
      },
      {
        id: 'export',
        label: '导出方式',
        type: 'segmented',
        options: ['单个文件', '逐页拆开'],
        defaultValue: '单个文件'
      }
    ],
    tips: [
      '适合材料节选、发票页拆分和资料精简转发。',
      '后续可支持可视化页码预览。'
    ],
    sampleFile: {
      name: '培训手册.pdf',
      origin: '32 页',
      result: '第 1-3 页',
      status: '待拆分'
    },
    related: ['pdf-merge', 'pdf-to-image', 'pdf-watermark']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF 转图片',
    category: '文档转换',
    inputMode: 'file',
    tagline: '汇报页、物料页、审批页单独发图时更方便。',
    description:
      '把 PDF 页面导出成图片，适合群里转发、网页贴图和审批截图。',
    actionLabel: '导出图片',
    successMessage: '页面图片已经准备好，可以继续选择导出格式。',
    inputLabel: '上传 PDF 后按页导出为图片',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'imageType',
        label: '导出格式',
        type: 'segmented',
        options: ['PNG', 'JPG'],
        defaultValue: 'PNG'
      },
      {
        id: 'pageRange',
        label: '导出页码',
        type: 'select',
        options: ['全部页面', '首页', '自定义范围'],
        defaultValue: '全部页面'
      }
    ],
    tips: [
      '适合审批截图、汇报页分享和海报页导出。',
      '后续可支持分辨率设置和长图拼接。'
    ],
    sampleFile: {
      name: '活动方案.pdf',
      origin: '18 页',
      result: '18 张 PNG',
      status: '待导出'
    },
    related: ['image-convert', 'pdf-split', 'image-to-pdf']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF 加水印',
    category: '文档转换',
    inputMode: 'file',
    tagline: '内审稿、样章、培训资料，加个标识更省心。',
    description:
      '适合合同草稿、内部流转材料和课程资料统一加水印。',
    actionLabel: '添加水印',
    successMessage: '水印已添加完成，可以继续调整透明度或位置。',
    inputLabel: '上传 PDF 文档后添加文字水印',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'watermark',
        label: '水印内容',
        type: 'select',
        options: ['仅供内部使用', '样章', '请勿外传'],
        defaultValue: '仅供内部使用'
      },
      {
        id: 'position',
        label: '位置样式',
        type: 'segmented',
        options: ['居中斜排', '页脚', '右上角'],
        defaultValue: '居中斜排'
      }
    ],
    tips: [
      '适合内部资料流转、样章发送和对外预览稿控制。',
      '后续可支持图片水印、透明度和字号调节。'
    ],
    sampleFile: {
      name: '制度草稿.pdf',
      origin: 'PDF',
      result: '已加水印',
      status: '待处理'
    },
    related: ['pdf-merge', 'pdf-split', 'word-to-pdf']
  },
  {
    id: 'excel-to-csv',
    name: 'Excel 转 CSV',
    category: '表格与文本',
    inputMode: 'file',
    tagline: '导入系统、清理数据、发给技术同事时经常会用到。',
    description:
      '把 Excel 表快速转成 CSV，方便上传系统、导入数据库或继续处理。',
    actionLabel: '导出 CSV',
    successMessage: 'CSV 已生成，编码和分隔符可以继续调整。',
    inputLabel: '上传 Excel 文件后导出标准 CSV',
    accept: '.xls,.xlsx',
    formats: ['XLS', 'XLSX'],
    settings: [
      {
        id: 'sheet',
        label: '工作表',
        type: 'select',
        options: ['第一个工作表', '当前活动工作表', '全部工作表分别导出'],
        defaultValue: '第一个工作表'
      },
      {
        id: 'encoding',
        label: '编码格式',
        type: 'segmented',
        options: ['UTF-8', 'GBK'],
        defaultValue: 'UTF-8'
      }
    ],
    tips: [
      '适合导数、系统导入和跨平台交换数据。',
      '后续可支持列分隔符和空值处理规则。'
    ],
    sampleFile: {
      name: '客户清单.xlsx',
      origin: 'XLSX',
      result: 'CSV',
      status: '待导出'
    },
    related: ['csv-to-excel', 'word-to-pdf', 'text-dedup']
  },
  {
    id: 'csv-to-excel',
    name: 'CSV 转 Excel',
    category: '表格与文本',
    inputMode: 'file',
    tagline: '拿到一堆原始 CSV 数据后，先转回 Excel 更方便同事处理。',
    description:
      '把 CSV 文件整理成 Excel，适合再分发、标注和人工校对。',
    actionLabel: '导出 Excel',
    successMessage: 'Excel 已生成，可以继续指定工作表名称。',
    inputLabel: '上传 CSV 文件后导出 Excel',
    accept: '.csv',
    formats: ['CSV'],
    settings: [
      {
        id: 'delimiter',
        label: '分隔符',
        type: 'select',
        options: ['自动识别', '逗号', '制表符'],
        defaultValue: '自动识别'
      },
      {
        id: 'header',
        label: '首行处理',
        type: 'segmented',
        options: ['作为表头', '作为普通数据'],
        defaultValue: '作为表头'
      }
    ],
    tips: [
      '适合原始数据回传、业务校对和表格再编辑。',
      '后续可支持编码识别和多文件批量转换。'
    ],
    sampleFile: {
      name: '导出结果.csv',
      origin: 'CSV',
      result: 'XLSX',
      status: '待导出'
    },
    related: ['excel-to-csv', 'text-dedup', 'timestamp-convert']
  },
  {
    id: 'text-dedup',
    name: '文本去重',
    category: '表格与文本',
    inputMode: 'text',
    previewMode: 'dedup',
    tagline: '群名单、标签词、批量关键词整理时很常用。',
    description:
      '把一段多行文本去重并保留顺序，适合整理名单、标签和导入数据。',
    actionLabel: '开始去重',
    successMessage: '去重结果已更新，可以继续复制或再次编辑内容。',
    inputLabel: '把需要去重的内容粘贴进来，每行会按一条记录处理',
    textPlaceholder: '上海\n北京\n上海\n杭州\n北京',
    formats: ['文本'],
    settings: [
      {
        id: 'trim',
        label: '空白处理',
        type: 'segmented',
        options: ['自动去首尾空格', '保留原样'],
        defaultValue: '自动去首尾空格'
      },
      {
        id: 'emptyLine',
        label: '空行处理',
        type: 'select',
        options: ['忽略空行', '保留空行'],
        defaultValue: '忽略空行'
      }
    ],
    tips: [
      '适合群名单、商品标签、投放关键词和文本导入清理。',
      '后续可支持排序、统计重复次数和导出 TXT。'
    ],
    sampleFile: {
      name: '名单去重',
      origin: '多行文本',
      result: '去重结果',
      status: '待处理'
    },
    related: ['csv-to-excel', 'excel-to-csv', 'timestamp-convert']
  },
  {
    id: 'qr-generator',
    name: '生成二维码',
    category: '日常效率',
    inputMode: 'text',
    previewMode: 'qr',
    tagline: '链接、文档、表单、活动页，临时出码不用再找第三方。',
    description:
      '快速生成可下载二维码，适合群公告、海报、工位贴纸和线下物料。',
    actionLabel: '生成二维码',
    successMessage: '二维码已经生成，可以继续切换样式或重新编辑内容。',
    inputLabel: '输入链接或文本内容，立即生成二维码',
    textPlaceholder: '例如 https://niuma.lengziyu.cn/signup 或一段活动说明',
    accept: '.txt',
    formats: ['链接', '文本'],
    settings: [
      {
        id: 'content',
        label: '内容类型',
        type: 'segmented',
        options: ['网页链接', '普通文本'],
        defaultValue: '网页链接'
      },
      {
        id: 'style',
        label: '导出样式',
        type: 'select',
        options: ['标准黑白', '柔和红灰', '深色反白'],
        defaultValue: '柔和红灰'
      }
    ],
    tips: [
      '适合群通知、会场指引、资料下载入口。',
      '后续可接入 LOGO 嵌入、尺寸导出和短链能力。'
    ],
    sampleFile: {
      name: '培训报名链接',
      origin: 'URL',
      result: '二维码 PNG',
      status: '已准备好'
    },
    related: ['image-resize', 'word-to-pdf', 'timestamp-convert']
  },
  {
    id: 'timestamp-convert',
    name: '时间戳转换',
    category: '日常效率',
    inputMode: 'text',
    previewMode: 'timestamp',
    tagline: '日志排查、接口联调、表格核对时间时很顺手。',
    description:
      '支持毫秒和秒级时间戳互转，适合开发协作、数据核对和运营排查。',
    actionLabel: '开始转换',
    successMessage: '转换结果已更新，可以继续批量粘贴多行内容。',
    inputLabel: '输入时间戳或日期时间，支持一行一条批量转换',
    textPlaceholder: '1715846400\n1715846400000\n2026-05-16 09:30:00',
    formats: ['时间戳', '日期时间'],
    settings: [
      {
        id: 'timezone',
        label: '时区',
        type: 'select',
        options: ['Asia/Shanghai', 'UTC'],
        defaultValue: 'Asia/Shanghai'
      },
      {
        id: 'target',
        label: '输出格式',
        type: 'segmented',
        options: ['自动判断', '转时间戳', '转日期'],
        defaultValue: '自动判断'
      }
    ],
    tips: [
      '适合日志时间核对、接口联调和数据导出检查。',
      '后续可支持 ISO 8601、批量导出和复制格式模板。'
    ],
    sampleFile: {
      name: '时间戳转换',
      origin: '多行文本',
      result: '转换结果',
      status: '待处理'
    },
    related: ['qr-generator', 'text-dedup', 'excel-to-csv']
  }
];

export const recentTasks = [
  {
    title: '活动海报压缩',
    detail: '图片压缩 · 10 分钟前'
  },
  {
    title: '报名链接二维码',
    detail: '生成二维码 · 今天 09:24'
  },
  {
    title: '客户清单转 CSV',
    detail: 'Excel 转 CSV · 今天 08:46'
  }
];

export function getToolById(toolId) {
  return tools.find((item) => item.id === toolId);
}
