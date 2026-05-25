import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  CloudUpload,
  Download,
  FileImage,
  FileText,
  QrCode,
  RefreshCcw,
  ScanText,
  Trash2,
  Type,
  Waypoints,
  X
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import UPNG from 'upng-js';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/* ─── Utilities ─── */

let pdfJsLibPromise = null;

function formatBytes(value) {
  if (!value) return '0 KB';
  if (value >= 1024 * 1024) return `${(value / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function formatDateTime(date, timezone) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone === 'UTC' ? 'UTC' : 'Asia/Shanghai',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  }).format(date).replace(/\//g, '-');
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('图片加载失败')); };
    img.src = url;
  });
}

function pngColorCountFromQuality(quality) {
  const safeQuality = Math.max(1, Math.min(100, quality));

  if (safeQuality >= 96) return 0;
  if (safeQuality >= 88) return 256;
  if (safeQuality >= 76) return 192;
  if (safeQuality >= 64) return 128;
  if (safeQuality >= 52) return 96;
  if (safeQuality >= 40) return 64;
  if (safeQuality >= 28) return 48;
  return 32;
}

function compressPngWithUpng(canvas, quality) {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return null;
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const colorCount = pngColorCountFromQuality(quality);
  const encoded = UPNG.encode([imageData.data.buffer], canvas.width, canvas.height, colorCount);

  return new Blob([encoded], { type: 'image/png' });
}

function extensionFromMimeType(mime) {
  if (mime === 'image/png') return 'png';
  if (mime === 'image/jpeg') return 'jpg';
  if (mime === 'image/webp') return 'webp';
  if (mime === 'image/avif') return 'avif';
  return null;
}

function compressImage(file, quality, targetFormat) {
  return new Promise(async (resolve) => {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    const mimeMap = { PNG: 'image/png', JPG: 'image/jpeg', WebP: 'image/webp' };

    // Determine output mime type
    let mime;
    if (targetFormat && mimeMap[targetFormat]) {
      mime = mimeMap[targetFormat];
    } else {
      mime = file.type && file.type.startsWith('image/') ? file.type : 'image/jpeg';
    }

    // For JPEG/WebP, fill white background (in case of transparency)
    if (mime !== 'image/png') {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);

    if (mime === 'image/png') {
      const pngBlob = compressPngWithUpng(canvas, quality);
      if (pngBlob && pngBlob.size < file.size) {
        resolve(pngBlob);
      } else {
        resolve(file);
      }
      return;
    }

    const q = quality / 100;

    canvas.toBlob((blob) => {
      // If compressed result is larger than original, return original
      if (blob && blob.size >= file.size) {
        resolve(file);
      } else {
        resolve(blob || file);
      }
    }, mime, q);
  });
}

function resizeImage(file, width, height, fit) {
  return new Promise(async (resolve) => {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (fit === '拉伸填满') {
      ctx.drawImage(img, 0, 0, width, height);
    } else if (fit === '居中裁切') {
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      const sw = width / scale;
      const sh = height / scale;
      const sx = (img.naturalWidth - sw) / 2;
      const sy = (img.naturalHeight - sh) / 2;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
    } else {
      const scale = Math.min(width / img.naturalWidth, height / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    }

    canvas.toBlob((blob) => resolve(blob), file.type || 'image/png');
  });
}

function convertImage(file, targetFormat, background) {
  return new Promise(async (resolve) => {
    const img = await loadImage(file);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');

    const mimeMap = { PNG: 'image/png', JPG: 'image/jpeg', WebP: 'image/webp', AVIF: 'image/avif' };
    const mime = mimeMap[targetFormat] || 'image/png';

    if (mime === 'image/jpeg' && background !== '保留透明') {
      ctx.fillStyle = background === '自动铺浅灰底' ? '#f0f0f0' : '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0);
    canvas.toBlob((blob) => resolve(blob), mime, 0.92);
  });
}

function isImageMime(mime) {
  return typeof mime === 'string' && mime.startsWith('image/');
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function loadPdfJs() {
  if (!pdfJsLibPromise) {
    pdfJsLibPromise = import('pdfjs-dist/build/pdf.mjs').then((module) => {
      module.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
      return module;
    });
  }

  return pdfJsLibPromise;
}

async function extractPdfParagraphs(file) {
  const pdfjs = await loadPdfJs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await pdfjs.getDocument({ data }).promise;
  const paragraphs = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    let line = '';

    textContent.items.forEach((item) => {
      if (!('str' in item)) {
        return;
      }

      const chunk = item.str ?? '';

      if (chunk) {
        line += chunk;
      }

      if (item.hasEOL) {
        const normalized = line.trim();
        if (normalized) {
          paragraphs.push(normalized);
        }
        line = '';
      }
    });

    const normalized = line.trim();
    if (normalized) {
      paragraphs.push(normalized);
    }

    if (pageNumber < pdf.numPages && paragraphs[paragraphs.length - 1] !== '') {
      paragraphs.push('');
    }
  }

  return paragraphs.filter((paragraph, index, source) => {
    if (paragraph !== '') {
      return true;
    }

    return index > 0 && source[index - 1] !== '';
  });
}

async function createDocxFromParagraphs(paragraphs, sourceName) {
  const zip = new JSZip();
  const safeParagraphs = paragraphs.length
    ? paragraphs
    : ['这份 PDF 暂时没有提取到可编辑文本，可能是扫描件或图片版 PDF。'];
  const now = new Date().toISOString();

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:w10="urn:schemas-microsoft-com:office:word" xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml" xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup" xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk" xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml" xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape" mc:Ignorable="w14 wp14">
  <w:body>
    ${safeParagraphs.map((paragraph) => {
      if (!paragraph) {
        return '<w:p />';
      }

      return `<w:p><w:r><w:rPr><w:lang w:val="zh-CN" /></w:rPr><w:t xml:space="preserve">${escapeXml(paragraph)}</w:t></w:r></w:p>`;
    }).join('')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838" />
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0" />
    </w:sectPr>
  </w:body>
</w:document>`;

  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml" />
  <Default Extension="xml" ContentType="application/xml" />
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml" />
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml" />
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml" />
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml" />
</Types>`
  );

  zip.folder('_rels')?.file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml" />
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml" />
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml" />
</Relationships>`
  );

  zip.folder('word')?.file('document.xml', documentXml);
  zip.folder('word')?.folder('_rels')?.file(
    'document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships" />`
  );
  zip.folder('word')?.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
    <w:name w:val="Normal" />
    <w:qFormat />
    <w:rPr>
      <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:eastAsia="Microsoft YaHei" w:cs="Calibri" />
      <w:sz w:val="24" />
      <w:lang w:val="zh-CN" />
    </w:rPr>
  </w:style>
</w:styles>`
  );

  zip.folder('docProps')?.file(
    'core.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXml(sourceName)}</dc:title>
  <dc:creator>牛马百宝箱</dc:creator>
  <cp:lastModifiedBy>牛马百宝箱</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${now}</dcterms:modified>
</cp:coreProperties>`
  );
  zip.folder('docProps')?.file(
    'app.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>牛马百宝箱</Application>
</Properties>`
  );

  return zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

/* ─── Sub-components ─── */

function DetailSelect({ options, value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="detail-dropdown" ref={ref}>
      <button
        className="detail-dropdown__trigger"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span>{value}</span>
        <ChevronDown aria-hidden="true" size={18} className={open ? 'is-open' : ''} />
      </button>
      {open && (
        <div className="detail-dropdown__menu">
          {options.map((opt) => (
            <button
              key={opt}
              className={`detail-dropdown__item ${opt === value ? 'is-active' : ''}`}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
            >
              {opt === value && <span className="detail-dropdown__check">✓</span>}
              <span>{opt}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DetailSegmented({ options, value, onChange }) {
  return (
    <div className="detail-segmented" role="tablist">
      {options.map((opt) => (
        <button
          aria-selected={opt === value}
          className={opt === value ? 'is-active' : ''}
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
        >{opt}</button>
      ))}
    </div>
  );
}

function hashSeed(text) {
  let seed = 0;
  for (let i = 0; i < text.length; i++) seed = (seed * 131 + text.charCodeAt(i)) % 2147483647;
  return seed || 13579;
}

function buildQrCells(text) {
  const size = 21;
  let seed = hashSeed(text);
  const cells = [];
  function isFinder(r, c) {
    return (r < 7 && c < 7) || (r < 7 && c >= size - 7) || (r >= size - 7 && c < 7);
  }
  function isFinderFill(r, c) {
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    return (lr === 0 || lr === 6 || lc === 0 || lc === 6) || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
  }
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isFinder(r, c)) { cells.push(isFinderFill(r, c)); continue; }
      seed = (seed * 48271) % 2147483647;
      const guide = r === 6 || c === 6;
      cells.push(guide ? (r + c) % 2 === 0 : seed % 3 !== 0);
    }
  }
  return cells;
}

function QrPreview({ value, inverted }) {
  const cells = useMemo(() => buildQrCells(value), [value]);
  return (
    <div className={`detail-qr ${inverted ? 'is-inverted' : ''}`} aria-hidden="true">
      {cells.map((filled, i) => <span className={filled ? 'is-filled' : ''} key={i} />)}
    </div>
  );
}

const QR_STYLES = [
  { id: 'classic', label: '经典黑白', fg: '#000000', bg: '#ffffff', rounded: false },
  { id: 'soft-dark', label: '深邃黑', fg: '#1a1a2e', bg: '#ffffff', rounded: true },
  { id: 'purple', label: '紫罗兰', fg: '#5b21b6', bg: '#ffffff', rounded: true },
  { id: 'ocean', label: '海洋蓝', fg: '#1e40af', bg: '#f0f9ff', rounded: true },
  { id: 'forest', label: '森林绿', fg: '#166534', bg: '#f0fdf4', rounded: true },
  { id: 'sunset', label: '日落橙', fg: '#9a3412', bg: '#fff7ed', rounded: false },
  { id: 'rose', label: '玫瑰粉', fg: '#9f1239', bg: '#fff1f2', rounded: true },
  { id: 'inverted', label: '深色反白', fg: '#ffffff', bg: '#1e1b2e', rounded: false },
  { id: 'midnight', label: '午夜蓝', fg: '#e0e7ff', bg: '#1e1b4b', rounded: true },
];

function QrCanvas({ value, size, styleId, logo }) {
  const canvasRef = useRef(null);
  const qrStyle = QR_STYLES.find((s) => s.id === styleId) || QR_STYLES[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const cells = buildQrCells(value);
    const gridSize = 21;
    const cellSize = Math.floor(size / (gridSize + 2));
    const actualSize = cellSize * (gridSize + 2);
    canvas.width = actualSize;
    canvas.height = actualSize;

    const ctx = canvas.getContext('2d');
    const { fg, bg, rounded } = qrStyle;
    const radius = rounded ? cellSize * 0.3 : 0;

    // Background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, actualSize, actualSize);

    // Draw cells
    const offset = cellSize;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (cells[r * gridSize + c]) {
          ctx.fillStyle = fg;
          const x = offset + c * cellSize;
          const y = offset + r * cellSize;
          if (rounded) {
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, radius);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }

    // Draw logo if provided
    if (logo) {
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = actualSize * 0.22;
        const logoX = (actualSize - logoSize) / 2;
        const logoY = (actualSize - logoSize) / 2;
        ctx.fillStyle = bg;
        const pad = 6;
        ctx.beginPath();
        ctx.roundRect(logoX - pad, logoY - pad, logoSize + pad * 2, logoSize + pad * 2, 8);
        ctx.fill();
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      };
      logoImg.src = URL.createObjectURL(logo);
    }
  }, [value, size, qrStyle, logo]);

  const displaySize = Math.min(size, 220);

  return (
    <canvas
      ref={canvasRef}
      className="detail-qr-canvas"
      style={{ width: displaySize, height: displaySize, borderRadius: '8px' }}
    />
  );
}

function FileItem({ item, onRemove }) {
  const percent = item.resultSize != null && item.originSize > 0 && item.resultSize < item.originSize
    ? Math.round((1 - item.resultSize / item.originSize) * 100)
    : null;

  return (
    <div className="detail-workbench__file-item">
      <div className="detail-workbench__file-info">
        <strong>{item.name}</strong>
        <span>{formatBytes(item.originSize)}</span>
        {item.status === 'done' && item.resultSize != null && (
          <span className="detail-workbench__file-result">
            → {formatBytes(item.resultSize)} {percent != null && percent > 0 ? `(-${percent}%)` : item.resultSize >= item.originSize ? '(已是最优)' : ''}
          </span>
        )}
      </div>
      <div className="detail-workbench__file-actions">
        {item.status === 'done' && item.blob && (
          <button
            className="detail-workbench__icon-btn"
            type="button"
            title="下载"
            onClick={() => saveAs(item.blob, item.outputName || item.name)}
          >
            <Download size={16} />
          </button>
        )}
        <button
          className="detail-workbench__icon-btn"
          type="button"
          title="移除"
          onClick={() => onRemove(item.id)}
        >
          <X size={16} />
        </button>
      </div>
      {item.status === 'processing' && (
        <div className="detail-workbench__progress">
          <div className="detail-workbench__progress-bar" style={{ width: '60%' }} />
        </div>
      )}
      {item.status === 'error' && (
        <span className="detail-workbench__file-error">处理失败</span>
      )}
    </div>
  );
}

/* ─── Text processing ─── */

function buildTextPreview(tool, value, settings) {
  const content = value.trim();
  if (!content) return null;

  if (tool.previewMode === 'dedup') {
    const rawLines = value.split(/\r?\n/);
    const cleaned = rawLines
      .map((l) => (settings.trim === '自动去首尾空格' ? l.trim() : l))
      .filter((l) => (settings.emptyLine === '忽略空行' ? l !== '' : true));
    const unique = [];
    const seen = new Set();
    cleaned.forEach((l) => { if (!seen.has(l)) { seen.add(l); unique.push(l); } });
    return { title: '去重结果', meta: `原始 ${cleaned.length} 行，去重后 ${unique.length} 行`, body: unique.join('\n') || '没有可输出的内容。' };
  }

  if (tool.previewMode === 'timestamp') {
    const tz = settings.timezone === 'UTC' ? 'UTC' : 'Asia/Shanghai';
    const rows = value.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line) => {
      if (/^\d{13}$/.test(line)) return `${line} → ${formatDateTime(new Date(Number(line)), tz)}`;
      if (/^\d{10}$/.test(line)) return `${line} → ${formatDateTime(new Date(Number(line) * 1000), tz)}`;
      const parsed = new Date(line.replace(' ', 'T'));
      if (!Number.isNaN(parsed.getTime())) return `${line} → ${Math.floor(parsed.getTime() / 1000)} / ${parsed.getTime()}`;
      return `${line} → 无法识别`;
    });
    return { title: '转换结果', meta: `共处理 ${rows.length} 条时间数据`, body: rows.join('\n') };
  }

  return { title: '当前内容', meta: '可继续编辑后再生成结果', body: content };
}

/* ─── Main Component ─── */

export default function Workbench({ tool }) {
  const initialValues = useMemo(
    () => Object.fromEntries(tool.settings.map((s) => [s.id, s.defaultValue])),
    [tool.settings]
  );

  const [settings, setSettings] = useState(initialValues);
  const [qualityValue, setQualityValue] = useState(60);
  const [fileQueue, setFileQueue] = useState([]);
  const [previewUrls, setPreviewUrls] = useState({});
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState('保持原格式');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const processingRef = useRef(false);

  const isTextMode = tool.inputMode === 'text';
  const isQrMode = tool.previewMode === 'qr';
  const isImageCompress = tool.id === 'image-compress';
  const hasInput = isTextMode ? textInput.trim().length > 0 : fileQueue.length > 0;

  const allDone = fileQueue.length > 0 && fileQueue.every((f) => f.status === 'done' || f.status === 'error');
  const doneCount = fileQueue.filter((f) => f.status === 'done').length;
  const hasPending = fileQueue.some((f) => f.status === 'pending');

  // Compare preview state
  const [compareOpen, setCompareOpen] = useState(false);
  const [compareItem, setCompareItem] = useState(null);
  const [comparePosition, setComparePosition] = useState(50);

  // Image resize custom dimensions
  const [resizeWidth, setResizeWidth] = useState(900);
  const [resizeHeight, setResizeHeight] = useState(383);
  const [lockRatio, setLockRatio] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(900 / 383);

  // QR generator settings
  const [qrSize, setQrSize] = useState(256);
  const [qrStyleId, setQrStyleId] = useState('classic');
  const [qrLogo, setQrLogo] = useState(null);
  const qrLogoInputRef = useRef(null);

  const compareableFiles = useMemo(
    () =>
      fileQueue.filter(
        (item) =>
          item.status === 'done' &&
          item.blob &&
          isImageMime(item.file?.type) &&
          isImageMime(item.blob.type)
      ),
    [fileQueue]
  );
  const comparePreviewUrls = compareItem ? previewUrls[compareItem.id] : null;

  function randomQrStyle() {
    const others = QR_STYLES.filter((s) => s.id !== qrStyleId);
    const pick = others[Math.floor(Math.random() * others.length)];
    setQrStyleId(pick.id);
  }

  useEffect(() => {
    setSettings(initialValues);
    setQualityValue(60);
    setFileQueue([]);
    setTextInput('');
    setIsProcessing(false);
    setOutputFormat('保持原格式');
    setCompareOpen(false);
    setCompareItem(null);
  }, [initialValues, tool.id]);

  useEffect(() => {
    const nextUrls = {};
    const revokeFns = [];

    fileQueue.forEach((item) => {
      const urls = {};

      if (isImageMime(item.file?.type)) {
        urls.original = URL.createObjectURL(item.file);
        revokeFns.push(() => URL.revokeObjectURL(urls.original));
      }

      if (item.blob && isImageMime(item.blob.type)) {
        urls.result = URL.createObjectURL(item.blob);
        revokeFns.push(() => URL.revokeObjectURL(urls.result));
      }

      if (urls.original || urls.result) {
        nextUrls[item.id] = urls;
      }
    });

    setPreviewUrls(nextUrls);

    return () => {
      revokeFns.forEach((revoke) => revoke());
    };
  }, [fileQueue]);

  useEffect(() => {
    if (!compareItem) return;
    if (!compareableFiles.some((item) => item.id === compareItem.id)) {
      setCompareItem(compareableFiles[0] ?? null);
    }
  }, [compareItem, compareableFiles]);

  function handleSettingChange(id, nextValue) {
    setSettings((cur) => ({ ...cur, [id]: nextValue }));
    // Update resize dimensions when preset changes
    if (id === 'preset' && tool.id === 'image-resize') {
      if (nextValue.includes('900×383')) { setResizeWidth(900); setResizeHeight(383); setAspectRatio(900 / 383); }
      else if (nextValue.includes('358×441')) { setResizeWidth(358); setResizeHeight(441); setAspectRatio(358 / 441); }
      else if (nextValue === '自定义尺寸') { /* keep current values */ }
    }
  }

  async function addFiles(rawFiles) {
    const files = Array.from(rawFiles);
    const newItems = files.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
      name: file.name,
      file,
      originSize: file.size,
      resultSize: null,
      blob: null,
      outputName: null,
      status: 'pending'
    }));
    setFileQueue((cur) => [...cur, ...newItems]);

    if (tool.id === 'image-resize' && files.length > 0 && fileQueue.length === 0) {
      try {
        const firstImage = await loadImage(files[0]);
        const nextWidth = Math.max(1, firstImage.naturalWidth || resizeWidth);
        const nextHeight = Math.max(1, firstImage.naturalHeight || resizeHeight);
        setResizeWidth(nextWidth);
        setResizeHeight(nextHeight);
        setAspectRatio(nextWidth / nextHeight);
        if (settings.preset !== '自定义尺寸') {
          setSettings((cur) => ({ ...cur, preset: '自定义尺寸' }));
        }
      } catch {
        // Keep fallback dimensions when image metadata cannot be read.
      }
    }
  }

  function handleFilePick(event) {
    if (event.target.files?.length) void addFiles(event.target.files);
    event.target.value = '';
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    if (event.dataTransfer.files?.length) void addFiles(event.dataTransfer.files);
  }

  function removeFile(id) {
    setFileQueue((cur) => cur.filter((f) => f.id !== id));
  }

  function clearAll() {
    setFileQueue([]);
  }

  /* ─── Process files ─── */

  const processFiles = useCallback(async (queue = fileQueue) => {
    if (processingRef.current) return;
    processingRef.current = true;
    setIsProcessing(true);

    const pending = queue.filter((f) => f.status === 'pending');

    for (const item of pending) {
      setFileQueue((cur) => cur.map((f) => f.id === item.id ? { ...f, status: 'processing' } : f));

      try {
        let blob = null;
        let outputName = item.name;

        if (isImageCompress) {
          const fmt = outputFormat === '保持原格式' ? null : outputFormat;
          blob = await compressImage(item.file, qualityValue, fmt);
          const ext = extensionFromMimeType(blob?.type);
          if (ext) {
            outputName = item.name.replace(/\.[^.]+$/, `.${ext}`);
          }
        } else if (tool.id === 'image-resize') {
          blob = await resizeImage(item.file, resizeWidth, resizeHeight, settings.fit || '完整显示');
        } else if (tool.id === 'image-convert') {
          blob = await convertImage(item.file, settings.target || 'WebP', settings.background || '保留透明');
          const ext = (settings.target || 'WebP').toLowerCase() === 'jpg' ? 'jpg' : (settings.target || 'webp').toLowerCase();
          outputName = item.name.replace(/\.[^.]+$/, `.${ext}`);
        } else if (tool.id === 'image-to-pdf') {
          // Simulate - real PDF generation would need jsPDF
          blob = item.file;
          outputName = item.name.replace(/\.[^.]+$/, '.pdf');
        } else if (tool.id === 'pdf-to-word') {
          const paragraphs = await extractPdfParagraphs(item.file);
          blob = await createDocxFromParagraphs(paragraphs, item.name);
          outputName = item.name.replace(/\.pdf$/i, '.docx');
        } else {
          // Generic simulation for other file tools
          await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
          blob = item.file;
          if (tool.id === 'word-to-pdf') outputName = item.name.replace(/\.(docx?|doc)$/i, '.pdf');
          else if (tool.id === 'excel-to-csv') outputName = item.name.replace(/\.(xlsx?|xls)$/i, '.csv');
          else if (tool.id === 'csv-to-excel') outputName = item.name.replace(/\.csv$/i, '.xlsx');
        }

        setFileQueue((cur) => cur.map((f) => f.id === item.id ? {
          ...f,
          status: 'done',
          blob,
          outputName,
          resultSize: blob?.size ?? item.originSize
        } : f));
      } catch (error) {
        console.error(`[${tool.id}] process failed for ${item.name}`, error);
        setFileQueue((cur) => cur.map((f) => f.id === item.id ? { ...f, status: 'error' } : f));
      }
    }

    setIsProcessing(false);
    processingRef.current = false;
  }, [fileQueue, isImageCompress, outputFormat, qualityValue, resizeWidth, resizeHeight, settings, tool.id]);

  function rerunWithCurrentSettings() {
    const nextQueue = fileQueue.map((item) =>
      item.status === 'done' || item.status === 'error'
        ? {
            ...item,
            status: 'pending',
            blob: null,
            resultSize: null,
            outputName: null
          }
        : item
    );

    setFileQueue(nextQueue);
    void processFiles(nextQueue);
  }

  /* ─── Process text ─── */

  const [textProcessed, setTextProcessed] = useState(false);

  function handleTextProcess() {
    setTextProcessed(true);
  }

  const textPreview = useMemo(
    () => buildTextPreview(tool, textInput, settings),
    [settings, textInput, tool]
  );

  /* ─── Download all ─── */

  async function downloadAll() {
    const doneFiles = fileQueue.filter((f) => f.status === 'done' && f.blob);
    if (doneFiles.length === 1) {
      saveAs(doneFiles[0].blob, doneFiles[0].outputName || doneFiles[0].name);
      return;
    }
    const zip = new JSZip();
    doneFiles.forEach((f) => zip.file(f.outputName || f.name, f.blob));
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${tool.name}-批量处理.zip`);
  }

  /* ─── Render helpers ─── */

  function getCanvasIcon() {
    if (tool.previewMode === 'qr') return QrCode;
    if (tool.previewMode === 'timestamp') return Waypoints;
    if (tool.previewMode === 'dedup') return Type;
    if (tool.category.includes('图片')) return FileImage;
    if (tool.category.includes('文档')) return FileText;
    return ScanText;
  }

  function getCanvasCopy() {
    if (isTextMode) {
      if (isQrMode) return { title: '输入链接到这里', hint: '支持链接、文本内容，生成结果会即时预览。' };
      return { title: '输入内容到这里', hint: '支持多行文本粘贴，结果会在右侧同步展示。' };
    }
    return {
      title: '拖拽文件到这里',
      hint: `支持 ${tool.formats.join('、')} 格式，可同时添加多个文件`
    };
  }

  function resultTitleFor() {
    if (tool.id === 'image-compress') return '压缩设置';
    if (tool.id === 'qr-generator') return '生成设置';
    if (tool.id === 'text-dedup') return '去重设置';
    if (tool.id === 'timestamp-convert') return '转换设置';
    if (tool.name.includes('转')) return '转换设置';
    if (tool.name.includes('水印')) return '水印设置';
    if (tool.name.includes('尺寸')) return '尺寸设置';
    if (tool.name.includes('合并')) return '合并设置';
    if (tool.name.includes('拆分')) return '拆分设置';
    return `${tool.name}设置`;
  }

  const CanvasIcon = getCanvasIcon();
  const canvasCopy = getCanvasCopy();

  return (
    <div className="detail-workbench">
      {/* ─── Left: Canvas / Input ─── */}
      <section className="detail-workbench__canvas">
        <div
          className={`detail-workbench__dropzone ${isDragging ? 'is-dragging' : ''} ${fileQueue.length > 0 ? 'has-files' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={!isTextMode ? handleDrop : undefined}
        >
          {isTextMode ? (
            <>
              <div className="detail-workbench__intro">
                <CanvasIcon aria-hidden="true" size={54} />
                <h2>{canvasCopy.title}</h2>
                <p>{canvasCopy.hint}</p>
              </div>

              <textarea
                className="detail-workbench__textarea"
                placeholder={tool.textPlaceholder}
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); setTextProcessed(false); }}
              />
            </>
          ) : (
            <>
              {fileQueue.length === 0 && (
                <div className="detail-workbench__intro">
                  <CloudUpload aria-hidden="true" size={56} />
                  <h2>{canvasCopy.title}</h2>
                  <p>{canvasCopy.hint}</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                accept={tool.accept}
                className="detail-workbench__file-input"
                multiple
                type="file"
                onChange={handleFilePick}
              />

              {fileQueue.length === 0 && (
                <button
                  className="detail-workbench__choose"
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  选择文件
                </button>
              )}

              {fileQueue.length > 0 && (
                <div className="detail-workbench__file-list">
                  <div className="detail-workbench__file-list-header">
                    <span>{fileQueue.length} 个文件{allDone ? `，已完成 ${doneCount} 个` : ''}</span>
                    <div className="detail-workbench__file-list-actions">
                      <button type="button" onClick={() => fileInputRef.current?.click()}>
                        继续添加
                      </button>
                      <button type="button" onClick={clearAll}>
                        <Trash2 size={14} /> 清空
                      </button>
                    </div>
                  </div>
                  <div className="detail-workbench__file-scroll">
                    {fileQueue.map((item) => (
                      <FileItem key={item.id} item={item} onRemove={removeFile} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ─── Right: Settings & Results ─── */}
      <section className="detail-workbench__panel">
        <h2>{resultTitleFor()}</h2>

        <div className="detail-workbench__fields">
          {isImageCompress ? (
            <>
              <div className="detail-field">
                <label>压缩质量 <span className="detail-field__value">{qualityValue}%</span></label>
                <div className="detail-range">
                  <input
                    max="100"
                    min="1"
                    step="1"
                    type="range"
                    value={qualityValue}
                    onInput={(e) => setQualityValue(Number(e.target.value))}
                    style={{ '--range-progress': `${qualityValue}%` }}
                  />
                  <div className="detail-range__labels">
                    <span>更小体积</span>
                    <span>更高画质</span>
                  </div>
                </div>
              </div>

              <div className="detail-field">
                <label>输出格式</label>
                <DetailSelect
                  options={['保持原格式', ...tool.formats]}
                  value={outputFormat}
                  onChange={setOutputFormat}
                />
              </div>
            </>
          ) : tool.id === 'image-resize' ? (
            <>
              <div className="detail-field">
                <label>尺寸预设</label>
                <DetailSelect
                  options={['公众号封面 900×383', '工牌照 358×441', '自定义尺寸']}
                  value={settings.preset}
                  onChange={(v) => handleSettingChange('preset', v)}
                />
              </div>

              <div className="detail-field">
                <label>宽度 × 高度 (px)</label>
                <div className="detail-resize-dims">
                  <input
                    className="detail-resize-dims__input"
                    type="number"
                    min="1"
                    max="9999"
                    value={resizeWidth}
                    onChange={(e) => {
                      const w = Math.max(1, Number(e.target.value) || 1);
                      setResizeWidth(w);
                      if (lockRatio) setResizeHeight(Math.round(w / aspectRatio));
                      if (settings.preset !== '自定义尺寸') handleSettingChange('preset', '自定义尺寸');
                    }}
                  />
                  <button
                    className={`detail-resize-dims__lock ${lockRatio ? 'is-locked' : ''}`}
                    type="button"
                    title={lockRatio ? '解锁比例' : '锁定比例'}
                    onClick={() => {
                      if (!lockRatio) setAspectRatio(resizeWidth / resizeHeight);
                      setLockRatio(!lockRatio);
                    }}
                  >
                    {lockRatio ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                      </svg>
                    )}
                  </button>
                  <input
                    className="detail-resize-dims__input"
                    type="number"
                    min="1"
                    max="9999"
                    value={resizeHeight}
                    onChange={(e) => {
                      const h = Math.max(1, Number(e.target.value) || 1);
                      setResizeHeight(h);
                      if (lockRatio) setResizeWidth(Math.round(h * aspectRatio));
                      if (settings.preset !== '自定义尺寸') handleSettingChange('preset', '自定义尺寸');
                    }}
                  />
                </div>
              </div>

              <div className="detail-field">
                <label>适配方式</label>
                <DetailSegmented
                  options={['完整显示', '居中裁切', '拉伸填满']}
                  value={settings.fit}
                  onChange={(v) => handleSettingChange('fit', v)}
                />
              </div>
            </>
          ) : isQrMode ? (
            <>
              <div className="detail-field-row">
                <div className="detail-field detail-field--half">
                  <label>导出样式</label>
                  <DetailSelect
                    options={QR_STYLES.map((s) => s.label)}
                    value={QR_STYLES.find((s) => s.id === qrStyleId)?.label || '经典黑白'}
                    onChange={(v) => {
                      const found = QR_STYLES.find((s) => s.label === v);
                      if (found) setQrStyleId(found.id);
                    }}
                  />
                </div>
                <div className="detail-field detail-field--half">
                  <label>中心 Logo</label>
                  <input
                    ref={qrLogoInputRef}
                    accept=".png,.jpg,.jpeg,.svg,.webp"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setQrLogo(file);
                      e.target.value = '';
                    }}
                  />
                  <div className="detail-qr-logo-field">
                    {qrLogo ? (
                      <div className="detail-qr-logo-field__preview">
                        <img src={URL.createObjectURL(qrLogo)} alt="Logo" />
                        <button type="button" onClick={() => setQrLogo(null)}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : null}
                    <button
                      className="detail-qr-logo-field__btn"
                      type="button"
                      onClick={() => qrLogoInputRef.current?.click()}
                    >
                      {qrLogo ? '更换' : '上传 Logo'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="detail-field">
                <label>尺寸 <span className="detail-field__value">{qrSize}px</span></label>
                <div className="detail-qr-size-row">
                  <input
                    className="detail-resize-dims__input"
                    type="number"
                    min="128"
                    max="1024"
                    step="32"
                    value={qrSize}
                    onChange={(e) => setQrSize(Math.max(128, Math.min(1024, Number(e.target.value) || 256)))}
                  />
                  <div className="detail-range" style={{ flex: 1 }}>
                    <input
                      max="1024"
                      min="128"
                      step="32"
                      type="range"
                      value={qrSize}
                      onInput={(e) => setQrSize(Number(e.target.value))}
                      style={{ '--range-progress': `${((qrSize - 128) / (1024 - 128)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {textInput.trim() ? (
                <div className="detail-qr-live-preview">
                  <button
                    className="detail-qr-live-preview__refresh"
                    type="button"
                    title="换一个样式"
                    onClick={randomQrStyle}
                  >
                    <RefreshCcw size={16} />
                  </button>
                  <QrCanvas
                    value={textInput.trim()}
                    size={qrSize}
                    styleId={qrStyleId}
                    logo={qrLogo}
                  />
                </div>
              ) : null}
            </>
          ) : (
            tool.settings.map((setting) => (
              <div className="detail-field" key={setting.id}>
                <label>{setting.label}</label>
                {setting.type === 'select' ? (
                  <DetailSelect
                    options={setting.options}
                    value={settings[setting.id]}
                    onChange={(v) => handleSettingChange(setting.id, v)}
                  />
                ) : (
                  <DetailSegmented
                    options={setting.options}
                    value={settings[setting.id]}
                    onChange={(v) => handleSettingChange(setting.id, v)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        {/* Action button */}
        {isTextMode && isQrMode ? (
          <div className="detail-workbench__action-row">
            <button
              className="detail-workbench__action"
              disabled={!hasInput}
              type="button"
              onClick={handleTextProcess}
            >
              生成二维码
            </button>
            <button
              className="detail-workbench__action detail-workbench__action--download"
              disabled={!textInput.trim()}
              type="button"
              onClick={() => {
                const canvas = document.querySelector('.detail-qr-canvas');
                if (canvas) {
                  canvas.toBlob((blob) => {
                    if (blob) saveAs(blob, `qrcode-${qrSize}px.png`);
                  });
                }
              }}
            >
              <Download size={16} />
              下载
            </button>
          </div>
        ) : isTextMode ? (
          <button
            className="detail-workbench__action"
            disabled={!hasInput}
            type="button"
            onClick={handleTextProcess}
          >
            {tool.actionLabel}
          </button>
        ) : (
          <div className="detail-workbench__action-row">
            <button
              className="detail-workbench__action"
              disabled={isProcessing || !hasInput || (!hasPending && !allDone)}
              type="button"
              onClick={() => {
                if (allDone && !hasPending) {
                  rerunWithCurrentSettings();
                } else {
                  void processFiles();
                }
              }}
            >
              {isProcessing ? '处理中…' : allDone ? (isImageCompress ? '重新压缩' : '重新执行') : tool.actionLabel}
            </button>
            {allDone && doneCount > 0 && (
              <>
                {isImageCompress && (
                  <button
                    className="detail-workbench__action detail-workbench__action--compare"
                    type="button"
                    onClick={() => {
                      const target = compareableFiles[0] ?? null;
                      if (target) { setCompareItem(target); setCompareOpen(true); setComparePosition(50); }
                    }}
                  >
                    对比预览
                  </button>
                )}
                <button
                  className="detail-workbench__action detail-workbench__action--download"
                  type="button"
                  onClick={downloadAll}
                >
                  <Download size={18} />
                  {doneCount > 1 ? '打包下载' : '下载'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Results */}
        <div className="detail-workbench__result">
          {!isTextMode && fileQueue.length > 0 && isImageCompress && allDone && (
            <div className="detail-workbench__stats">
              <article>
                <strong>{formatBytes(fileQueue.reduce((s, f) => s + f.originSize, 0))}</strong>
                <span>压缩前</span>
              </article>
              <article>
                <strong>{formatBytes(fileQueue.filter((f) => f.status === 'done').reduce((s, f) => s + (f.resultSize || f.originSize), 0))}</strong>
                <span>压缩后</span>
              </article>
              <article>
                <strong>
                  {(() => {
                    const totalOrigin = fileQueue.reduce((s, f) => s + f.originSize, 0);
                    const totalResult = fileQueue.filter((f) => f.status === 'done').reduce((s, f) => s + (f.resultSize || f.originSize), 0);
                    const percent = totalOrigin > 0 ? Math.round((1 - totalResult / totalOrigin) * 100) : 0;
                    return percent > 0 ? `-${percent}%` : '已是最优';
                  })()}
                </strong>
                <span>节省</span>
              </article>
            </div>
          )}

          {isTextMode && textProcessed && textPreview && !isQrMode ? (
            <div className="detail-workbench__text-result">
              <strong>{textPreview.title}</strong>
              <span>{textPreview.meta}</span>
              <pre>{textPreview.body}</pre>
              <button
                className="detail-workbench__copy-btn"
                type="button"
                onClick={() => navigator.clipboard?.writeText(textPreview.body)}
              >
                复制结果
              </button>
            </div>
          ) : null}
        </div>
      </section>

      {/* ─── Compare Preview Modal ─── */}
      {compareOpen && compareItem && (
        <div className="detail-compare-overlay" onClick={() => setCompareOpen(false)}>
          <div className="detail-compare-modal" onClick={(e) => e.stopPropagation()}>
            <div className="detail-compare-modal__header">
              <div className="detail-compare-modal__title">
                <h3>压缩前后对比</h3>
                <span>{compareItem.name}</span>
              </div>
              <button type="button" onClick={() => setCompareOpen(false)}>
                <X size={20} />
              </button>
            </div>
            {compareableFiles.length > 1 ? (
              <div className="detail-compare-modal__thumb-strip" role="tablist" aria-label="切换对比文件">
                {compareableFiles.map((item) => {
                  const urls = previewUrls[item.id];
                  const thumbSrc = urls?.result || urls?.original;
                  if (!thumbSrc) return null;

                  return (
                    <button
                      aria-selected={compareItem.id === item.id}
                      className={`detail-compare-modal__thumb ${compareItem.id === item.id ? 'is-active' : ''}`}
                      key={item.id}
                      role="tab"
                      type="button"
                      onClick={() => setCompareItem(item)}
                    >
                      <img alt={item.name} src={thumbSrc} />
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="detail-compare-modal__body">
              <div className="detail-compare-slider" style={{ '--compare-pos': `${comparePosition}%` }}>
                <div className="detail-compare-slider__before">
                  <img src={comparePreviewUrls?.original} alt="压缩前" />
                  <span className="detail-compare-slider__label detail-compare-slider__label--before">
                    压缩前 · {formatBytes(compareItem.originSize)}
                  </span>
                </div>
                <div className="detail-compare-slider__after">
                  <img src={comparePreviewUrls?.result} alt="压缩后" />
                  <span className="detail-compare-slider__label detail-compare-slider__label--after">
                    压缩后 · {formatBytes(compareItem.resultSize)}
                  </span>
                </div>
                <input
                  className="detail-compare-slider__input"
                  type="range"
                  min="0"
                  max="100"
                  value={comparePosition}
                  onInput={(e) => setComparePosition(Number(e.target.value))}
                />
                <div className="detail-compare-slider__handle" />
              </div>
            </div>
            <p className="detail-compare-modal__hint">← 拖动滑块对比压缩效果 →</p>
          </div>
        </div>
      )}
    </div>
  );
}
