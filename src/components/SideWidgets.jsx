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

export default function SideWidgets({
  collapsed,
  quote,
  fortune,
  onToggleCollapsed,
  onNextQuote,
  onNextFortune,
  onAction
}) {
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function updateScale() {
      const shell = shellRef.current;
      const content = contentRef.current;

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
  }, [collapsed, fortune, quote]);

  const scaledStyle =
    scale < 0.999
      ? {
          transform: `scaleY(${scale})`,
          transformOrigin: 'top center'
        }
      : undefined;

  return (
    <div className="niuma-side-widgets" ref={shellRef}>
      <div className="niuma-side-widgets__content" ref={contentRef} style={scaledStyle}>
        <section className="niuma-widget niuma-widget--quote">
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <Sparkles aria-hidden="true" size={16} />
              <span>小牛摸鱼角</span>
            </div>
            <button className="niuma-widget__text-btn" type="button" onClick={onToggleCollapsed}>
              {collapsed ? '展开' : '收起'}
              <ChevronUp
                aria-hidden="true"
                className={collapsed ? 'is-collapsed' : ''}
                size={16}
              />
            </button>
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
                  <p>“{quote}”</p>
                </div>
              </div>

              <div className="niuma-widget__quick-actions">
                {cornerActions.map((action) => {
                  return (
                    <button
                      key={action.key}
                      className={`niuma-widget__quick-action niuma-widget__quick-action--${action.key}`}
                      type="button"
                      onClick={() => onAction(action.key)}
                    >
                      <CornerActionIcon icon={action.icon} />
                      <span>{action.label}</span>
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

        <MiniGame />
      </div>
    </div>
  );
}
