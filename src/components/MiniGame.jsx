import React from 'react';
import {
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { Ban, Clock3, FolderOpen, Play, RotateCcw, X } from 'lucide-react';
import { miniGameBoxes, miniGameFilePool, miniGameTips } from '../data/home';

const DEFAULT_TIME = 30;
const INITIAL_FILE_COUNT = 5;
const MIN_VISIBLE_FILES = 3;
const MAX_VISIBLE_FILES = 5;
const FILE_SLOTS = [
  { x: 8, y: 10 },
  { x: 32, y: 8 },
  { x: 56, y: 12 },
  { x: 74, y: 10 },
  { x: 82, y: 46 },
  { x: 20, y: 50 },
  { x: 46, y: 48 }
];

const TYPE_ART = {
  pdf: {
    shortLabel: 'PDF',
    bucketLabel: 'PDF',
    primary: '#ff5f5f',
    secondary: '#ff9a96',
    deep: '#db3f3f',
    soft: '#fff1f3'
  },
  image: {
    shortLabel: 'PNG',
    bucketLabel: 'IMG',
    primary: '#8f6ff2',
    secondary: '#c2a6ff',
    deep: '#6847c7',
    soft: '#f5efff'
  },
  word: {
    shortLabel: 'Word',
    bucketLabel: 'DOC',
    primary: '#4c8dff',
    secondary: '#91baff',
    deep: '#2d5fc8',
    soft: '#eef4ff'
  },
  sheet: {
    shortLabel: 'Excel',
    bucketLabel: 'XLS',
    primary: '#57be67',
    secondary: '#95dda0',
    deep: '#2f8640',
    soft: '#effff2'
  }
};

function getLabelMetrics(text, surface = 'file') {
  const length = String(text || '').length;

  if (surface === 'bin') {
    if (length <= 3) {
      return { fontSize: 17, letterSpacing: '0.02em', y: 66 };
    }
    if (length === 4) {
      return { fontSize: 15, letterSpacing: '0.01em', y: 66 };
    }
    if (length === 5) {
      return { fontSize: 13, letterSpacing: '0', y: 66 };
    }
    return { fontSize: 11, letterSpacing: '-0.01em', y: 66 };
  }

  if (length <= 3) {
    return { fontSize: 25, letterSpacing: '0.01em', y: 50 };
  }
  if (length === 4) {
    return { fontSize: 20, letterSpacing: '0', y: 50 };
  }
  if (length === 5) {
    return { fontSize: 17, letterSpacing: '-0.01em', y: 50 };
  }
  return { fontSize: 14, letterSpacing: '-0.015em', y: 50 };
}

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function nextId(prefix = 'file') {
  return `${prefix}-${crypto.randomUUID()}`;
}

function buildFile(usedSlotIndexes = []) {
  const slotIndexes = FILE_SLOTS.map((_, index) => index).filter(
    (index) => !usedSlotIndexes.includes(index)
  );
  const slotIndex =
    slotIndexes[Math.floor(Math.random() * slotIndexes.length)] ??
    Math.floor(Math.random() * FILE_SLOTS.length);
  const base = FILE_SLOTS[slotIndex];
  const file = miniGameFilePool[Math.floor(Math.random() * miniGameFilePool.length)];

  return {
    id: nextId(),
    type: file.type,
    label: file.label,
    slotIndex,
    x: base.x + randomBetween(-1, 1),
    y: base.y + randomBetween(-2, 2),
    rotation: randomBetween(-12, 12),
    status: 'ready'
  };
}

function buildFiles(count, existingFiles = []) {
  const files = [];
  const usedSlotIndexes = existingFiles.map((file) => file.slotIndex);

  while (files.length < count) {
    const newFile = buildFile([...usedSlotIndexes, ...files.map((file) => file.slotIndex)]);
    files.push(newFile);
  }

  return files;
}

function createInitialGame(initialTime) {
  return {
    status: 'idle',
    timeLeft: initialTime,
    score: 0,
    files: buildFiles(INITIAL_FILE_COUNT),
    activeId: null,
    hoverBin: null,
    feedbackBin: null,
    feedbackKind: null,
    tip: miniGameTips.idle,
    resultText: '',
    resultTitle: '',
    resultOpen: false
  };
}

function getResultCopy(score) {
  if (score >= 120) {
    return {
      title: miniGameTips.finished,
      text: `本轮得分 ${score}，文件排得明明白白。`
    };
  }

  if (score >= 60) {
    return {
      title: miniGameTips.finished,
      text: `本轮得分 ${score}，手速已经很稳了。`
    };
  }

  return {
    title: miniGameTips.finished,
    text: `本轮得分 ${score}，再来一局很快就顺手。`
  };
}

function MiniFileArt({ type, label }) {
  const art = TYPE_ART[type] ?? TYPE_ART.pdf;
  const title = label || art.shortLabel;
  const badgeMetrics = getLabelMetrics(title, 'file');
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      aria-hidden="true"
      className="niuma-file-chip__svg"
      viewBox="0 0 78 82"
      role="img"
    >
      <defs>
        <linearGradient id={`${gradientId}-file`} x1="12" x2="66" y1="9" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
        <linearGradient id={`${gradientId}-fold`} x1="52" x2="72" y1="10" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.36" />
        </linearGradient>
      </defs>
      <path
        d="M18 8h36l14 14v43c0 5.4-3.8 9.4-9.2 9.4H18c-5.4 0-9.2-4-9.2-9.4V17.4C8.8 12 12.6 8 18 8Z"
        fill={`url(#${gradientId}-file)`}
        stroke="#fff"
        strokeOpacity="0.38"
        strokeWidth="1.6"
      />
      <path d="M54 9v15.5c0 2.5 1.8 4.3 4.2 4.3H68" fill={`url(#${gradientId}-fold)`} />
      <path d="M54 9v15.5c0 2.5 1.8 4.3 4.2 4.3H68" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1.6" />
      <path d="M16 15c8-4.5 28-3.4 39.4 0" fill="none" stroke="#fff" strokeOpacity="0.22" strokeWidth="4" strokeLinecap="round" />

      <text
        x="39"
        y={badgeMetrics.y}
        fill="#fff"
        fontFamily="Inter, PingFang SC, sans-serif"
        fontSize={badgeMetrics.fontSize}
        fontWeight="800"
        letterSpacing={badgeMetrics.letterSpacing}
        textAnchor="middle"
      >
        {title}
      </text>
    </svg>
  );
}

function MiniBinArt({ type, label }) {
  const art = TYPE_ART[type] ?? TYPE_ART.pdf;
  const binMetrics = getLabelMetrics(art.bucketLabel, 'bin');
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      aria-label={label}
      className="niuma-game__bin-art"
      viewBox="0 0 108 92"
      role="img"
    >
      <defs>
        <linearGradient id={`${gradientId}-body`} x1="20" x2="88" y1="30" y2="86" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.soft} />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.68" />
        </linearGradient>
        <linearGradient id={`${gradientId}-rim`} x1="17" x2="91" y1="11" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ffffff" />
          <stop offset="0.34" stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
        <linearGradient id={`${gradientId}-inner`} x1="24" x2="84" y1="20" y2="34" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
      </defs>
      <path
        d="M21 31h66l-5.8 48.5c-.7 5.2-4.5 8.5-9.8 8.5H36.6c-5.3 0-9.1-3.3-9.8-8.5L21 31Z"
        fill={`url(#${gradientId}-body)`}
        stroke={art.primary}
        strokeOpacity="0.26"
        strokeWidth="2"
      />
      <path
        d="M16 27 24 12h60l8 15v9H16v-9Z"
        fill={`url(#${gradientId}-rim)`}
        stroke={art.primary}
        strokeOpacity="0.32"
        strokeWidth="2"
      />
      <path d="M24 18h60l4.8 9H19.2L24 18Z" fill={`url(#${gradientId}-inner)`} opacity="0.6" />
      <path d="M23 37h62" stroke="#fff" strokeOpacity="0.55" strokeWidth="3" strokeLinecap="round" />
      <text
        x="54"
        y={binMetrics.y}
        fill="#2d3455"
        fontFamily="Inter, PingFang SC, sans-serif"
        fontSize={binMetrics.fontSize}
        fontWeight="800"
        letterSpacing={binMetrics.letterSpacing}
        textAnchor="middle"
      >
        {art.bucketLabel}
      </text>
    </svg>
  );
}

function MiniFile({ file, dragging = false }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: file.id,
    disabled: dragging
  });

  const style = {
    left: `${file.x}%`,
    top: `${file.y}%`,
    rotate: `${file.rotation}deg`,
    transform:
      !isDragging && transform
        ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
        : undefined,
    opacity: file.status === 'exiting' ? 0 : isDragging ? 0.2 : 1
  };

  return (
    <button
      ref={setNodeRef}
      aria-label={file.label}
      className={`niuma-file-chip ${file.status === 'exiting' ? 'is-exiting' : ''} ${
        isDragging ? 'is-dragging' : ''
      }`}
      style={style}
      type="button"
      {...listeners}
      {...attributes}
    >
      <MiniFileArt label={file.label} type={file.type} />
    </button>
  );
}

function BinTarget({ box, onRegister, tone }) {
  const { isOver, setNodeRef } = useDroppable({ id: box.type });
  const registerRef = React.useCallback(
    (node) => {
      setNodeRef(node);
      onRegister?.(box.type, node);
    },
    [box.type, onRegister, setNodeRef]
  );

  return (
    <div
      ref={registerRef}
      className={`niuma-game__bin ${isOver ? 'is-highlighted' : ''} ${
        tone ? `is-${tone}` : ''
      }`}
    >
      <MiniBinArt label={box.label} type={box.type} />
    </div>
  );
}

export default function MiniGame({
  initialTime = DEFAULT_TIME,
  onFinish,
  style
}) {
  const [game, setGame] = React.useState(() => createInitialGame(initialTime));
  const [landingFx, setLandingFx] = React.useState(null);
  const finishSentRef = React.useRef(false);
  const binRefs = React.useRef({});
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    })
  );

  const activeFile = React.useMemo(
    () => game.files.find((file) => file.id === game.activeId) ?? null,
    [game.activeId, game.files]
  );

  const countdownLabel = `00:${String(game.timeLeft).padStart(2, '0')}`;

  React.useEffect(() => {
    if (game.status !== 'playing') {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setGame((current) => {
        if (current.status !== 'playing') {
          return current;
        }

        if (current.timeLeft <= 1) {
          const result = getResultCopy(current.score);

          return {
            ...current,
            status: 'finished',
            timeLeft: 0,
            resultOpen: true,
            resultTitle: result.title,
            resultText: result.text,
            activeId: null,
            hoverBin: null,
            feedbackBin: null,
            feedbackKind: null
          };
        }

        return { ...current, timeLeft: current.timeLeft - 1 };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [game.status]);

  React.useEffect(() => {
    if (game.status !== 'playing' || game.files.length >= MIN_VISIBLE_FILES) {
      return undefined;
    }

    const replenishTimer = window.setTimeout(() => {
      setGame((current) => {
        if (current.status !== 'playing' || current.files.length >= MIN_VISIBLE_FILES) {
          return current;
        }

        const nextCount = Math.min(MAX_VISIBLE_FILES - current.files.length, INITIAL_FILE_COUNT);

        return {
          ...current,
          files: [...current.files, ...buildFiles(nextCount, current.files)]
        };
      });
    }, 260);

    return () => window.clearTimeout(replenishTimer);
  }, [game.files.length, game.status]);

  React.useEffect(() => {
    if (game.status !== 'finished' || finishSentRef.current) {
      return;
    }

    finishSentRef.current = true;
    onFinish?.(game.score);
  }, [game.score, game.status, onFinish]);

  function clearFeedbackSoon() {
    window.setTimeout(() => {
      setGame((current) => ({
        ...current,
        feedbackBin: null,
        feedbackKind: null
      }));
    }, 420);
  }

  function playLandingFx(file, sourceRect, targetRect) {
    if (!file || !sourceRect || !targetRect) {
      return;
    }

    const fxId = `${file.id}-${Date.now()}`;
    const startLeft = sourceRect.left + sourceRect.width / 2 - 36;
    const startTop = sourceRect.top + sourceRect.height / 2 - 38;
    const targetLeft = targetRect.left + targetRect.width / 2 - 34;
    const targetTop = targetRect.top + targetRect.height / 2 - 34;

    setLandingFx({
      id: fxId,
      label: file.label,
      type: file.type,
      startLeft,
      startTop,
      deltaX: targetLeft - startLeft,
      deltaY: targetTop - startTop
    });

    window.setTimeout(() => {
      setLandingFx((current) => (current?.id === fxId ? null : current));
    }, 460);
  }

  function registerBinRef(type, node) {
    if (node) {
      binRefs.current[type] = node;
      return;
    }

    delete binRefs.current[type];
  }

  function findBinByRect(rect) {
    if (!rect) {
      return null;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    for (const box of miniGameBoxes) {
      const binNode = binRefs.current[box.type];

      if (!binNode) {
        continue;
      }

      const bounds = binNode.getBoundingClientRect();
      const isInside =
        centerX >= bounds.left &&
        centerX <= bounds.right &&
        centerY >= bounds.top &&
        centerY <= bounds.bottom;

      if (isInside) {
        return box.type;
      }
    }

    return null;
  }

  function beginGame() {
    finishSentRef.current = false;
    setGame({
      status: 'playing',
      timeLeft: initialTime,
      score: 0,
      files: buildFiles(INITIAL_FILE_COUNT),
      activeId: null,
      hoverBin: null,
      feedbackBin: null,
      feedbackKind: null,
      tip: miniGameTips.progress,
      resultText: '',
      resultTitle: '',
      resultOpen: false
    });
  }

  function pauseOrResumeGame() {
    setGame((current) => {
      if (current.status === 'playing') {
        return { ...current, status: 'paused', activeId: null, hoverBin: null };
      }
      if (current.status === 'paused') {
        return { ...current, status: 'playing' };
      }
      return current;
    });
  }

  function cancelGame() {
    finishSentRef.current = false;
    setGame(createInitialGame(initialTime));
  }

  function closeResult() {
    setGame((current) => ({ ...current, resultOpen: false }));
  }

  function removeFileWithAnimation(fileId, nextScore, nextTip) {
    setGame((current) => ({
      ...current,
      score: nextScore,
      tip: nextTip,
      activeId: null,
      hoverBin: null,
      files: current.files.map((file) =>
        file.id === fileId ? { ...file, status: 'exiting' } : file
      )
    }));

    window.setTimeout(() => {
      setGame((current) => ({
        ...current,
        files: current.files.filter((file) => file.id !== fileId)
      }));
    }, 180);
  }

  function handleDragStart(event) {
    if (game.status !== 'playing') {
      return;
    }

    setGame((current) => ({ ...current, activeId: String(event.active.id), hoverBin: null }));
  }

  function handleDragOver(event) {
    if (game.status !== 'playing') {
      return;
    }

    setGame((current) => ({
      ...current,
      hoverBin: event.over ? String(event.over.id) : null
    }));
  }

  function handleDragCancel() {
    setGame((current) => ({
      ...current,
      activeId: null,
      hoverBin: null
    }));
  }

  function handleDragEnd(event) {
    if (game.status !== 'playing') {
      return;
    }

    const fileId = String(event.active.id);
    const binId =
      event.over?.id != null
        ? String(event.over.id)
        : findBinByRect(event.active.rect.current.translated ?? event.active.rect.current.initial);
    const file = game.files.find((item) => item.id === fileId);

    if (!file || !binId) {
      handleDragCancel();
      return;
    }

    if (file.type === binId) {
      const nextScore = game.score + 10;
      const sourceRect = event.active.rect.current.translated ?? event.active.rect.current.initial;
      const targetRect = binRefs.current[binId]?.getBoundingClientRect?.() ?? null;

      setGame((current) => ({
        ...current,
        feedbackBin: binId,
        feedbackKind: 'success'
      }));
      playLandingFx(file, sourceRect, targetRect);
      removeFileWithAnimation(fileId, nextScore, miniGameTips.success);
      clearFeedbackSoon();
      return;
    }

    const nextScore = Math.max(0, game.score - 5);

    setGame((current) => ({
      ...current,
      score: nextScore,
      activeId: null,
      hoverBin: null,
      feedbackBin: binId,
      feedbackKind: 'error',
      tip: miniGameTips.error
    }));
    clearFeedbackSoon();
  }

  return (
    <div
      className={`niuma-widget niuma-widget--game ${game.resultOpen ? 'has-result-open' : ''}`}
      style={style}
    >
      <div className="niuma-widget__header">
        <div className="niuma-widget__title">
          <FolderOpen aria-hidden="true" size={16} />
          <span>文件整理</span>
        </div>
        <div className="niuma-game__header-tools">
          {game.status === 'playing' ? (
            <div className="niuma-game__score">
              <span>得分</span>
              <strong>{game.score}</strong>
            </div>
          ) : null}
          <div className={`niuma-game__timer ${game.status === 'playing' && game.timeLeft <= 5 ? 'is-urgent' : ''}`}>
            <Clock3 aria-hidden="true" size={12} />
            <span>{countdownLabel}</span>
          </div>
          {game.status === 'playing' || game.status === 'paused' ? (
            <>
              <button
                className="niuma-home__ghost-pill niuma-game__ctrl-btn is-danger"
                type="button"
                onClick={cancelGame}
              >
                <Ban aria-hidden="true" size={14} />
                <span>不玩了</span>
              </button>
            </>
          ) : (
            <button className="niuma-home__primary-pill niuma-game__start-btn" type="button" onClick={beginGame}>
              {game.status === 'idle' ? <Play aria-hidden="true" size={14} /> : <RotateCcw aria-hidden="true" size={14} />}
              <span>{game.status === 'idle' ? '开始' : '重来'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="niuma-game__body">
        <DndContext
          autoScroll={false}
          collisionDetection={pointerWithin}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always
            }
          }}
          sensors={sensors}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
          onDragOver={handleDragOver}
          onDragStart={handleDragStart}
        >
          <div className={`niuma-game__playground ${game.status !== 'playing' ? 'is-idle' : ''}`}>
            <div className="niuma-game__files">
              {game.files.map((file) => (
                <MiniFile
                  dragging={game.status !== 'playing'}
                  file={file}
                  key={file.id}
                />
              ))}
              {game.feedbackKind ? (
                <div
                  className={`niuma-game__bubble ${
                    game.feedbackKind === 'error'
                      ? 'is-error'
                      : game.feedbackKind === 'success'
                        ? 'is-success'
                        : ''
                  }`}
                >
                  {game.feedbackKind === 'success' ? '✓ 正确！' : '✗ 放错了'}
                </div>
              ) : null}
            </div>

          <div className="niuma-game__bins">
            {miniGameBoxes.map((box) => {
                const tone =
                  game.feedbackBin === box.type ? game.feedbackKind : game.hoverBin === box.type ? 'hover' : '';

                return <BinTarget box={box} key={box.type} onRegister={registerBinRef} tone={tone} />;
              })}
            </div>
          </div>

          <DragOverlay dropAnimation={null}>
            {activeFile ? (
              <div className="niuma-file-chip niuma-file-chip--overlay">
                <MiniFileArt label={activeFile.label} type={activeFile.type} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {landingFx ? (
          <div
            className="niuma-file-chip niuma-file-chip--landing"
            style={{
              left: `${landingFx.startLeft}px`,
              top: `${landingFx.startTop}px`,
              '--landing-x': `${landingFx.deltaX}px`,
              '--landing-y': `${landingFx.deltaY}px`
            }}
          >
            <MiniFileArt label={landingFx.label} type={landingFx.type} />
          </div>
        ) : null}

        <div className="niuma-game__footer">
          <div className="niuma-game__footer-copy">
            {(game.status === 'playing' || game.status === 'paused') && (
              <p className="niuma-widget__subcopy">{game.tip}</p>
            )}
          </div>
        </div>
      </div>

      {game.resultOpen ? (
        <div className="niuma-game__result">
          <button
            aria-label="关闭结算"
            className="niuma-game__result-close"
            type="button"
            onClick={closeResult}
          >
            <X aria-hidden="true" size={14} />
          </button>
          <strong>{game.resultTitle || getResultCopy(game.score).title}</strong>
          <p>{game.resultText || getResultCopy(game.score).text}</p>
          <button className="niuma-home__ghost-pill" type="button" onClick={beginGame}>
            再来一局
          </button>
        </div>
      ) : null}
    </div>
  );
}
