import { animate } from 'animejs';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

const cowLines = [
  '今天也要轻松开工～',
  '文件交给工具，快乐留给自己。',
  '工作可以忙，心态记得放松。'
];

const hiddenTools = [
  '图片转文字：截图里的内容一键提取',
  'PDF拆分：只把需要的几页发出去',
  '文本去重：名单和关键词整理更快',
  '时间戳转换：查日志时少一点头疼'
];

function pickRandom(items, currentValue) {
  if (items.length <= 1) {
    return items[0] ?? '';
  }

  let next = currentValue;

  while (next === currentValue) {
    next = items[Math.floor(Math.random() * items.length)];
  }

  return next;
}

function AnimatedBubbleLine({ text, className = '' }) {
  return (
    <span className={`niuma-home__hero-bubble-line ${className}`.trim()}>
      {Array.from(text).map((char, index) => (
        <span
          aria-hidden="true"
          className="niuma-home__hero-bubble-char"
          key={`${text}-${index}-${char}`}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

export default function Hero({
  hotTags = [],
  onHotSearch,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) {
  const [egg, setEgg] = useState(null);
  const [cowLine, setCowLine] = useState(cowLines[0]);
  const [toolTip, setToolTip] = useState(hiddenTools[0]);
  const bubbleCopyRef = useRef(null);
  const bubbleClipRef = useRef(null);
  const bubbleSweepRef = useRef(null);
  const bubbleFxCanvasRef = useRef(null);
  const bubbleFxWrapRef = useRef(null);

  const figureClassName = useMemo(
    () => `niuma-home__hero-figure ${egg ? `is-${egg}-active` : ''}`,
    [egg]
  );

  useEffect(() => {
    if (!egg) {
      return undefined;
    }

    const timer = window.setTimeout(() => setEgg(null), egg === 'box' ? 3600 : 1600);

    return () => window.clearTimeout(timer);
  }, [egg]);

  useEffect(() => {
    const bubbleCopy = bubbleCopyRef.current;
    const bubbleClip = bubbleClipRef.current;
    const bubbleSweep = bubbleSweepRef.current;

    if (!bubbleCopy || !bubbleClip || !bubbleSweep || typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const chars = Array.from(
      bubbleCopy.querySelectorAll('.niuma-home__hero-bubble-char, .niuma-home__hero-bubble-heart')
    );
    const fullWidth = Math.round(bubbleCopy.getBoundingClientRect().width);
    const animations = [];
    let sheenTimer = 0;
    let cancelled = false;

    bubbleClip.style.width = mediaQuery.matches ? `${fullWidth}px` : '0px';
    bubbleCopy.style.opacity = mediaQuery.matches ? '1' : '0';
    bubbleCopy.style.transform = mediaQuery.matches ? 'rotate(8deg)' : 'translate3d(-14px, 0, 0) rotate(8deg)';
    bubbleSweep.style.opacity = mediaQuery.matches ? '0' : '0';
    bubbleSweep.style.transform = `translate3d(${-Math.round(fullWidth * 0.65)}px, 0, 0)`;

    chars.forEach((char) => {
      char.style.opacity = mediaQuery.matches ? '1' : '0';
      char.style.transform = mediaQuery.matches ? 'translate3d(0, 0, 0) scale(1)' : 'translate3d(-18px, 0, 0) scale(0.94)';
    });

    if (mediaQuery.matches) {
      return undefined;
    }

    animations.push(
      animate(bubbleCopy, {
        opacity: [0, 1],
        translateX: [-14, 0],
        duration: 560,
        ease: 'out(4)'
      })
    );

    animations.push(
      animate(bubbleClip, {
        width: [0, fullWidth],
        duration: 900,
        ease: 'out(4)'
      })
    );

    animations.push(
      animate(chars, {
        opacity: [0, 1],
        translateX: [-18, 0],
        scale: [0.94, 1],
        delay: (_, index) => 120 + index * 42,
        duration: 620,
        ease: 'out(4)'
      })
    );

    function runSheen(delay = 320) {
      sheenTimer = window.setTimeout(() => {
        if (cancelled) {
          return;
        }

        const travel = Math.round(fullWidth * 1.42);
        animations.push(
          animate(bubbleSweep, {
            opacity: [0, 0.9, 0],
            translateX: [-Math.round(fullWidth * 0.68), travel],
            duration: 980,
            ease: 'inOutSine',
            onComplete: () => {
              if (!cancelled) {
                runSheen(3600);
              }
            }
          })
        );
      }, delay);
    }

    runSheen();

    return () => {
      cancelled = true;
      if (sheenTimer) {
        window.clearTimeout(sheenTimer);
      }
      animations.forEach((animation) => animation.cancel?.());
    };
  }, []);

  useEffect(() => {
    const canvas = bubbleFxCanvasRef.current;
    const fxWrap = bubbleFxWrapRef.current;

    if (!canvas || !fxWrap) {
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
      const camera = new THREE.OrthographicCamera(-1.5, 1.5, 1, -1, 0.1, 10);
      camera.position.z = 4;

      const group = new THREE.Group();
      scene.add(group);

      const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.16
      });
      const halo = new THREE.Mesh(new THREE.CircleGeometry(0.78, 48), haloMaterial);
      halo.scale.set(1.24, 0.48, 1);
      group.add(halo);

      const streakMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.2
      });
      const streak = new THREE.Mesh(new THREE.PlaneGeometry(0.28, 1.92), streakMaterial);
      streak.rotation.z = 0.52;
      group.add(streak);

      const sparkMaterials = [];
      const sparks = Array.from({ length: 7 }, (_, index) => {
        const material = new THREE.MeshBasicMaterial({
          color: index % 2 === 0 ? 0xffffff : 0xffdd75,
          transparent: true,
          opacity: 0.45
        });
        sparkMaterials.push(material);

        const mesh = new THREE.Mesh(new THREE.CircleGeometry(index === 0 ? 0.06 : 0.038, 24), material);
        mesh.userData = {
          baseX: -0.86 + index * 0.28,
          baseY: index % 2 === 0 ? 0.08 : -0.08,
          drift: 0.04 + index * 0.008,
          speed: 0.7 + index * 0.14,
          phase: index * 0.72
        };
        group.add(mesh);
        return mesh;
      });

      function applyThemeColors() {
        const style = getComputedStyle(fxWrap);
        const primary = style.getPropertyValue('--hero-bubble-fx-primary').trim() || '#6f7cff';
        const secondary = style.getPropertyValue('--hero-bubble-fx-secondary').trim() || '#ffd86b';
        const glow = style.getPropertyValue('--hero-bubble-fx-glow').trim() || '#ffffff';

        halo.material.color.set(primary);
        streak.material.color.set(glow);
        sparks.forEach((spark, index) => {
          spark.material.color.set(index % 2 === 0 ? glow : secondary);
        });
      }

      function resize() {
        const rect = fxWrap.getBoundingClientRect();
        renderer.setSize(Math.max(1, Math.round(rect.width)), Math.max(1, Math.round(rect.height)), false);
        renderer.render(scene, camera);
      }

      let rafId = 0;
      const start = performance.now();

      function renderFrame(now) {
        const elapsed = (now - start) / 1000;
        halo.material.opacity = 0.11 + Math.sin(elapsed * 1.6) * 0.035;
        halo.scale.x = 1.22 + Math.sin(elapsed * 1.1) * 0.05;
        halo.scale.y = 0.46 + Math.cos(elapsed * 1.1) * 0.04;

        streak.position.x = -1.5 + ((elapsed * 0.58) % 1) * 3.1;
        streak.position.y = -0.03 + Math.sin(elapsed * 0.9) * 0.06;
        streak.material.opacity = 0.09 + Math.sin(elapsed * 2.1) * 0.04;

        sparks.forEach((spark) => {
          const { baseX, baseY, drift, speed, phase } = spark.userData;
          spark.position.x = baseX + Math.sin(elapsed * speed + phase) * drift;
          spark.position.y = baseY + Math.cos(elapsed * (speed + 0.18) + phase) * (drift * 1.8);
          const scale = 0.92 + Math.sin(elapsed * (speed + 0.4) + phase) * 0.18;
          spark.scale.setScalar(scale);
          spark.material.opacity = 0.18 + Math.abs(Math.sin(elapsed * (speed + 0.22) + phase)) * 0.42;
        });

        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(renderFrame);
      }

      applyThemeColors();
      resize();
      rafId = window.requestAnimationFrame(renderFrame);

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(fxWrap);
      const themeObserver = new MutationObserver(applyThemeColors);
      themeObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });

      cleanupScene = () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        halo.geometry.dispose();
        halo.material.dispose();
        streak.geometry.dispose();
        streak.material.dispose();
        sparks.forEach((spark) => {
          spark.geometry.dispose();
          spark.material.dispose();
        });
        renderer.dispose();
      };
    }

    void setupScene();

    return () => {
      disposed = true;
      cleanupScene();
    };
  }, []);

  function triggerCowEgg() {
    setCowLine((current) => pickRandom(cowLines, current));
    setEgg('cow');
  }

  function triggerCoffeeEgg() {
    setEgg('coffee');
  }

  function triggerBoxEgg() {
    setToolTip((current) => pickRandom(hiddenTools, current));
    setEgg('box');
  }

  return (
    <section className="niuma-home__hero-card">
      <div className="niuma-home__hero-copy">
        <p className="niuma-home__hero-greeting">Hi，打工人 👋</p>
        <h1>
          欢迎来到 <span>牛马</span> 百宝箱
        </h1>
        <p className="niuma-home__hero-description">
          轻松搞定图片、文档、转换处理等各种工作难题，工作再忙，也要记得摸鱼哦～
        </p>

        <form
          className="niuma-home__search"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit();
          }}
        >
          <label className="niuma-home__search-field">
            <Search aria-hidden="true" size={20} />
            <input
              placeholder="搜索你需要的工具，比如：PDF转图片"
              type="search"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <button type="submit">搜索</button>
        </form>

        {hotTags.length ? (
          <div className="niuma-home__hot-tags" aria-label="热门搜索">
            <span>热门搜索：</span>
            <div>
              {hotTags.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => onHotSearch?.(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        ) : null}

      </div>

      <div className="niuma-home__hero-illustration">
        <div className={figureClassName}>
          <img alt="牛马百宝箱主视觉插画" src="/images/mascot-hero-cutout.png" />
          <svg
            aria-hidden="true"
            className="niuma-home__hero-overlay"
            preserveAspectRatio="xMidYMid meet"
            viewBox="0 0 1536 1024"
          >
            <g className="niuma-home__hero-sparkles">
              <path
                d="M1127 182c18 0 27 14 30 30 3-16 12-30 30-30-18 0-27-14-30-30-3 16-12 30-30 30Z"
                fill="#FFD77A"
              />
              <path
                d="M1018 536c14 0 21 11 23 23 2-12 9-23 23-23-14 0-21-11-23-23-2 12-9 23-23 23Z"
                fill="#FFC96B"
              />
            </g>

            <g transform="translate(860 667) rotate(4)">
              <text className="niuma-home__hero-overlay-text niuma-home__hero-overlay-text--mug" textAnchor="middle">
                摸鱼中
              </text>
            </g>
          </svg>

          <div className="niuma-home__hero-bubble-copy" ref={bubbleCopyRef}>
            <span aria-hidden="true" className="niuma-home__hero-bubble-fx-wrap" ref={bubbleFxWrapRef}>
              <canvas className="niuma-home__hero-bubble-fx" ref={bubbleFxCanvasRef} />
            </span>
            <div className="niuma-home__hero-bubble-copy-clip" ref={bubbleClipRef}>
              <span aria-hidden="true" className="niuma-home__hero-bubble-sweep" ref={bubbleSweepRef} />
              <div className="niuma-home__hero-bubble-copy-inner">
                <AnimatedBubbleLine text="今天也要" />
                <span className="niuma-home__hero-bubble-line niuma-home__hero-bubble-line--second">
                  {Array.from('轻松开工!').map((char, index) => (
                    <span
                      aria-hidden="true"
                      className="niuma-home__hero-bubble-char"
                      key={`second-${index}-${char}`}
                    >
                      {char}
                    </span>
                  ))}
                  <span aria-hidden="true" className="niuma-home__hero-bubble-heart">❤</span>
                </span>
              </div>
            </div>
          </div>

          <button
            aria-label="点击小牛"
            className="niuma-hero-egg niuma-hero-egg--cow"
            title="点小牛"
            type="button"
            onClick={triggerCowEgg}
          />
          <button
            aria-label="点击咖啡杯"
            className="niuma-hero-egg niuma-hero-egg--coffee"
            title="点咖啡"
            type="button"
            onClick={triggerCoffeeEgg}
          />
          <button
            aria-label="点击文件盒"
            className="niuma-hero-egg niuma-hero-egg--box"
            title="点文件盒"
            type="button"
            onClick={triggerBoxEgg}
          />

          {egg === 'cow' ? (
            <>
              <span className="niuma-hero-egg__blink" aria-hidden="true" />
              <span className="niuma-hero-egg__speech">{cowLine}</span>
            </>
          ) : null}

          {egg === 'coffee' ? (
            <span className="niuma-hero-egg__bubbles" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          ) : null}

          {egg === 'box' ? (
            <span className="niuma-hero-egg__recommend">
              <strong>隐藏工具推荐</strong>
              <span>{toolTip}</span>
            </span>
          ) : null}
        </div>
      </div>
    </section>
  );
}
