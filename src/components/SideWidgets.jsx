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

const milkTeaBrands = [
  {
    key: 'mixue',
    brand: '蜜雪冰城',
    short: '雪',
    drink: '冰鲜柠檬水',
    accent: '#e64545',
    accentSoft: '#ffe3e3',
    cupMain: '#fff8f6',
    cupSecondary: '#ffd6d6',
    pearl: '#3d221f'
  },
  {
    key: 'chagee',
    brand: '霸王茶姬',
    short: '姬',
    drink: '伯牙绝弦',
    accent: '#b43a3f',
    accentSoft: '#ffe0df',
    cupMain: '#fff9f4',
    cupSecondary: '#f9d8c9',
    pearl: '#5a3429'
  },
  {
    key: 'heytea',
    brand: '喜茶',
    short: '喜',
    drink: '多肉葡萄',
    accent: '#1d1d1f',
    accentSoft: '#ececec',
    cupMain: '#fbfbfb',
    cupSecondary: '#e8ecf4',
    pearl: '#22242c'
  },
  {
    key: 'chabaidao',
    brand: '茶百道',
    short: '茶',
    drink: '杨枝甘露',
    accent: '#2d74ff',
    accentSoft: '#e2ecff',
    cupMain: '#f8fbff',
    cupSecondary: '#d8e7ff',
    pearl: '#2d3a68'
  },
  {
    key: 'guming',
    brand: '古茗',
    short: '古',
    drink: '超A芝士葡萄',
    accent: '#1f9a62',
    accentSoft: '#ddf6e9',
    cupMain: '#f8fff9',
    cupSecondary: '#d7f5df',
    pearl: '#284136'
  },
  {
    key: 'hushang',
    brand: '沪上阿姨',
    short: '沪',
    drink: '血糯米奶茶',
    accent: '#0f8f97',
    accentSoft: '#ddf8fa',
    cupMain: '#f8ffff',
    cupSecondary: '#d6f5f7',
    pearl: '#294244'
  }
];

function MilkTeaBadge({ tea, active = false }) {
  return (
    <span
      aria-hidden="true"
      className={`niuma-tea-badge ${active ? 'is-active' : ''}`}
      style={{
        '--tea-accent': tea.accent,
        '--tea-accent-soft': tea.accentSoft
      }}
    >
      <svg viewBox="0 0 40 40">
        <rect x="2.5" y="2.5" width="35" height="35" rx="12" fill="var(--tea-accent-soft)" />
        <path d="M20 10c-4.6 0-8.4 3.8-8.4 8.4 0 4.1 2.9 7.5 6.8 8.2V31h3.2v-4.3c4-.7 6.9-4.1 6.9-8.3C28.5 13.8 24.7 10 20 10Z" fill="var(--tea-accent)" opacity="0.14" />
        <text x="20" y="24" textAnchor="middle">{tea.short}</text>
      </svg>
    </span>
  );
}

function TeaScene({ tea, sipToken }) {
  const canvasRef = useRef(null);
  const sceneStateRef = useRef(null);
  const motionRef = useRef({ sipTilt: 0, sipLift: 0 });
  const shellRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
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
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 6.2);

      const group = new THREE.Group();
      scene.add(group);

      const cup = new THREE.Mesh(
        new THREE.CylinderGeometry(0.86, 0.66, 2.02, 48, 1, true),
        new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.96,
          shininess: 80
        })
      );
      cup.position.y = -0.12;

      const lid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 0.9, 0.18, 48),
        new THREE.MeshPhongMaterial({
          color: 0xf0d8ff,
          shininess: 100
        })
      );
      lid.position.y = 0.96;

      const straw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 1.55, 20),
        new THREE.MeshPhongMaterial({
          color: 0x7c4dff,
          shininess: 90
        })
      );
      straw.position.set(0.34, 1.42, 0.08);
      straw.rotation.z = -0.16;

      const sleeve = new THREE.Mesh(
        new THREE.CylinderGeometry(0.56, 0.48, 0.7, 36, 1, true),
        new THREE.MeshPhongMaterial({
          color: 0xffe7b7,
          shininess: 50
        })
      );
      sleeve.position.y = -0.42;

      const logo = new THREE.Mesh(
        new THREE.CircleGeometry(0.25, 28),
        new THREE.MeshBasicMaterial({
          color: 0x7c4dff
        })
      );
      logo.position.set(0, -0.36, 0.68);

      const pearlGroup = new THREE.Group();
      const pearlMaterial = new THREE.MeshPhongMaterial({
        color: 0x3d221f,
        shininess: 28
      });
      const pearlOffsets = [
        [-0.24, -0.86, 0.12],
        [0.02, -0.84, 0.16],
        [0.28, -0.78, 0.04],
        [-0.1, -0.62, -0.06],
        [0.18, -0.56, -0.1]
      ];

      pearlOffsets.forEach(([x, y, z]) => {
        const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.11, 18, 18), pearlMaterial);
        pearl.position.set(x, y, z);
        pearlGroup.add(pearl);
      });

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.045, 16, 88),
        new THREE.MeshBasicMaterial({
          color: 0xe3d6ff,
          transparent: true,
          opacity: 0.26
        })
      );
      halo.rotation.x = 0.38;
      halo.position.y = -0.1;

      const light = new THREE.PointLight(0xffffff, 1.8, 20);
      light.position.set(2.4, 3.2, 5.2);
      const light2 = new THREE.PointLight(0xc8d8ff, 1.2, 18);
      light2.position.set(-2.8, -1.2, 4.6);
      const ambient = new THREE.AmbientLight(0xffffff, 1.18);
      scene.add(light, light2, ambient);

      group.add(halo, cup, lid, straw, sleeve, logo, pearlGroup);

      const state = {
        THREE,
        renderer,
        scene,
        camera,
        group,
        cupMaterial: cup.material,
        lidMaterial: lid.material,
        strawMaterial: straw.material,
        sleeveMaterial: sleeve.material,
        logoMaterial: logo.material,
        pearlMaterial,
        haloMaterial: halo.material
      };
      sceneStateRef.current = state;

      function resize() {
        const host = canvas.parentElement;
        const width = Math.max(1, Math.round(host?.clientWidth || 180));
        const height = Math.max(1, Math.round(host?.clientHeight || 180));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      let rafId = 0;
      const start = performance.now();

      function renderFrame(now) {
        const elapsed = (now - start) / 1000;
        const sipMotion = motionRef.current;
        group.rotation.y = elapsed * 0.42;
        group.rotation.z = sipMotion.sipTilt + Math.sin(elapsed * 1.6) * 0.028;
        group.position.y = sipMotion.sipLift + Math.sin(elapsed * 2.1) * 0.08;
        halo.material.opacity = 0.18 + Math.sin(elapsed * 2.3) * 0.06;
        pearlGroup.rotation.y = -elapsed * 0.8;
        renderer.render(scene, camera);
        rafId = window.requestAnimationFrame(renderFrame);
      }

      resize();
      rafId = window.requestAnimationFrame(renderFrame);

      const resizeObserver = new ResizeObserver(resize);
      if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
      }

      cleanupScene = () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        cup.geometry.dispose();
        cup.material.dispose();
        lid.geometry.dispose();
        lid.material.dispose();
        straw.geometry.dispose();
        straw.material.dispose();
        sleeve.geometry.dispose();
        sleeve.material.dispose();
        logo.geometry.dispose();
        logo.material.dispose();
        halo.geometry.dispose();
        halo.material.dispose();
        pearlGroup.children.forEach((child) => {
          child.geometry.dispose();
        });
        pearlMaterial.dispose();
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
    const state = sceneStateRef.current;

    if (!state || !tea) {
      return undefined;
    }

    state.cupMaterial.color.set(tea.cupMain);
    state.lidMaterial.color.set(tea.cupSecondary);
    state.strawMaterial.color.set(tea.accent);
    state.sleeveMaterial.color.set(tea.accentSoft);
    state.logoMaterial.color.set(tea.accent);
    state.pearlMaterial.color.set(tea.pearl);
    state.haloMaterial.color.set(tea.accent);

    if (!shellRef.current) {
      return undefined;
    }

    const animation = animate(shellRef.current, {
      opacity: [0.72, 1],
      scale: [0.94, 1],
      duration: 420,
      ease: 'out(4)'
    });

    return () => animation.cancel?.();
  }, [tea]);

  useEffect(() => {
    if (!sipToken) {
      return undefined;
    }

    const motion = motionRef.current;
    const animation = animate(motion, {
      sipTilt: [0, -0.24, 0.12, 0],
      sipLift: [0, 0.18, -0.04, 0],
      duration: 760,
      ease: 'inOutSine'
    });

    return () => animation.cancel?.();
  }, [sipToken]);

  return (
    <div className="niuma-tea-scene" ref={shellRef}>
      <canvas aria-hidden="true" className="niuma-tea-scene__canvas" ref={canvasRef} />
    </div>
  );
}

export default function SideWidgets({
  collapsed,
  quote,
  fortune,
  onToggleCollapsed,
  onNextQuote,
  onNextFortune,
  onAction,
  onToggleBossMode,
  layoutMode = 'default'
}) {
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const scrambleTimerRef = useRef(null);
  const teaPanelRef = useRef(null);
  const teaStageRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [gameHeight, setGameHeight] = useState(null);
  const [coffeeFxToken, setCoffeeFxToken] = useState(0);
  const [encourageFxToken, setEncourageFxToken] = useState(0);
  const [teaOpen, setTeaOpen] = useState(false);
  const [teaSipToken, setTeaSipToken] = useState(0);
  const [selectedTea, setSelectedTea] = useState(milkTeaBrands[0]);
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

  useEffect(() => {
    if (!teaOpen || !teaPanelRef.current) {
      return undefined;
    }

    const animation = animate(teaPanelRef.current, {
      opacity: [0, 1],
      translateY: [10, 0],
      scale: [0.97, 1],
      duration: 320,
      ease: 'out(4)'
    });

    return () => animation.cancel?.();
  }, [teaOpen]);

  useEffect(() => {
    if (!teaStageRef.current) {
      return undefined;
    }

    const animation = animate(teaStageRef.current, {
      opacity: [0.68, 1],
      translateY: [6, 0],
      duration: 340,
      ease: 'out(4)'
    });

    return () => animation.cancel?.();
  }, [selectedTea]);

  function handleQuickAction(actionKey) {
    if (actionKey === 'coffee') {
      setTeaOpen((current) => !current);
      setCoffeeFxToken(Date.now());
      return;
    }

    onAction(actionKey);

    if (actionKey === 'encourage') {
      setEncourageFxToken(Date.now());
    }
  }

  function handleTeaPick(tea) {
    setSelectedTea(tea);
    setTeaOpen(true);
    setTeaSipToken(Date.now());
    setCoffeeFxToken(Date.now());
  }

  return (
    <div className="niuma-side-widgets" ref={shellRef}>
      <div className="niuma-side-widgets__content" ref={contentRef} style={scaledStyle}>
        <section className={`niuma-widget niuma-widget--quote ${teaOpen ? 'has-floating-tea' : ''}`}>
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <Sparkles aria-hidden="true" size={16} />
              <span>小牛摸鱼角</span>
            </div>
            <button
              className="boss-trigger-btn"
              type="button"
              title="切换努力工作模式 (Ctrl+B)"
              onClick={() => onToggleBossMode?.()}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8" />
                <path d="M12 17v4" />
              </svg>
            </button>
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

              {teaOpen ? (
                <div className="niuma-tea-panel" ref={teaPanelRef}>
                  <div className="niuma-tea-panel__header">
                    <strong>今天喝一杯</strong>
                    <span>{selectedTea.brand} · {selectedTea.drink}</span>
                  </div>

                  <div className="niuma-tea-panel__brands" role="list" aria-label="奶茶品牌">
                    {milkTeaBrands.map((tea) => (
                      <button
                        key={tea.key}
                        className={`niuma-tea-brand ${selectedTea.key === tea.key ? 'is-active' : ''}`}
                        type="button"
                        onClick={() => handleTeaPick(tea)}
                      >
                        <MilkTeaBadge active={selectedTea.key === tea.key} tea={tea} />
                        <span>{tea.brand}</span>
                      </button>
                    ))}
                  </div>

                  <div className="niuma-tea-panel__stage" ref={teaStageRef}>
                    <div className="niuma-tea-panel__visual">
                      <TeaScene sipToken={teaSipToken} tea={selectedTea} />
                      {teaSipToken ? (
                        <span className="niuma-tea-panel__sip-fx" aria-hidden="true" key={teaSipToken}>
                          <i />
                          <i />
                          <i />
                          <b>吨吨吨</b>
                        </span>
                      ) : null}
                    </div>

                    <div className="niuma-tea-panel__copy">
                      <div className="niuma-tea-panel__brandline">
                        <MilkTeaBadge tea={selectedTea} />
                        <div>
                          <strong>{selectedTea.brand}</strong>
                          <span>{selectedTea.drink}</span>
                        </div>
                      </div>
                      <p>摸鱼补给已送达，来一口再继续轻松开工。</p>
                    </div>
                  </div>
                </div>
              ) : null}
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

          <p className="niuma-fortune__note">{fortune.note}</p>
        </section>

        <MiniGame style={gameHeight ? { height: `${gameHeight}px` } : undefined} />
      </div>
    </div>
  );
}
