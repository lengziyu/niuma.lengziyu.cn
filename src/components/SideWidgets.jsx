import { useEffect, useRef, useState } from 'react';
import {
  Coffee,
  ChevronUp,
  Heart,
  Leaf,
  MoonStar,
  RefreshCcw,
  Sparkles
} from 'lucide-react';
import { cornerActions } from '../data/home';
import MiniGame from './MiniGame';

const SCRAMBLE_CHARS = '牛马百宝箱PDFDOCXLSPNG0123456789';

function FortuneGauge({ score }) {
  return (
    <div
      className="niuma-fortune__gauge"
      style={{
        background: `conic-gradient(#5f8cff ${score * 3.6}deg, rgba(95, 140, 255, 0.12) 0deg)`
      }}
    >
      <div>
        <strong>{score}</strong>
        <span>效率指数</span>
      </div>
    </div>
  );
}

function CornerActionIcon({ icon }) {
  if (icon === 'coffee') {
    return <Coffee aria-hidden="true" size={20} strokeWidth={2} />;
  }

  if (icon === 'relax') {
    return <Leaf aria-hidden="true" size={20} strokeWidth={2} />;
  }

  return <Heart aria-hidden="true" size={20} strokeWidth={2} />;
}

const coffeeFxBubbles = [
  { x: '22%', size: 6, delay: 0, duration: 840, drift: -9, rise: 26 },
  { x: '34%', size: 8, delay: 70, duration: 940, drift: -4, rise: 32 },
  { x: '45%', size: 7, delay: 20, duration: 900, drift: 0, rise: 28 },
  { x: '56%', size: 9, delay: 120, duration: 1020, drift: 5, rise: 34 },
  { x: '68%', size: 7, delay: 90, duration: 930, drift: 8, rise: 30 },
  { x: '79%', size: 6, delay: 160, duration: 860, drift: 11, rise: 25 }
];

export default function SideWidgets({
  collapsed,
  quote,
  fortune,
  onToggleCollapsed,
  onNextQuote,
  onNextFortune,
  onAction,
  layoutMode = 'default'
}) {
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const scrambleTimerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [gameHeight, setGameHeight] = useState(null);
  const [coffeeFxToken, setCoffeeFxToken] = useState(0);
  const [encourageFxToken, setEncourageFxToken] = useState(0);
  const [displayQuote, setDisplayQuote] = useState('');

  useEffect(() => {
    if (scrambleTimerRef.current) {
      window.clearInterval(scrambleTimerRef.current);
    }

    let frame = 0;
    const source = quote || '';
    const totalFrames = Math.max(source.length * 2, 8);

    function getRandomChar() {
      return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
    }

    scrambleTimerRef.current = window.setInterval(() => {
      frame += 1;
      const progress = Math.min(1, frame / totalFrames);
      const resolvedCount = Math.floor(progress * source.length);

      const nextText = source
        .split('')
        .map((char, index) => {
          if (index < resolvedCount || /\s|[，。、“”！？,.!~:：;；'"、】【《》]/.test(char)) {
            return char;
          }
          return getRandomChar();
        })
        .join('');

      setDisplayQuote(nextText);

      if (frame >= totalFrames) {
        window.clearInterval(scrambleTimerRef.current);
        scrambleTimerRef.current = null;
        setDisplayQuote(source);
      }
    }, 14);

    return () => {
      if (scrambleTimerRef.current) {
        window.clearInterval(scrambleTimerRef.current);
        scrambleTimerRef.current = null;
      }
    };
  }, [quote]);

  useEffect(() => {
    function updateScale() {
      const shell = shellRef.current;
      const content = contentRef.current;

      if (layoutMode === 'full1920') {
        setScale(1);
        return;
      }

      if (!shell || !content || window.innerWidth <= 1180) {
        setScale(1);
        return;
      }

      const availableHeight = shell.clientHeight;
      const naturalHeight = content.scrollHeight;
      const nextScale =
        naturalHeight > availableHeight ? Math.max(0.58, availableHeight / naturalHeight) : 1;

      setScale(nextScale);
    }

    updateScale();

    const observer = new ResizeObserver(() => updateScale());

    if (shellRef.current) {
      observer.observe(shellRef.current);
    }

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    window.addEventListener('resize', updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [collapsed, fortune, quote, layoutMode]);

  const scaledStyle =
    scale < 0.999
      ? {
          transform: `scaleY(${scale})`,
          transformOrigin: 'top center'
        }
      : undefined;

  useEffect(() => {
    let rafId = 0;

    function syncGameHeightWithLeftColumn() {
      if (window.innerWidth <= 1180) {
        setGameHeight(null);
        return;
      }

      const content = contentRef.current;
      const gameWidget = content?.querySelector('.niuma-widget--game');

      if (!content || !gameWidget) {
        setGameHeight(null);
        return;
      }

      let targetHeight = 0;
      if (layoutMode === 'full1920') {
        const shell = shellRef.current;

        if (!shell) {
          setGameHeight(null);
          return;
        }

        const shellRect = shell.getBoundingClientRect();
        targetHeight = Math.round(shellRect.bottom - gameWidget.getBoundingClientRect().top);
      } else {
        const leftBottomBlock = document.querySelector('.niuma-home__features-module');

        if (!leftBottomBlock) {
          setGameHeight(null);
          return;
        }

        targetHeight = Math.round(
          leftBottomBlock.getBoundingClientRect().bottom - gameWidget.getBoundingClientRect().top
        );
      }

      const minHeight = layoutMode === 'full1920' ? 280 : 220;
      const maxHeight = layoutMode === 'full1920' ? 960 : 640;
      const clampedHeight = Math.max(minHeight, Math.min(maxHeight, targetHeight));

      setGameHeight((current) => (current === clampedHeight ? current : clampedHeight));
    }

    function scheduleSync() {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      rafId = window.requestAnimationFrame(syncGameHeightWithLeftColumn);
    }

    scheduleSync();

    const observer = new ResizeObserver(scheduleSync);

    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    if (layoutMode !== 'full1920') {
      const leftBottomBlock = document.querySelector('.niuma-home__features-module');
      if (leftBottomBlock) {
        observer.observe(leftBottomBlock);
      }
    }

    window.addEventListener('resize', scheduleSync);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      observer.disconnect();
      window.removeEventListener('resize', scheduleSync);
    };
  }, [collapsed, fortune, quote, scale, layoutMode]);

  function handleQuickAction(actionKey) {
    onAction(actionKey);

    if (actionKey === 'coffee') {
      setCoffeeFxToken(Date.now());
      return;
    }

    if (actionKey === 'encourage') {
      setEncourageFxToken(Date.now());
    }
  }

  return (
    <div className="niuma-side-widgets" ref={shellRef}>
      <div className="niuma-side-widgets__content" ref={contentRef} style={scaledStyle}>
        <section className="niuma-widget niuma-widget--quote">
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <Sparkles aria-hidden="true" size={16} />
              <span>小牛摸鱼角</span>
            </div>
            {/* <button className="niuma-widget__text-btn" type="button" onClick={onToggleCollapsed}>
              {collapsed ? '展开' : '收起'}
              <ChevronUp
                aria-hidden="true"
                className={collapsed ? 'is-collapsed' : ''}
                size={16}
              />
            </button> */}
          </div>

          {!collapsed ? (
            <>
              <div className="niuma-widget__quote-main">
                <img alt="正在摸鱼的小牛" src="/images/mascot-relax-cutout.png" />
                <div className="niuma-widget__quote-copy">
                  <div className="niuma-widget__quote-head">
                    <h3>今日摸鱼签</h3>
                    <button
                      className="niuma-home__ghost-pill niuma-widget__quote-refresh"
                      type="button"
                      onClick={onNextQuote}
                    >
                      换一句
                    </button>
                  </div>
                  <p>“{displayQuote || quote}”</p>
                </div>
              </div>

              <div className="niuma-widget__quick-actions">
                {cornerActions.map((action) => {
                  return (
                    <button
                      key={action.key}
                      className={`niuma-widget__quick-action niuma-widget__quick-action--${action.key}`}
                      type="button"
                      onClick={() => handleQuickAction(action.key)}
                    >
                      <CornerActionIcon icon={action.icon} />
                      <span>{action.label}</span>
                      {action.key === 'coffee' && coffeeFxToken ? (
                        <span
                          aria-hidden="true"
                          className="niuma-widget__quick-fx niuma-widget__quick-fx--coffee"
                          key={`coffee-${coffeeFxToken}`}
                        >
                          {coffeeFxBubbles.map((bubble, index) => (
                            <i
                              key={`${coffeeFxToken}-${index}`}
                              style={{
                                '--bubble-x': bubble.x,
                                '--bubble-size': `${bubble.size}px`,
                                '--bubble-delay': `${bubble.delay}ms`,
                                '--bubble-duration': `${bubble.duration}ms`,
                                '--bubble-drift': `${bubble.drift}px`,
                                '--bubble-rise': `${bubble.rise}px`
                              }}
                            />
                          ))}
                        </span>
                      ) : null}
                      {action.key === 'encourage' && encourageFxToken ? (
                        <span
                          aria-hidden="true"
                          className="niuma-widget__quick-fx niuma-widget__quick-fx--encourage"
                          key={`encourage-${encourageFxToken}`}
                        >
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                          <i />
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </>
          ) : null}
        </section>

        <section className="niuma-widget niuma-widget--fortune">
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <MoonStar aria-hidden="true" size={16} />
              <span>今日办公运势</span>
            </div>
            <button className="niuma-widget__text-btn" type="button" onClick={onNextFortune}>
              <RefreshCcw aria-hidden="true" size={14} />
              <span>换一个</span>
            </button>
          </div>

          <div className="niuma-fortune">
            <FortuneGauge score={fortune.score} />
            <div className="niuma-fortune__details">
              <p>
                <strong>幸运工具：</strong>
                <span>{fortune.luckyTool}</span>
              </p>
              <p>
                <strong>宜：</strong>
                <span>{fortune.favorable.join('、')}</span>
              </p>
              <p>
                <strong>忌：</strong>
                <span>{fortune.avoid}</span>
              </p>
            </div>
          </div>

          <p className="niuma-fortune__note">{fortune.note} 💪</p>
        </section>

        <MiniGame style={gameHeight ? { height: `${gameHeight}px` } : undefined} />
      </div>
    </div>
  );
}
