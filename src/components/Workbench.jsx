import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ChevronDown,
  CloudUpload,
  FileImage,
  FileText,
  QrCode,
  ScanText,
  Sparkles,
  Type,
  Waypoints
} from 'lucide-react';

function formatBytes(value) {
  if (!value) {
    return '0 KB';
  }

  if (value >= 1024 * 1024) {
    return `${(value / 1024 / 1024).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function formatDateTime(date, timezone) {
  return new Intl.DateTimeFormat('zh-CN', {
    timeZone: timezone === 'UTC' ? 'UTC' : 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(date).replace(/\//g, '-');
}

function estimateCompressedSize(size, settings) {
  const qualityRatio = {
    轻一点: 0.78,
    平衡: 0.52,
    更省体积: 0.34
  };
  const limitBytes = {
    保持画质优先: Infinity,
    '控制在 2MB 内': 2 * 1024 * 1024,
    '控制在 1MB 内': 1 * 1024 * 1024
  };
  const ratio = qualityRatio[settings.quality] ?? 0.52;
  const estimated = Math.max(12 * 1024, Math.round(size * ratio));
  const limit = limitBytes[settings.limit] ?? Infinity;

  return Math.min(size, estimated, limit);
}

function buildTextPreview(tool, value, settings) {
  const content = value.trim();

  if (!content) {
    return null;
  }

  if (tool.previewMode === 'dedup') {
    const rawLines = value.split(/\r?\n/);
    const cleaned = rawLines
      .map((line) => (settings.trim === '自动去首尾空格' ? line.trim() : line))
      .filter((line) => (settings.emptyLine === '忽略空行' ? line !== '' : true));
    const uniqueLines = [];
    const seen = new Set();

    cleaned.forEach((line) => {
      if (!seen.has(line)) {
        seen.add(line);
        uniqueLines.push(line);
      }
    });

    return {
      title: '去重结果',
      meta: `原始 ${cleaned.length} 行，去重后 ${uniqueLines.length} 行`,
      body: uniqueLines.join('\n') || '没有可输出的内容。'
    };
  }

  if (tool.previewMode === 'timestamp') {
    const timezone = settings.timezone === 'UTC' ? 'UTC' : 'Asia/Shanghai';
    const rows = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        if (/^\d{13}$/.test(line)) {
          return `${line} -> ${formatDateTime(new Date(Number(line)), timezone)}`;
        }

        if (/^\d{10}$/.test(line)) {
          return `${line} -> ${formatDateTime(new Date(Number(line) * 1000), timezone)}`;
        }

        const parsed = new Date(line.replace(' ', 'T'));

        if (!Number.isNaN(parsed.getTime())) {
          return `${line} -> ${Math.floor(parsed.getTime() / 1000)} / ${parsed.getTime()}`;
        }

        return `${line} -> 无法识别`;
      });

    return {
      title: '转换结果',
      meta: `共处理 ${rows.length} 条时间数据`,
      body: rows.join('\n')
    };
  }

  return {
    title: '当前内容',
    meta: '可继续编辑后再生成结果',
    body: content
  };
}

function hashSeed(text) {
  let seed = 0;

  for (let index = 0; index < text.length; index += 1) {
    seed = (seed * 131 + text.charCodeAt(index)) % 2147483647;
  }

  return seed || 13579;
}

function buildQrCells(text) {
  const size = 21;
  let seed = hashSeed(text);
  const cells = [];

  function isFinder(row, column) {
    const inTopLeft = row < 7 && column < 7;
    const inTopRight = row < 7 && column >= size - 7;
    const inBottomLeft = row >= size - 7 && column < 7;

    return inTopLeft || inTopRight || inBottomLeft;
  }

  function isFinderFill(row, column) {
    const localRow = row >= size - 7 ? row - (size - 7) : row;
    const localColumn = column >= size - 7 ? column - (size - 7) : column;
    const outer = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
    const inner = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;

    return outer || inner;
  }

  for (let row = 0; row < size; row += 1) {
    for (let column = 0; column < size; column += 1) {
      if (isFinder(row, column)) {
        cells.push(isFinderFill(row, column));
        continue;
      }

      seed = (seed * 48271) % 2147483647;
      const guideLine = row === 6 || column === 6;
      cells.push(guideLine ? (row + column) % 2 === 0 : seed % 3 !== 0);
    }
  }

  return cells;
}

function QrPreview({ value, inverted }) {
  const cells = useMemo(() => buildQrCells(value), [value]);

  return (
    <div className={`detail-qr ${inverted ? 'is-inverted' : ''}`} aria-hidden="true">
      {cells.map((filled, index) => (
        <span className={filled ? 'is-filled' : ''} key={`${value}-${index}`} />
      ))}
    </div>
  );
}

function DetailSelect({ options, value, onChange }) {
  return (
    <label className="detail-control detail-control--select">
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" size={20} />
    </label>
  );
}

function DetailSegmented({ options, value, onChange }) {
  return (
    <div className="detail-segmented" role="tablist">
      {options.map((option) => (
        <button
          aria-selected={option === value}
          className={option === value ? 'is-active' : ''}
          key={option}
          type="button"
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function qualityValueFromLabel(label) {
  if (label === '轻一点') {
    return 76;
  }

  if (label === '更省体积') {
    return 32;
  }

  return 58;
}

function labelFromQualityValue(value) {
  if (value >= 70) {
    return '轻一点';
  }

  if (value <= 40) {
    return '更省体积';
  }

  return '平衡';
}

function resultTitleFor(tool) {
  if (tool.id === 'image-compress') {
    return '压缩设置';
  }

  if (tool.id === 'qr-generator') {
    return '生成设置';
  }

  if (tool.id === 'text-dedup') {
    return '去重设置';
  }

  if (tool.id === 'timestamp-convert') {
    return '转换设置';
  }

  if (tool.name.includes('转')) {
    return '转换设置';
  }

  if (tool.name.includes('水印')) {
    return '水印设置';
  }

  return `${tool.name}设置`;
}

function getCanvasIcon(tool) {
  if (tool.previewMode === 'qr') {
    return QrCode;
  }

  if (tool.previewMode === 'timestamp') {
    return Waypoints;
  }

  if (tool.previewMode === 'dedup') {
    return Type;
  }

  if (tool.category.includes('图片')) {
    return FileImage;
  }

  if (tool.category.includes('文档')) {
    return FileText;
  }

  return ScanText;
}

function buildCanvasCopy(tool) {
  if (tool.inputMode === 'text') {
    if (tool.previewMode === 'qr') {
      return {
        title: '输入链接到这里',
        hint: '支持链接、文本内容，生成结果会即时预览。'
      };
    }

    return {
      title: '输入内容到这里',
      hint: '支持多行文本粘贴，结果会在右侧同步展示。'
    };
  }

  return {
    title: '拖拽文件到这里',
    hint: `支持 ${tool.formats.join('、')} 格式${tool.id === 'image-compress' ? '，最大 20MB' : ''}`
  };
}

function renderPrimaryStatus({
  hasInput,
  isSuccess,
  isTextMode,
  isQrMode,
  pickedFiles,
  queue,
  textPreview,
  tool
}) {
  if (!hasInput) {
    return '暂无文件上传，处理结果会显示在这里。';
  }

  if (isTextMode) {
    if (isQrMode) {
      return isSuccess
        ? '二维码已生成，可以继续调整样式后再导出。'
        : '内容已准备好，点击按钮后会刷新二维码结果。';
    }

    return isSuccess
      ? `${textPreview?.title || '结果'}已更新，可以继续编辑内容。`
      : '内容已就绪，点击按钮后会更新右侧结果。';
  }

  if (pickedFiles.length === 1) {
    return isSuccess
      ? `${pickedFiles[0].name} 已处理完成。`
      : `${pickedFiles[0].name} 已加入队列，等待处理。`;
  }

  return isSuccess
    ? `共 ${queue.length} 个文件处理完成。`
    : `共 ${queue.length} 个文件已加入队列。`;
}

export default function Workbench({ tool }) {
  const initialValues = useMemo(
    () => Object.fromEntries(tool.settings.map((setting) => [setting.id, setting.defaultValue])),
    [tool.settings]
  );

  const [settings, setSettings] = useState(initialValues);
  const [qualityValue, setQualityValue] = useState(() =>
    qualityValueFromLabel(initialValues.quality || '平衡')
  );
  const [pickedFiles, setPickedFiles] = useState([]);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [outputFormat, setOutputFormat] = useState('保持原格式');
  const fileInputRef = useRef(null);
  const timerRef = useRef(null);
  const isTextMode = tool.inputMode === 'text';
  const isQrMode = tool.previewMode === 'qr';
  const isImageCompress = tool.id === 'image-compress';
  const hasInput = isTextMode ? textInput.trim().length > 0 : pickedFiles.length > 0;
  const CanvasIcon = getCanvasIcon(tool);
  const canvasCopy = buildCanvasCopy(tool);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setSettings(initialValues);
    setQualityValue(qualityValueFromLabel(initialValues.quality || '平衡'));
    setPickedFiles([]);
    setTextInput('');
    setIsProcessing(false);
    setIsSuccess(false);
    setOutputFormat('保持原格式');
  }, [initialValues, tool.id]);

  function handleSettingChange(id, nextValue) {
    if (id === 'quality') {
      setQualityValue(qualityValueFromLabel(nextValue));
    }
    setSettings((current) => ({ ...current, [id]: nextValue }));
    setIsSuccess(false);
  }

  function handleFilePick(event) {
    const nextFiles = Array.from(event.target.files || []).map((file) => ({
      name: file.name,
      size: file.size
    }));

    if (nextFiles.length > 0) {
      setPickedFiles(nextFiles);
      setIsProcessing(false);
      setIsSuccess(false);
    }
  }

  function handleSimulate() {
    if (!hasInput) {
      return;
    }

    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setIsProcessing(true);
    setIsSuccess(false);

    timerRef.current = window.setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
    }, 900);
  }

  const textPreview = useMemo(
    () => buildTextPreview(tool, textInput, settings),
    [settings, textInput, tool]
  );

  const queue = pickedFiles.map((file) => {
    if (isImageCompress) {
      const resultBytes = estimateCompressedSize(file.size, settings);
      const percent = Math.max(1, Math.round((1 - resultBytes / file.size) * 100));

      return {
        name: file.name,
        origin: formatBytes(file.size),
        result: formatBytes(resultBytes),
        status: isSuccess ? `已完成 · -${percent}%` : `等待处理 · 预计 -${percent}%`,
        originBytes: file.size,
        resultBytes
      };
    }

    return {
      name: file.name,
      origin: formatBytes(file.size),
      result: tool.sampleFile.result,
      status: isSuccess ? '已完成' : '等待处理'
    };
  });

  const compressSummary = useMemo(() => {
    if (!isImageCompress || queue.length === 0) {
      return null;
    }

    const totalOrigin = queue.reduce((sum, item) => sum + item.originBytes, 0);
    const totalResult = queue.reduce((sum, item) => sum + item.resultBytes, 0);
    const reduced = Math.max(0, totalOrigin - totalResult);

    return {
      count: queue.length,
      origin: formatBytes(totalOrigin),
      result: formatBytes(totalResult),
      reduced: formatBytes(reduced)
    };
  }, [isImageCompress, queue]);

  const primaryStatus = renderPrimaryStatus({
    hasInput,
    isSuccess,
    isTextMode,
    isQrMode,
    pickedFiles,
    queue,
    textPreview,
    tool
  });

  return (
    <div className="detail-workbench">
      <section className="detail-workbench__canvas">
        <div className="detail-workbench__dropzone">
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
                onChange={(event) => {
                  setTextInput(event.target.value);
                  setIsProcessing(false);
                  setIsSuccess(false);
                }}
              />

              {isQrMode && textInput.trim() ? (
                <div className="detail-workbench__qr-preview">
                  <QrPreview
                    value={textInput.trim()}
                    inverted={settings.style === '深色反白'}
                  />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="detail-workbench__intro">
                <CloudUpload aria-hidden="true" size={56} />
                <h2>{canvasCopy.title}</h2>
                <p>{canvasCopy.hint}</p>
              </div>

              <input
                ref={fileInputRef}
                accept={tool.accept}
                className="detail-workbench__file-input"
                multiple
                type="file"
                onChange={handleFilePick}
              />

              <button
                className="detail-workbench__choose"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                选择{tool.inputMode === 'file' ? '文件' : '内容'}
              </button>

              {pickedFiles.length > 0 ? (
                <div className="detail-workbench__picked">
                  {pickedFiles.map((file) => (
                    <span key={`${file.name}-${file.size}`}>
                      {file.name}
                      <em>{formatBytes(file.size)}</em>
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </div>
      </section>

      <section className="detail-workbench__panel">
        <h2>{resultTitleFor(tool)}</h2>

        <div className="detail-workbench__fields">
          {isImageCompress ? (
            <>
              <div className="detail-field">
                <label>压缩模式</label>
                <DetailSelect
                  options={['保持画质优先', '控制在 2MB 内', '控制在 1MB 内']}
                  value={settings.limit}
                  onChange={(nextValue) => handleSettingChange('limit', nextValue)}
                />
              </div>

              <div className="detail-field">
                <label>压缩质量</label>
                <div className="detail-range">
                  <input
                    max="100"
                    min="0"
                    step="1"
                    type="range"
                    value={qualityValue}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      setQualityValue(nextValue);
                      handleSettingChange('quality', labelFromQualityValue(nextValue));
                    }}
                  />
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
          ) : (
            tool.settings.map((setting) => (
              <div className="detail-field" key={setting.id}>
                <label>{setting.label}</label>
                {setting.type === 'select' ? (
                  <DetailSelect
                    options={setting.options}
                    value={settings[setting.id]}
                    onChange={(nextValue) => handleSettingChange(setting.id, nextValue)}
                  />
                ) : (
                  <DetailSegmented
                    options={setting.options}
                    value={settings[setting.id]}
                    onChange={(nextValue) => handleSettingChange(setting.id, nextValue)}
                  />
                )}
              </div>
            ))
          )}
        </div>

        <button
          className="detail-workbench__action"
          disabled={isProcessing || !hasInput}
          type="button"
          onClick={handleSimulate}
        >
          {isProcessing ? '处理中…' : tool.actionLabel}
        </button>

        <div className="detail-workbench__result">
          <p className="detail-workbench__result-copy">{primaryStatus}</p>

          {compressSummary ? (
            <div className="detail-workbench__stats">
              <article>
                <strong>{compressSummary.origin}</strong>
                <span>压缩前</span>
              </article>
              <article>
                <strong>{compressSummary.result}</strong>
                <span>压缩后</span>
              </article>
              <article>
                <strong>{compressSummary.reduced}</strong>
                <span>可减少</span>
              </article>
            </div>
          ) : null}

          {queue.length > 0 ? (
            <div className="detail-workbench__queue">
              {queue.slice(0, 4).map((item) => (
                <div className="detail-workbench__queue-row" key={`${item.name}-${item.result}`}>
                  <strong>{item.name}</strong>
                  <span>
                    {item.origin} → {item.result}
                  </span>
                  <em>{item.status}</em>
                </div>
              ))}
            </div>
          ) : null}

          {isTextMode && textPreview ? (
            <div className="detail-workbench__text-result">
              <strong>{textPreview.title}</strong>
              <span>{textPreview.meta}</span>
              <pre>{textPreview.body}</pre>
            </div>
          ) : null}

          {isQrMode && textInput.trim() ? (
            <div className="detail-workbench__text-result">
              <strong>{isSuccess ? '二维码已生成' : '二维码预览已准备好'}</strong>
              <span>{settings.style}</span>
              <pre>{textInput.trim()}</pre>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
