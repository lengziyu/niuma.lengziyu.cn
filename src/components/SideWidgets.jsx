import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
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
  const canvasRef = useRef(null);
  const progressRef = useRef(null);
  const scoreRef = useRef(null);
  const gaugeRef = useRef(null);
  const scoreValueRef = useRef(score);
  const circumference = 2 * Math.PI * 36;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gauge = gaugeRef.current;

    if (!canvas || !gauge) {
      return undefined;
    }

    let cleanupScene = () => {};
    let disposed = false;

    async function setupScene() {
      const THREE = await import('three');

      if (disposed) {
        return;
      }

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4;

      const group = new THREE.Group();
      scene.add(group);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(0.86, 0.08, 20, 96),
        new THREE.MeshBasicMaterial({
          color: 0x8aa8ff,
          opacity: 0.24,
          transparent: true
        })
      );
      const innerHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.025, 14, 80),
        new THREE.MeshBasicMaterial({
          color: 0x9b7cff,
          opacity: 0.18,
          transparent: true
        })
      );
      const spark = new THREE.Mesh(
        new THREE.CircleGeometry(0.06, 24),
        new THREE.MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.4,
          transparent: true
        })
      );
      spark.position.set(0.58, -0.24, 0);

      group.add(halo, innerHalo, spark);

      function applyThemeColors() {
        const style = getComputedStyle(gauge);
        halo.material.color.set(style.getPropertyValue('--fortune-three-primary').trim() || '#6f95ff');
        innerHalo.material.color.set(style.getPropertyValue('--fortune-three-secondary').trim() || '#9b7cff');
        spark.material.color.set(style.getPropertyValue('--fortune-three-spark').trim() || '#ffffff');
      }

      function resize() {
        const size = Math.max(1, Math.round(gauge.getBoundingClientRect().width));
        renderer.setSize(size, size, false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      }

      let rafId = 0;
      const start = performance.now();

      function renderFrame(now) {
        const elapsed = (now - start) / 1000;
        group.rotation.z = elapsed * 0.22;
        innerHalo.rotation.z = -elapsed * 0.38;
        halo.material.opacity = 0.2 + Math.sin(elapsed * 1.6) * 0.035;
        innerHalo.material.opacity = 0.14 + Math.cos(elapsed * 1.4) * 0.03;
        spark.material.opacity = 0.26 + Math.sin(elapsed * 2.1) * 0.1;
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(renderFrame);
      }

      applyThemeColors();
      resize();
      rafId = window.requestAnimationFrame(renderFrame);

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(gauge);
      const themeObserver = new MutationObserver(applyThemeColors);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class']
      });

      cleanupScene = () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        halo.geometry.dispose();
        halo.material.dispose();
        innerHalo.geometry.dispose();
        innerHalo.material.dispose();
        spark.geometry.dispose();
        spark.material.dispose();
        renderer.dispose();
      };
    }

    void setupScene();

    return () => {
      disposed = true;
      cleanupScene();
    };
  }, []);

  useEffect(() => {
    const nextOffset = circumference * (1 - score / 100);
    const animations = [];

    if (progressRef.current) {
      animations.push(
        animate(progressRef.current, {
          strokeDashoffset: nextOffset,
          duration: 920,
          ease: 'out(3)'
        })
      );
    }

    if (scoreRef.current) {
      const counter = { value: scoreValueRef.current };
      animations.push(
        animate(counter, {
          value: score,
          duration: 820,
          ease: 'out(3)',
          onUpdate: () => {
            if (scoreRef.current) {
              scoreRef.current.textContent = String(Math.round(counter.value));
            }
          }
        })
      );
      scoreValueRef.current = score;
    }

    if (gaugeRef.current) {
      animations.push(
        animate(gaugeRef.current, {
          scale: [0.98, 1],
          opacity: [0.88, 1],
          duration: 780,
          ease: 'out(3)'
        })
      );
    }

    return () => animations.forEach((animation) => animation.cancel?.());
  }, [circumference, score]);

  return (
    <div className="niuma-fortune__gauge" ref={gaugeRef}>
      <canvas aria-hidden="true" className="niuma-fortune__three" ref={canvasRef} />
      <svg aria-hidden="true" className="niuma-fortune__ring" viewBox="0 0 88 88">
        <defs>
          <linearGradient id="fortune-ring-gradient" x1="10" x2="78" y1="10" y2="78">
            <stop stopColor="var(--fortune-progress-a)" />
            <stop offset="1" stopColor="var(--fortune-progress-b)" />
          </linearGradient>
        </defs>
        <circle className="niuma-fortune__ring-track" cx="44" cy="44" r="36" />
        <circle
          className="niuma-fortune__ring-progress"
          cx="44"
          cy="44"
          r="36"
          ref={progressRef}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - score / 100)}
        />
        <circle className="niuma-fortune__ring-shine" cx="28" cy="22" r="2.4" />
      </svg>
      <div className="niuma-fortune__gauge-core">
        <strong ref={scoreRef}>{score}</strong>
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
              <p className="niuma-fortune__favorable">
                <strong>宜：</strong>
                <span>{fortune.favorable.join('、')}</span>
              </p>
              <p>
                <strong>忌：</strong>
                <span>{fortune.avoid}</span>
              </p>
            </div>
          </div>

          <p className="niuma-fortune__note">{fortune.note}</p>
        </section>

        <MiniGame style={gameHeight ? { height: `${gameHeight}px` } : undefined} />
      </div>
    </div>
  );
}
