import React from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  MeasuringStrategy,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { Clock3, Play, RotateCcw } from 'lucide-react';
import { miniGameBoxes, miniGameFilePool, miniGameTips } from '../data/home';

const DEFAULT_TIME = 30;
const DEFAULT_TARGET_SCORE = 100;
const INITIAL_FILE_COUNT = 5;
const MIN_VISIBLE_FILES = 3;
const MAX_VISIBLE_FILES = 5;
const FILE_SLOTS = [
  { x: 8, y: 10 },
  { x: 32, y: 8 },
  { x: 56, y: 12 },
  { x: 20, y: 50 },
  { x: 46, y: 48 }
];

function randomBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function nextId(prefix = 'file') {
  return `${prefix}-${crypto.randomUUID()}`;
}

function formatTip(template, value) {
  return template.replace('{count}', String(value));
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
    icon: file.image,
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
  if (score >= 80) {
    return {
      title: '整理大师，今天效率拉满！',
      text: '文件排得明明白白，今天的你就是桌面秩序守护神。'
    };
  }

  if (score >= 40) {
    return {
      title: '不错不错，文件终于有家了！',
      text: '再来一轮就更顺手了，摸鱼和整理可以两不误。'
    };
  }

  return {
    title: '摸鱼可以，文件还是要整理一下～',
    text: '别担心，重新开一局，下一轮一定会比这次稳。'
  };
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
      className={`niuma-file-chip ${file.status === 'exiting' ? 'is-exiting' : ''}`}
      style={style}
      type="button"
      {...listeners}
      {...attributes}
    >
      <img alt="" src={file.icon} />
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
      <img alt={box.label} src={box.image} />
    </div>
  );
}

export default function MiniGame({
  initialTime = DEFAULT_TIME,
  targetScore = DEFAULT_TARGET_SCORE,
  onFinish
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

  const remainingToWin = Math.max(0, Math.ceil((targetScore - game.score) / 10));
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
    if (game.status !== 'playing' || game.score < targetScore) {
      return;
    }

    setGame((current) => {
      if (current.status !== 'playing' || current.score < targetScore) {
        return current;
      }

      return {
        ...current,
        status: 'finished',
        resultOpen: true,
        resultTitle: '通关成功',
        resultText: miniGameTips.win,
        tip: miniGameTips.win,
        activeId: null,
        hoverBin: null
      };
    });
  }, [game.score, game.status, targetScore]);

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
      tip: formatTip(miniGameTips.progress, Math.ceil(targetScore / 10)),
      resultText: '',
      resultTitle: '',
      resultOpen: false
    });
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
      const nextTip =
        nextScore >= targetScore
          ? miniGameTips.win
          : remainingToWin <= 1
            ? miniGameTips.cleared
            : formatTip(miniGameTips.progress, Math.max(0, remainingToWin - 1));

      setGame((current) => ({
        ...current,
        feedbackBin: binId,
        feedbackKind: 'success'
      }));
      removeFileWithAnimation(fileId, nextScore, nextTip);
      clearFeedbackSoon();
      return;
    }

    const nextScore = Math.max(0, game.score - 5);
    const isMystery = file.type === 'unknown';

    setGame((current) => ({
      ...current,
      score: nextScore,
      activeId: null,
      hoverBin: null,
      feedbackBin: binId,
      feedbackKind: 'error',
      tip: isMystery ? miniGameTips.mystery : miniGameTips.error
    }));
    clearFeedbackSoon();
  }

  return (
    <div className="niuma-widget niuma-widget--game">
      <div className="niuma-widget__header">
        <div className="niuma-widget__title">
          <span>📂</span>
          <span>文件整理</span>
        </div>
        <div className="niuma-game__header-tools">
          {game.status === 'playing' && (
            <div className={`niuma-game__timer ${game.timeLeft <= 5 ? 'is-urgent' : ''}`}>
              <Clock3 aria-hidden="true" size={12} />
              <span>{countdownLabel}</span>
            </div>
          )}
          <button className="niuma-home__primary-pill niuma-game__start-btn" type="button" onClick={beginGame}>
            {game.status === 'idle' ? <Play aria-hidden="true" size={14} /> : <RotateCcw aria-hidden="true" size={14} />}
            <span>{game.status === 'idle' ? '开始' : '重来'}</span>
          </button>
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
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
            {game.status === 'idle' ? (
              <div className="niuma-game__bubble is-idle">
                点击开始，把文件拖到对应箱子里
              </div>
            ) : game.feedbackKind ? (
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
              <img alt="" src={activeFile.icon} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="niuma-game__footer">
        <div className="niuma-game__footer-copy">
          <p>
            得分：<strong>{game.score}</strong>
          </p>
          {game.status === 'playing' && (
            <p className="niuma-widget__subcopy">还差 {remainingToWin} 个通关</p>
          )}
        </div>
      </div>

      {game.resultOpen ? (
        <div className="niuma-game__result">
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
