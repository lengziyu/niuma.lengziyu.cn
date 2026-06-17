export const tools = [
  {
    id: 'image-compress',
    name: '图片压缩',
    category: '图片处理',
    inputMode: 'file',
    multiple: true,
    tagline: '活动海报、汇报截图、报名表附件，先瘦身再发。',
    description: '支持批量拖拽上传，一次压缩多张图片，本地处理不上传服务器。',
    actionLabel: '开始压缩',
    successMessage: '图片已经压好，可以继续下载或重新调整压缩强度。',
    inputLabel: '拖拽图片到这里，支持同时添加多张',
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
      '支持批量处理，适合邮件附件、企业微信和投递系统上传前准备。'
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
    multiple: false,
    tagline: '公众号头图、工牌照片、报名封面，一键改好尺寸。',
    description: '常用比例和像素预设一键套用，支持自定义宽高和锁定比例。',
    actionLabel: '生成新尺寸',
    successMessage: '新尺寸已生成，可以直接下载。',
    inputLabel: '上传一张需要调整尺寸的图片',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'preset',
        label: '尺寸预设',
        type: 'select',
        options: ['公众号封面 900×383', '工牌照 358×441', '自定义尺寸'],
        defaultValue: '自定义尺寸'
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
      '适合活动报名、商城素材、社群配图尺寸统一。'
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
    multiple: false,
    tagline: 'PNG、JPG、WebP 来回切，不必为了导出开大软件。',
    description: '选择目标格式后一键转换，支持透明背景处理。',
    actionLabel: '开始转换',
    successMessage: '格式转换已完成，可以直接下载。',
    inputLabel: '上传一张图片，选择要导出的格式',
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
    multiple: true,
    tagline: '截图、扫描件、票据照片，整理成一个 PDF 再发更省心。',
    description: '上传多张图片按顺序合成一个 PDF，适合报销票据和截图归档。',
    actionLabel: '导出 PDF',
    successMessage: 'PDF 已准备好，可以直接下载。',
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
      '适合票据整理、扫描件归档和汇报截图打包。'
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
    multiple: false,
    tagline: '海报文案、截图说明、扫描件里的字，提出来继续改。',
    description: '上传一张图片，AI 自动识别并提取其中的文字内容。',
    actionLabel: '提取文字',
    successMessage: '文字内容已提取，可以复制使用。',
    inputLabel: '上传一张需要识别文字的图片',
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
      '适合截图文案复用、扫描件录入和图片资料摘录。'
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
    id: 'image-id-photo-bg',
    name: '证件照换底色',
    category: '图片处理',
    inputMode: 'file',
    multiple: false,
    tagline: '报名、入职、考试材料需要蓝底白底时，快速导出一张。',
    description: '上传一张纯色背景证件照，选择新底色后导出 PNG。',
    actionLabel: '更换底色',
    successMessage: '证件照底色已更换，可以直接下载。',
    inputLabel: '上传一张证件照图片',
    accept: '.png,.jpg,.jpeg,.webp',
    formats: ['PNG', 'JPG', 'WebP'],
    settings: [
      {
        id: 'background',
        label: '目标底色',
        type: 'segmented',
        options: ['蓝底', '白底', '红底'],
        defaultValue: '蓝底'
      }
    ],
    tips: [
      '适合原图背景较干净的证件照。',
      '复杂背景建议先抠图后再换底色。'
    ],
    sampleFile: {
      name: '报名证件照.jpg',
      origin: '白底',
      result: '蓝底 PNG',
      status: '待处理'
    },
    related: ['image-resize', 'image-compress', 'image-convert']
  },
  {
    id: 'pdf-compress',
    name: 'PDF 压缩',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '投标、报销、系统附件超限时，先把 PDF 瘦一瘦。',
    description: '上传一个 PDF，清理冗余数据并压缩导出。',
    actionLabel: '压缩 PDF',
    successMessage: 'PDF 已压缩，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'level',
        label: '压缩强度',
        type: 'segmented',
        options: ['标准压缩', '强力压缩'],
        defaultValue: '标准压缩'
      }
    ],
    tips: [
      '适合减少附件体积，具体压缩效果取决于原 PDF 内容。',
      '加密 PDF 请先去密码再压缩。'
    ],
    sampleFile: {
      name: '投标附件.pdf',
      origin: '18 MB',
      result: '更小 PDF',
      status: '待压缩'
    },
    related: ['pdf-unlock', 'pdf-to-image', 'pdf-merge']
  },
  {
    id: 'pdf-to-word',
    name: 'PDF 转 Word',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '收到 PDF 版材料还要改字时，先转成可编辑稿。',
    description: '上传一个 PDF 文件，转换为可编辑的 Word 文档。',
    actionLabel: '开始转换',
    successMessage: '可编辑文档已准备好，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'layout',
        label: '转换方案',
        type: 'segmented',
        options: ['文字可编辑版', '版式还原版（图片）'],
        defaultValue: '版式还原版（图片）'
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
      '文字可编辑版适合需要修改内容的场景。',
      '版式还原版适合打印归档，排版完美但文字不可编辑。'
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
    multiple: false,
    tagline: '定稿要发领导、发客户、发打印店时，统一导成 PDF。',
    description: '上传一个 Word 文档，转换为排版稳定的 PDF 文件。',
    actionLabel: '导出 PDF',
    successMessage: 'PDF 已生成，可以直接下载。',
    inputLabel: '上传一个 Word 文档（.doc / .docx）',
    accept: '.doc,.docx',
    formats: ['DOC', 'DOCX'],
    settings: [
      {
        id: 'quality',
        label: '导出质量',
        type: 'segmented',
        options: ['标准', '清晰打印'],
        defaultValue: '标准'
      }
    ],
    tips: [
      '适合终稿输出和跨设备分享。'
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
    id: 'pdf-organize',
    name: 'PDF 页面整理',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '删除多余页、调整页序，只导出真正要发的部分。',
    description: '输入页码顺序，按指定顺序导出新的 PDF。',
    actionLabel: '整理页面',
    successMessage: 'PDF 页面已整理，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'pages',
        label: '页码顺序',
        type: 'text',
        placeholder: '例如 1-3,5,4',
        defaultValue: '1-3'
      }
    ],
    tips: [
      '输入 1-3,5 表示保留第 1 到 3 页和第 5 页。',
      '输入 3,2,1 可以倒序导出前三页。'
    ],
    sampleFile: {
      name: '汇报材料.pdf',
      origin: '12 页',
      result: '指定页序',
      status: '待整理'
    },
    related: ['pdf-split', 'pdf-merge', 'pdf-compress']
  },
  {
    id: 'pdf-merge',
    name: 'PDF 合并',
    category: '文档转换',
    inputMode: 'file',
    multiple: true,
    tagline: '合同附件、报名材料、审批文件，一次整理成一个包。',
    description: '上传多个 PDF 文件，按顺序合并成一个文件。',
    actionLabel: '合并文档',
    successMessage: '合并完成，可以直接下载。',
    inputLabel: '上传 2 个或以上 PDF 文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'order',
        label: '排序方式',
        type: 'segmented',
        options: ['上传顺序', '文件名排序'],
        defaultValue: '上传顺序'
      }
    ],
    tips: [
      '适合审批流附件打包和资料归档。'
    ],
    sampleFile: {
      name: '三份报名材料',
      origin: '3 个 PDF',
      result: '1 个 PDF',
      status: '待合并'
    },
    related: ['pdf-split', 'pdf-organize', 'image-to-pdf']
  },
  {
    id: 'pdf-split',
    name: 'PDF 拆分',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '只想发其中几页，或者按章节拆文件时更省事。',
    description: '上传一个 PDF，选择页码范围拆分导出。',
    actionLabel: '拆分文档',
    successMessage: '拆分完成，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
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
      '适合材料节选、发票页拆分和资料精简转发。'
    ],
    sampleFile: {
      name: '培训手册.pdf',
      origin: '32 页',
      result: '第 1-3 页',
      status: '待拆分'
    },
    related: ['pdf-merge', 'pdf-organize', 'pdf-unlock']
  },
  {
    id: 'pdf-unlock',
    name: 'PDF 去密码',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '知道打开密码时，去掉 PDF 密码，后续查看和归档更省心。',
    description: '上传一个加密 PDF，输入打开密码后导出无密码版本。',
    actionLabel: '去掉密码',
    successMessage: 'PDF 密码已移除，可以直接下载。',
    inputLabel: '上传一个带密码的 PDF 文件',
    accept: '.pdf',
    formats: ['PDF'],
    settings: [
      {
        id: 'password',
        label: '打开密码',
        type: 'password',
        placeholder: '输入 PDF 打开密码',
        defaultValue: ''
      }
    ],
    tips: [
      '仅适用于你已知道打开密码的 PDF。',
      '未加密 PDF 也可以导出一份普通副本。'
    ],
    sampleFile: {
      name: '合同扫描件.pdf',
      origin: '已加密',
      result: '无密码 PDF',
      status: '待处理'
    },
    related: ['pdf-split', 'pdf-merge', 'pdf-watermark']
  },
  {
    id: 'pdf-to-image',
    name: 'PDF 转图片',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '汇报页、物料页、审批页单独发图时更方便。',
    description: '上传一个 PDF，按页导出为 PNG 或 JPG 图片。',
    actionLabel: '导出图片',
    successMessage: '图片已导出，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
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
      '适合审批截图、汇报页分享和海报页导出。'
    ],
    sampleFile: {
      name: '活动方案.pdf',
      origin: '18 页',
      result: '18 张 PNG',
      status: '待导出'
    },
    related: ['image-convert', 'pdf-compress', 'image-to-pdf']
  },
  {
    id: 'pdf-watermark',
    name: 'PDF 加水印',
    category: '文档转换',
    inputMode: 'file',
    multiple: false,
    tagline: '内审稿、样章、培训资料，加个标识更省心。',
    description: '上传一个 PDF，添加文字水印后导出。',
    actionLabel: '添加水印',
    successMessage: '水印已添加，可以直接下载。',
    inputLabel: '上传一个 PDF 文件',
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
      '适合内部资料流转、样章发送和对外预览稿控制。'
    ],
    sampleFile: {
      name: '制度草稿.pdf',
      origin: 'PDF',
      result: '已加水印',
      status: '待处理'
    },
    related: ['pdf-merge', 'pdf-organize', 'pdf-unlock']
  },
  {
    id: 'excel-to-csv',
    name: 'Excel 转 CSV',
    category: '表格与文本',
    inputMode: 'file',
    multiple: false,
    tagline: '导入系统、清理数据、发给技术同事时经常会用到。',
    description: '上传一个 Excel 文件，导出为标准 CSV 格式。',
    actionLabel: '导出 CSV',
    successMessage: 'CSV 已生成，可以直接下载。',
    inputLabel: '上传一个 Excel 文件（.xls / .xlsx）',
    accept: '.xls,.xlsx',
    formats: ['XLS', 'XLSX'],
    settings: [
      {
        id: 'encoding',
        label: '编码格式',
        type: 'segmented',
        options: ['UTF-8', 'GBK'],
        defaultValue: 'UTF-8'
      }
    ],
    tips: [
      '适合导数、系统导入和跨平台交换数据。'
    ],
    sampleFile: {
      name: '客户清单.xlsx',
      origin: 'XLSX',
      result: 'CSV',
      status: '待导出'
    },
    related: ['csv-to-excel', 'excel-merge-split', 'json-excel']
  },
  {
    id: 'csv-to-excel',
    name: 'CSV 转 Excel',
    category: '表格与文本',
    inputMode: 'file',
    multiple: false,
    tagline: '拿到一堆原始 CSV 数据后，先转回 Excel 更方便同事处理。',
    description: '上传一个 CSV 文件，转换为 Excel 格式。',
    actionLabel: '导出 Excel',
    successMessage: 'Excel 已生成，可以直接下载。',
    inputLabel: '上传一个 CSV 文件',
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
      '适合原始数据回传、业务校对和表格再编辑。'
    ],
    sampleFile: {
      name: '导出结果.csv',
      origin: 'CSV',
      result: 'XLSX',
      status: '待导出'
    },
    related: ['excel-to-csv', 'excel-merge-split', 'json-excel']
  },
  {
    id: 'excel-merge-split',
    name: 'Excel 合并/拆分',
    category: '表格与文本',
    inputMode: 'file',
    multiple: true,
    tagline: '多份表格合成一个，或者把多 sheet 文件拆开交付。',
    description: '支持多个 XLSX 合并为一个文件，也支持按工作表拆分为 ZIP。',
    actionLabel: '处理表格',
    successMessage: '表格已处理完成，可以直接下载。',
    inputLabel: '上传一个或多个 XLSX 文件',
    accept: '.xlsx',
    formats: ['XLSX'],
    settings: [
      {
        id: 'operation',
        label: '处理方式',
        type: 'segmented',
        options: ['合并文件', '按工作表拆分'],
        defaultValue: '合并文件'
      }
    ],
    tips: [
      '合并文件会把每个工作表复制到同一个 XLSX。',
      '拆分模式会把每个工作表导出为一个独立 XLSX 并打包下载。'
    ],
    sampleFile: {
      name: '各区销售表.xlsx',
      origin: '多个 XLSX',
      result: '合并/拆分结果',
      status: '待处理'
    },
    related: ['excel-to-csv', 'csv-to-excel', 'json-excel']
  },
  {
    id: 'json-excel',
    name: 'JSON ↔ Excel',
    category: '表格与文本',
    inputMode: 'file',
    multiple: false,
    tagline: '接口数据和表格来回转，产品、运营、开发对齐更轻松。',
    description: '上传 JSON 导出 Excel，或上传 XLSX 导出 JSON。',
    actionLabel: '开始转换',
    successMessage: 'JSON / Excel 已转换完成，可以直接下载。',
    inputLabel: '上传一个 JSON 或 XLSX 文件',
    accept: '.json,.xlsx',
    formats: ['JSON', 'XLSX'],
    settings: [
      {
        id: 'mode',
        label: '转换方向',
        type: 'segmented',
        options: ['自动判断', 'JSON 转 Excel', 'Excel 转 JSON'],
        defaultValue: '自动判断'
      }
    ],
    tips: [
      'JSON 数组对象会按字段展开为表格列。',
      'Excel 转 JSON 会按工作表输出对象数组。'
    ],
    sampleFile: {
      name: '接口返回.json',
      origin: 'JSON',
      result: 'XLSX / JSON',
      status: '待转换'
    },
    related: ['excel-to-csv', 'csv-to-excel', 'excel-merge-split']
  },
  {
    id: 'text-dedup',
    name: '文本去重',
    category: '表格与文本',
    inputMode: 'text',
    previewMode: 'dedup',
    tagline: '群名单、标签词、批量关键词整理时很常用。',
    description: '粘贴多行文本，一键去重并保留顺序。',
    actionLabel: '开始去重',
    successMessage: '去重结果已更新，可以复制使用。',
    inputLabel: '把需要去重的内容粘贴进来，每行按一条记录处理',
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
      '适合群名单、商品标签、投放关键词和文本导入清理。'
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
    description: '输入链接或文本，即时生成可下载的二维码图片。',
    actionLabel: '生成二维码',
    successMessage: '二维码已生成，可以直接下载。',
    inputLabel: '输入链接或文本内容，立即生成二维码',
    textPlaceholder: '例如 https://niuma.lengziyu.cn 或一段活动说明',
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
        options: ['经典黑白', '深邃黑', '紫罗兰', '海洋蓝', '森林绿', '日落橙', '玫瑰粉', '深色反白', '午夜蓝'],
        defaultValue: '经典黑白'
      }
    ],
    tips: [
      '适合群通知、会场指引、资料下载入口。'
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
    description: '输入时间戳或日期，批量互转，支持秒级和毫秒级。',
    actionLabel: '开始转换',
    successMessage: '转换结果已更新，可以复制使用。',
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
      '适合日志时间核对、接口联调和数据导出检查。'
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
