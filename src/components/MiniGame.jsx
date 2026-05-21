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
import { Ban, Clock3, FolderOpen, Pause, Play, RotateCcw, X } from 'lucide-react';
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
    primary: '#ff6b7f',
    secondary: '#ff9aa8',
    deep: '#b9344a',
    soft: '#fff0f3'
  },
  image: {
    shortLabel: 'PNG',
    bucketLabel: 'PNG',
    primary: '#55c878',
    secondary: '#8ce5a3',
    deep: '#28794a',
    soft: '#effff4'
  },
  word: {
    shortLabel: 'DOC',
    bucketLabel: 'DOC',
    primary: '#5c8dff',
    secondary: '#91b5ff',
    deep: '#2b55b8',
    soft: '#eef4ff'
  },
  sheet: {
    shortLabel: 'XLS',
    bucketLabel: 'XLS',
    primary: '#24bfa3',
    secondary: '#76e2d1',
    deep: '#147567',
    soft: '#eafffb'
  }
};

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
  const isImage = type === 'image';
  const isSheet = type === 'sheet';
  const isWord = type === 'word';
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      aria-hidden="true"
      className="niuma-file-chip__svg"
      viewBox="0 0 86 82"
      role="img"
    >
      <defs>
        <linearGradient id={`${gradientId}-file`} x1="12" x2="74" y1="7" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.soft} />
          <stop offset="1" stopColor="#ffffff" />
        </linearGradient>
        <linearGradient id={`${gradientId}-badge`} x1="0" x2="1" y1="0" y2="1">
          <stop stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
      </defs>
      <path
        d="M15 7h42l14 14v49a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6V13a6 6 0 0 1 6-6Z"
        fill={`url(#${gradientId}-file)`}
        stroke={art.primary}
        strokeOpacity="0.42"
        strokeWidth="2"
      />
      <path d="M57 8v15h15" fill={art.soft} stroke={art.primary} strokeOpacity="0.38" strokeWidth="2" />
      <rect x="18" y="55" width="50" height="16" rx="7" fill={`url(#${gradientId}-badge)`} />
      <text
        x="43"
        y="66"
        fill="#fff"
        fontFamily="Inter, PingFang SC, sans-serif"
        fontSize="11"
        fontWeight="900"
        letterSpacing="0"
        textAnchor="middle"
      >
        {title}
      </text>

      {isImage ? (
        <>
          <circle cx="54" cy="25" r="4" fill={art.secondary} />
          <path d="M18 46 30 32l9 8 7-6 13 12H18Z" fill={art.primary} opacity="0.9" />
        </>
      ) : isSheet ? (
        <g fill="none" stroke={art.primary} strokeLinecap="round" strokeWidth="3">
          <path d="M20 24h34" />
          <path d="M20 36h34" />
          <path d="M31 18v30" />
          <path d="M44 18v30" />
        </g>
      ) : isWord ? (
        <g stroke={art.primary} strokeLinecap="round" strokeWidth="4">
          <path d="M20 24h32" />
          <path d="M20 35h26" />
          <path d="M20 46h34" />
        </g>
      ) : (
        <g fill="none" stroke={art.primary} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4">
          <path d="M20 46h30" />
          <path d="M20 32h34" />
          <path d="M20 22h24" />
        </g>
      )}
    </svg>
  );
}

function MiniBinArt({ type, label }) {
  const art = TYPE_ART[type] ?? TYPE_ART.pdf;
  const gradientId = React.useId().replace(/:/g, '');

  return (
    <svg
      aria-label={label}
      className="niuma-game__bin-art"
      viewBox="0 0 100 76"
      role="img"
    >
      <defs>
        <linearGradient id={`${gradientId}-body`} x1="18" x2="82" y1="22" y2="72" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
        <linearGradient id={`${gradientId}-rim`} x1="16" x2="84" y1="13" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor={art.secondary} />
          <stop offset="1" stopColor={art.primary} />
        </linearGradient>
      </defs>
      <path
        d="M18 27h64l-6 36a9 9 0 0 1-9 8H33a9 9 0 0 1-9-8L18 27Z"
        fill={`url(#${gradientId}-body)`}
      />
      <path
        d="M15 25c0-8 15-15 35-15s35 7 35 15-15 15-35 15-35-7-35-15Z"
        fill={`url(#${gradientId}-rim)`}
      />
      <ellipse cx="50" cy="23.5" rx="27" ry="8.5" fill="#ffffff" fillOpacity="0.64" />
      <ellipse cx="50" cy="25" rx="21" ry="5.6" fill={art.deep} fillOpacity="0.22" />
      <path d="M22 28c5 6 16 10 28 10s23-4 28-10" fill="none" stroke="#fff" strokeOpacity="0.44" strokeWidth="3" strokeLinecap="round" />
      <rect x="25" y="43" width="50" height="21" rx="8" fill="#fff" fillOpacity="0.94" />
      <text
        x="50"
        y="58"
        fill={art.deep}
        fontFamily="Inter, PingFang SC, sans-serif"
        fontSize="16"
        fontWeight="950"
        letterSpacing="0"
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
    transform: transform
      ? `translate3d(${Math.round(transform.x)}px, ${Math.round(transform.y)}px, 0)`
      : undefined,
    opacity: file.status === 'exiting' ? 0 : isDragging ? 0.4 : 1
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

    setGame((current) => ({ ...current, activeId: String(event.active.id) }));
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

      setGame((current) => ({
        ...current,
        feedbackBin: binId,
        feedbackKind: 'success'
      }));
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
          <div className={`niuma-game__timer ${game.status === 'playing' && game.timeLeft <= 5 ? 'is-urgent' : ''}`}>
            <Clock3 aria-hidden="true" size={12} />
            <span>{countdownLabel}</span>
          </div>
          {game.status === 'playing' || game.status === 'paused' ? (
            <>
              <button
                className="niuma-home__primary-pill niuma-game__start-btn"
                type="button"
                onClick={beginGame}
              >
                <RotateCcw aria-hidden="true" size={14} />
                <span>重来</span>
              </button>
              <button
                className="niuma-home__ghost-pill niuma-game__ctrl-btn"
                type="button"
                onClick={pauseOrResumeGame}
              >
                {game.status === 'playing' ? <Pause aria-hidden="true" size={14} /> : <Play aria-hidden="true" size={14} />}
                <span>{game.status === 'playing' ? '暂停' : '继续'}</span>
              </button>
              <button
                className="niuma-home__ghost-pill niuma-game__ctrl-btn is-danger"
                type="button"
                onClick={cancelGame}
              >
                <Ban aria-hidden="true" size={14} />
                <span>取消</span>
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

        <div className="niuma-game__footer">
          <div className="niuma-game__footer-copy">
            <p>
              得分：<strong>{game.score}</strong>
            </p>
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
