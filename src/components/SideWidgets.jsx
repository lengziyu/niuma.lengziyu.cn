import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import {
  Check,
  Coffee,
  Copy,
  ChevronUp,
  Gift,
  Heart,
  Leaf,
  MoonStar,
  RefreshCcw,
  Send,
  Sparkles,
  X
} from 'lucide-react';
import { cornerActions as defaultCornerActions } from '../data/home';
import {
  acknowledgeTeaGift,
  acknowledgeTeaGiftReceipt,
  copyText,
  ensureTeaFriendId,
  fetchTeaGiftInbox,
  fetchTeaGiftReceipts,
  sanitizeTeaFriendId,
  sendTeaGift,
  TEA_GIFT_POLL_INTERVAL_MS
} from '../lib/teaGifts';
import MiniGame from './MiniGame';

const SCRAMBLE_CHARS = '牛马百宝箱PDFDOCXLSPNG0123456789';

function FortuneGauge({ score, locale = 'zh' }) {
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
        canvas,
        powerPreference: 'high-performance',
        premultipliedAlpha: false
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.setClearAlpha(0);
      canvas.style.background = 'transparent';

      const scene = new THREE.Scene();
      scene.background = null;
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.z = 4.15;

      const energyField = new THREE.Group();
      const orbitGroup = new THREE.Group();
      scene.add(energyField);

      const createGlowMaterial = (color, opacity) =>
        new THREE.MeshBasicMaterial({
          blending: THREE.AdditiveBlending,
          color,
          depthWrite: false,
          opacity,
          side: THREE.DoubleSide,
          transparent: true
        });

      const outerHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.89, 0.075, 20, 112),
        createGlowMaterial(0x8aa8ff, 0.24)
      );
      const innerHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.58, 0.025, 14, 80),
        createGlowMaterial(0x9b7cff, 0.18)
      );
      const orbitHalo = new THREE.Mesh(
        new THREE.TorusGeometry(0.72, 0.016, 12, 88),
        createGlowMaterial(0x9b7cff, 0.28)
      );
      orbitHalo.rotation.set(0.76, 0.18, -0.24);

      const pulseDisk = new THREE.Mesh(
        new THREE.CircleGeometry(0.76, 64),
        createGlowMaterial(0x8aa8ff, 0.045)
      );
      pulseDisk.position.z = -0.16;

      const sparkGeometry = new THREE.CircleGeometry(0.045, 18);
      const sparkMaterial = createGlowMaterial(0xffffff, 0.72);
      const sparks = Array.from({ length: 8 }, (_, index) => {
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.userData = {
          angle: (Math.PI * 2 * index) / 8,
          radius: index % 2 === 0 ? 0.94 : 0.78,
          speed: index % 3 === 0 ? 0.92 : 0.62,
          wobble: 0.035 + (index % 4) * 0.01
        };
        orbitGroup.add(spark);
        return spark;
      });

      energyField.add(pulseDisk, outerHalo, innerHalo, orbitHalo, orbitGroup);

      function applyThemeColors() {
        const style = getComputedStyle(gauge);
        const primary = style.getPropertyValue('--fortune-three-primary').trim() || '#6f95ff';
        const secondary = style.getPropertyValue('--fortune-three-secondary').trim() || '#9b7cff';
        const spark = style.getPropertyValue('--fortune-three-spark').trim() || '#ffffff';

        outerHalo.material.color.set(primary);
        pulseDisk.material.color.set(primary);
        innerHalo.material.color.set(secondary);
        orbitHalo.material.color.set(secondary);
        sparkMaterial.color.set(spark);
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
      const motionScale = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.24 : 1;

      function renderFrame(now) {
        const elapsed = (now - start) / 1000;
        const pulse = 1 + Math.sin(elapsed * 1.8) * 0.035;

        energyField.rotation.z = elapsed * 0.16 * motionScale;
        energyField.rotation.x = Math.sin(elapsed * 0.72) * 0.055 * motionScale;
        outerHalo.scale.setScalar(pulse);
        outerHalo.material.opacity = 0.2 + Math.sin(elapsed * 1.6) * 0.045;
        innerHalo.rotation.z = -elapsed * 0.52 * motionScale;
        innerHalo.material.opacity = 0.14 + Math.cos(elapsed * 1.4) * 0.045;
        orbitHalo.rotation.z = elapsed * 0.74 * motionScale;
        orbitHalo.material.opacity = 0.2 + Math.sin(elapsed * 2.05) * 0.07;
        pulseDisk.scale.setScalar(0.96 + Math.sin(elapsed * 1.4) * 0.055);
        pulseDisk.material.opacity = 0.035 + Math.cos(elapsed * 1.4) * 0.012;
        orbitGroup.rotation.z = -elapsed * 0.2 * motionScale;
        sparkMaterial.opacity = 0.48 + Math.sin(elapsed * 2.4) * 0.18;

        sparks.forEach((spark) => {
          const { angle, radius, speed, wobble } = spark.userData;
          const theta = angle + elapsed * speed * motionScale;
          const orbit = radius + Math.sin(elapsed * 1.9 + angle) * wobble;
          const scale = 0.72 + Math.sin(elapsed * 2.6 + angle) * 0.28;

          spark.position.set(Math.cos(theta) * orbit, Math.sin(theta) * orbit, 0.08);
          spark.scale.setScalar(scale);
        });

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
        attributeFilter: ['class', 'data-theme']
      });

      cleanupScene = () => {
        window.cancelAnimationFrame(rafId);
        resizeObserver.disconnect();
        themeObserver.disconnect();
        const geometries = new Set();
        const materials = new Set();
        scene.traverse((object) => {
          if (object.geometry) {
            geometries.add(object.geometry);
          }
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => materials.add(material));
          } else if (object.material) {
            materials.add(object.material);
          }
        });
        geometries.forEach((geometry) => geometry.dispose());
        materials.forEach((material) => material.dispose());
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
        <span>{(SIDE_COPY[locale] ?? SIDE_COPY.zh).gauge}</span>
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

const SIDE_COPY = {
  zh: {
    cornerTitle: '小牛摸鱼角',
    bossModeTitle: '切换努力工作模式 (Ctrl+B)',
    quoteAlt: '正在摸鱼的小牛',
    quoteTitle: '今日摸鱼签',
    quoteRefresh: '换一句',
    sipLabel: '吨吨吨',
    drinkCard: '饮料效果卡',
    drinkGuide: '今日点单小抄',
    drinkGuideFlavor: '风味',
    drinkGuideCombo: '搭配',
    drinkGuideMoment: '适合',
    tempBoost: '暖胃续航',
    iceBoost: '清醒加速',
    giftInboxTitle: '好友请你喝奶茶',
    giftFrom: '来自',
    giftAccept: '收下这杯',
    giftDismiss: '先放这',
    giftShareTitle: '送好友',
    giftShareHint: '输入 3 位好友 ID，送出这杯。',
    giftMyId: '我的奶茶 ID',
    giftFriendId: '好友 ID',
    giftFriendPlaceholder: '输入 3 位 ID',
    giftCopy: '复制',
    giftCopied: 'ID 已复制',
    giftSend: '送出这杯',
    giftSending: '送出中...',
    giftSent: '奶茶已送出，等对方查收。',
    giftInvalidId: '先输入有效的好友 ID。',
    giftSelfError: '不能给自己送奶茶。',
    giftAccepted: '好友奶茶已送达，开喝吧。',
    giftArrivalKicker: '奶茶空投抵达',
    giftArrivalTitle: '朋友给你砸来一杯大奶茶！',
    giftArrivalFrom: '来自好友',
    giftArrivalThanks: '谢谢朋友，今天的摸鱼角被照亮了。',
    giftArrivalAction: '收下并开喝',
    giftArrivalClose: '关闭奶茶空投',
    giftReceiptTitle: '好友收下奶茶啦',
    giftReceiptText: '收下了你送的',
    giftReceiptThanks: '还说谢谢你。',
    giftReceiptDismiss: '知道啦',
    refill: '再来一杯',
    drinking: '吨吨吨续命中',
    drinkNow: '马上续一口',
    emptyHint: '已经见底啦，先认真干一会儿，再回来续一杯。',
    drinkingHint: '长按杯子可以继续喝，液面会慢慢降下去。',
    idleHint: '长按杯子慢慢喝，或者点按钮直接吨吨吨到底。',
    panelTag: '小牛摸鱼角专供',
    panelTitle: '今天喝一杯',
    panelClose: '关闭今天喝一杯面板',
    brandsAria: '饮品品牌',
    sugar: '甜度',
    temp: '温度',
    size: '规格',
    fortuneTitle: '今日办公运势',
    fortuneRefresh: '换一个',
    luckyTool: '幸运工具：',
    suitable: '宜：',
    avoid: '忌：',
    gauge: '效率指数',
    holdToSip: '长按杯子喝一口'
  },
  en: {
    cornerTitle: 'Cow Chill Corner',
    bossModeTitle: 'Toggle focus mode (Ctrl+B)',
    quoteAlt: 'Cow chilling',
    quoteTitle: 'Today Quote',
    quoteRefresh: 'Another',
    sipLabel: 'Glug',
    drinkCard: 'Drink Card',
    drinkGuide: 'Quick Sip Guide',
    drinkGuideFlavor: 'Flavor',
    drinkGuideCombo: 'Order',
    drinkGuideMoment: 'Best for',
    tempBoost: 'Warm boost',
    iceBoost: 'Focus boost',
    giftInboxTitle: 'Tea from Friends',
    giftFrom: 'From',
    giftAccept: 'Accept',
    giftDismiss: 'Dismiss',
    giftShareTitle: 'Send Tea',
    giftShareHint: 'Enter a 3-digit ID to send this cup.',
    giftMyId: 'My Tea ID',
    giftFriendId: 'Friend ID',
    giftFriendPlaceholder: 'Enter 3-digit ID',
    giftCopy: 'Copy',
    giftCopied: 'ID copied.',
    giftSend: 'Send This Cup',
    giftSending: 'Sending...',
    giftSent: 'Tea sent. Your friend can receive it now.',
    giftInvalidId: 'Enter a valid friend ID first.',
    giftSelfError: 'You cannot send tea to yourself.',
    giftAccepted: 'Gift received. Enjoy your tea.',
    giftArrivalKicker: 'Tea drop incoming',
    giftArrivalTitle: 'A huge tea just landed from your friend!',
    giftArrivalFrom: 'From friend',
    giftArrivalThanks: 'Thank your friend. Your chill corner is officially powered up.',
    giftArrivalAction: 'Accept and Sip',
    giftArrivalClose: 'Close tea drop',
    giftReceiptTitle: 'Tea accepted',
    giftReceiptText: 'accepted your',
    giftReceiptThanks: 'and says thanks.',
    giftReceiptDismiss: 'Nice',
    refill: 'Refill',
    drinking: 'Drinking...',
    drinkNow: 'Sip now',
    emptyHint: 'Cup is empty. Come back for a refill.',
    drinkingHint: 'Hold to keep drinking.',
    idleHint: 'Hold to sip, or tap for auto drink.',
    panelTag: 'Corner Special',
    panelTitle: 'Today Drink',
    panelClose: 'Close drink panel',
    brandsAria: 'Drink brands',
    sugar: 'Sugar',
    temp: 'Temp',
    size: 'Size',
    fortuneTitle: 'Office Fortune',
    fortuneRefresh: 'Refresh',
    luckyTool: 'Lucky Tool:',
    suitable: 'Do:',
    avoid: 'Avoid:',
    gauge: 'Efficiency',
    holdToSip: 'Hold cup to sip'
  }
};

const TEA_TEXT_EN = {
  蜜雪冰城: 'Mixue',
  霸王茶姬: 'CHAGEE',
  喜茶: 'HEYTEA',
  茶百道: 'Chabaidao',
  古茗: 'Guming',
  沪上阿姨: 'Auntea Jenny',
  瑞幸咖啡: 'Luckin Coffee',
  星巴克: 'Starbucks',
  标准甜: 'Regular',
  五分糖: '50% sugar',
  三分糖: '30% sugar',
  少甜: 'Less sweet',
  无糖: 'No sugar',
  不额外加糖: 'No extra sugar',
  标准糖: 'Regular sugar',
  微糖: 'Light sugar',
  少冰: 'Less ice',
  飞冰: 'No ice',
  正常冰: 'Regular ice',
  冰: 'Iced',
  热: 'Hot',
  热饮: 'Hot drink',
  中杯: 'M',
  大杯: 'L',
  超大杯: 'XL',
  冰鲜柠檬水: 'Iced Lemonade',
  满杯百香果: 'Passion Fruit',
  伯牙绝弦: 'Boya Juexian',
  花田乌龙: 'Floral Oolong',
  多肉葡萄: 'Grape Boom',
  轻芝多肉青提: 'Cheese Green Grape',
  杨枝甘露: 'Mango Pomelo Sago',
  豆乳玉麒麟: 'Soy Milk Qilin',
  超A芝士葡萄: 'Cheese Grape',
  云岭茉莉白: 'Jasmine White',
  血糯米奶茶: 'Black Glutinous Milk Tea',
  杨枝甘露酸奶杯: 'Mango Pomelo Yogurt',
  生椰拿铁: 'Coconut Latte',
  丝绒拿铁: 'Velvet Latte',
  冰美式: 'Iced Americano',
  馥芮白: 'Flat White',
  酸甜醒脑: 'Fresh focus',
  果香续航: 'Fruity energy',
  茶香稳场: 'Tea calm',
  轻柔放松: 'Soft relax',
  果感解闷: 'Fruity mood',
  清新提速: 'Fresh boost',
  芒感回血: 'Mango recharge',
  温和续航: 'Soft stamina',
  清甜充电: 'Sweet recharge',
  清香醒神: 'Aroma focus',
  暖暖补能: 'Warm energy',
  轻甜解闷: 'Light sweet mood',
  清爽补能: 'Fresh energy',
  柔和提神: 'Gentle focus',
  利落清醒: 'Clean alert',
  稳稳回神: 'Steady focus',
  清爽解压: 'Refreshing',
  轻负担: 'Light',
  果香上头: 'Fruity',
  元气补给: 'Energy',
  茶感清晰: 'Tea notes',
  慢慢回神: 'Slow focus',
  花香柔和: 'Floral',
  不抢戏: 'Balanced',
  葡萄香气: 'Grape aroma',
  心情回暖: 'Mood up',
  清口一点: 'Clean taste',
  节奏加快: 'Faster pace',
  顺滑果感: 'Smooth fruit',
  回血中: 'Recharging',
  绵密一点: 'Creamy',
  不慌不忙: 'Steady',
  葡萄轻甜: 'Light grape',
  气氛变软: 'Soft mood',
  茉莉香气: 'Jasmine',
  稳稳发力: 'Steady push',
  绵一点: 'Soft',
  安抚情绪: 'Calming',
  果香轻快: 'Bright fruit',
  状态回暖: 'Back in flow',
  冷饮推荐: 'Cold pick',
  脑袋回电: 'Mind recharge',
  口感顺滑: 'Smooth taste',
  不容易腻: 'Not heavy',
  经典续命: 'Classic pick',
  节奏拉满: 'Full pace',
  奶感更轻: 'Light milk',
  专注续航: 'Focus stamina',
  '酸甜感更轻快，适合脑子刚卡住的时候来一口。': 'Sweet and sour, good when you feel stuck.',
  '果味会更热闹一点，适合下午想提提气氛。': 'Fruity and lively, nice for afternoon boost.',
  '入口会更稳，像把乱掉的待办重新排好了队。': 'Balanced and calm, like tidying your todo list.',
  '香气更软一点，适合边改稿边给自己降噪。': 'Soft aroma, great for editing with less stress.',
  '有点像给发灰的工作日补了一层亮色。': 'Adds a bright tone to a dull workday.',
  '青提会更清一点，适合想提神但不想太重的时候。': 'Clean and light, good for gentle focus.',
  '偏热带感一点，适合把没电的状态拉回来。': 'Tropical flavor to recharge your energy.',
  '整体更柔和，适合长时间处理细碎工作。': 'Gentle profile for long detail work.',
  '入口会更轻快，适合刚被消息轰炸完缓一缓。': 'Light and easy after message overload.',
  '更安静的香气，适合专心写字和看表格。': 'Quiet aroma for writing and spreadsheet work.',
  '更像摸鱼角的舒缓模式，适合忙得发飘的时候稳一下。': 'Comfort mode for hectic moments.',
  '甜度更松弛一点，适合边听歌边做重复活。': 'Relaxed sweetness for repetitive tasks.',
  '椰香顺一点，下午开工也没那么苦。': 'Smooth coconut note for afternoon restart.',
  '更绵一点，适合边开会边慢慢续命。': 'Creamy and calm during meetings.',
  '一口直接醒神，适合把待办清到见底。': 'One sip wakes you up to clear tasks.',
  '更平衡一点，适合长时间盯需求和文档。': 'Balanced and steady for long focus.'
};

function pickRandomDrink(tea) {
  return tea.drinks[Math.floor(Math.random() * tea.drinks.length)];
}

function getTeaTemperatureMode(temp) {
  if (temp === '热' || temp === '热饮') {
    return 'hot';
  }

  if (temp === '飞冰') {
    return 'iced-max';
  }

  if (temp === '冰' || temp === '正常冰') {
    return 'iced';
  }

  return 'chilled';
}

function getTeaSizeScale(size) {
  if (size === '中杯') {
    return { x: 0.92, y: 0.9, z: 0.92 };
  }

  if (size === '超大杯') {
    return { x: 1.06, y: 1.14, z: 1.06 };
  }

  return { x: 1, y: 1.02, z: 1 };
}

const milkTeaBrands = [
  {
    key: 'mixue',
    brand: '蜜雪冰城',
    short: '雪',
    logo: '/images/mixue-brand.svg',
    logoScaleX: 0.58,
    logoScaleY: 0.58,
    logoBadgeWidth: 40,
    accent: '#e64545',
    accentSoft: '#ffe3e3',
    accentDeep: '#b83232',
    panelGlow: 'rgba(230, 69, 69, 0.18)',
    cupMain: '#fff8f6',
    cupSecondary: '#ffd6d6',
    pearl: '#3d221f',
    drinks: [
      {
        name: '冰鲜柠檬水',
        effect: '酸甜醒脑',
        note: '酸甜感更轻快，适合脑子刚卡住的时候来一口。',
        tags: ['清爽解压', '轻负担']
      },
      {
        name: '满杯百香果',
        effect: '果香续航',
        note: '果味会更热闹一点，适合下午想提提气氛。',
        tags: ['果香上头', '元气补给']
      }
    ],
    sugarOptions: ['标准甜', '五分糖', '三分糖', '无糖'],
    tempOptions: ['少冰', '飞冰'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '三分糖', temp: '少冰', size: '大杯' }
  },
  {
    key: 'chagee',
    brand: '霸王茶姬',
    short: '姬',
    logo: '/images/chagee-brand.svg',
    logoScaleX: 0.56,
    logoScaleY: 0.56,
    logoBadgeWidth: 40,
    accent: '#b43a3f',
    accentSoft: '#ffe0df',
    accentDeep: '#8f242a',
    panelGlow: 'rgba(180, 58, 63, 0.17)',
    cupMain: '#fff9f4',
    cupSecondary: '#f9d8c9',
    pearl: '#5a3429',
    drinks: [
      {
        name: '伯牙绝弦',
        effect: '茶香稳场',
        note: '入口会更稳，像把乱掉的待办重新排好了队。',
        tags: ['茶感清晰', '慢慢回神']
      },
      {
        name: '花田乌龙',
        effect: '轻柔放松',
        note: '香气更软一点，适合边改稿边给自己降噪。',
        tags: ['花香柔和', '不抢戏']
      }
    ],
    sugarOptions: ['标准甜', '五分糖', '三分糖'],
    tempOptions: ['少冰', '飞冰', '热饮'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '五分糖', temp: '少冰', size: '大杯' }
  },
  {
    key: 'heytea',
    brand: '喜茶',
    short: '喜',
    logo: '/images/heytea-brand.svg',
    logoScaleX: 0.56,
    logoScaleY: 0.56,
    logoBadgeWidth: 42,
    accent: '#1d1d1f',
    accentSoft: '#ececec',
    accentDeep: '#111113',
    panelGlow: 'rgba(29, 29, 31, 0.12)',
    cupMain: '#fbfbfb',
    cupSecondary: '#e8ecf4',
    pearl: '#22242c',
    drinks: [
      {
        name: '多肉葡萄',
        effect: '果感解闷',
        note: '有点像给发灰的工作日补了一层亮色。',
        tags: ['葡萄香气', '心情回暖']
      },
      {
        name: '轻芝多肉青提',
        effect: '清新提速',
        note: '青提会更清一点，适合想提神但不想太重的时候。',
        tags: ['清口一点', '节奏加快']
      }
    ],
    sugarOptions: ['标准甜', '少甜', '不额外加糖'],
    tempOptions: ['少冰', '飞冰'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '少甜', temp: '少冰', size: '大杯' }
  },
  {
    key: 'chabaidao',
    brand: '茶百道',
    short: '茶',
    logo: '/images/chabaidao-brand.svg',
    logoScaleX: 0.6,
    logoScaleY: 0.56,
    logoBadgeWidth: 42,
    accent: '#2d74ff',
    accentSoft: '#e2ecff',
    accentDeep: '#1e54bf',
    panelGlow: 'rgba(45, 116, 255, 0.17)',
    cupMain: '#f8fbff',
    cupSecondary: '#d8e7ff',
    pearl: '#2d3a68',
    drinks: [
      {
        name: '杨枝甘露',
        effect: '芒感回血',
        note: '偏热带感一点，适合把没电的状态拉回来。',
        tags: ['顺滑果感', '回血中']
      },
      {
        name: '豆乳玉麒麟',
        effect: '温和续航',
        note: '整体更柔和，适合长时间处理细碎工作。',
        tags: ['绵密一点', '不慌不忙']
      }
    ],
    sugarOptions: ['标准甜', '五分糖', '三分糖'],
    tempOptions: ['少冰', '正常冰', '热饮'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '三分糖', temp: '少冰', size: '大杯' }
  },
  {
    key: 'guming',
    brand: '古茗',
    short: '古',
    logo: '/images/guming-brand.svg',
    logoScaleX: 0.92,
    logoScaleY: 0.4,
    logoBadgeWidth: 54,
    accent: '#1f9a62',
    accentSoft: '#ddf6e9',
    accentDeep: '#136743',
    panelGlow: 'rgba(31, 154, 98, 0.17)',
    cupMain: '#f8fff9',
    cupSecondary: '#d7f5df',
    pearl: '#284136',
    drinks: [
      {
        name: '超A芝士葡萄',
        effect: '清甜充电',
        note: '入口会更轻快，适合刚被消息轰炸完缓一缓。',
        tags: ['葡萄轻甜', '气氛变软']
      },
      {
        name: '云岭茉莉白',
        effect: '清香醒神',
        note: '更安静的香气，适合专心写字和看表格。',
        tags: ['茉莉香气', '稳稳发力']
      }
    ],
    sugarOptions: ['标准甜', '五分糖', '三分糖', '无糖'],
    tempOptions: ['少冰', '飞冰', '热饮'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '三分糖', temp: '少冰', size: '大杯' }
  },
  {
    key: 'hushang',
    brand: '沪上阿姨',
    short: '沪',
    logo: '/images/hushang-brand.png',
    logoScaleX: 1.02,
    logoScaleY: 0.28,
    logoBadgeWidth: 58,
    accent: '#0f8f97',
    accentSoft: '#ddf8fa',
    accentDeep: '#0a5e64',
    panelGlow: 'rgba(15, 143, 151, 0.17)',
    cupMain: '#f8ffff',
    cupSecondary: '#d6f5f7',
    pearl: '#294244',
    drinks: [
      {
        name: '血糯米奶茶',
        effect: '暖暖补能',
        note: '更像摸鱼角的舒缓模式，适合忙得发飘的时候稳一下。',
        tags: ['绵一点', '安抚情绪']
      },
      {
        name: '杨枝甘露酸奶杯',
        effect: '轻甜解闷',
        note: '甜度更松弛一点，适合边听歌边做重复活。',
        tags: ['果香轻快', '状态回暖']
      }
    ],
    sugarOptions: ['标准甜', '五分糖', '三分糖'],
    tempOptions: ['少冰', '飞冰', '热饮'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '五分糖', temp: '少冰', size: '大杯' }
  },
  {
    key: 'luckin',
    brand: '瑞幸咖啡',
    short: '瑞',
    accent: '#0022AB',
    accentSoft: '#dce7ff',
    accentDeep: '#001a86',
    panelGlow: 'rgba(0, 34, 171, 0.18)',
    cupMain: '#f8fbff',
    cupSecondary: '#d8e7ff',
    pearl: '#5b3928',
    logo: '/images/luckin-coffee-brand.svg',
    logoScaleX: 1.02,
    logoScaleY: 0.28,
    logoBadgeWidth: 58,
    drinks: [
      {
        name: '生椰拿铁',
        effect: '清爽补能',
        note: '椰香顺一点，下午开工也没那么苦。',
        tags: ['冷饮推荐', '脑袋回电']
      },
      {
        name: '丝绒拿铁',
        effect: '柔和提神',
        note: '更绵一点，适合边开会边慢慢续命。',
        tags: ['口感顺滑', '不容易腻']
      }
    ],
    sugarOptions: ['标准糖', '微糖', '无糖'],
    tempOptions: ['冰', '热'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '微糖', temp: '冰', size: '大杯' }
  },
  {
    key: 'starbucks',
    brand: '星巴克',
    short: '星',
    accent: '#006241',
    accentSoft: '#ddf5ec',
    accentDeep: '#00472f',
    panelGlow: 'rgba(0, 98, 65, 0.17)',
    cupMain: '#f8fffc',
    cupSecondary: '#d7efe7',
    pearl: '#3f2a1d',
    logo: '/images/starbucks-brand.svg',
    logoScaleX: 0.52,
    logoScaleY: 0.52,
    logoBadgeWidth: 40,
    drinks: [
      {
        name: '冰美式',
        effect: '利落清醒',
        note: '一口直接醒神，适合把待办清到见底。',
        tags: ['经典续命', '节奏拉满']
      },
      {
        name: '馥芮白',
        effect: '稳稳回神',
        note: '更平衡一点，适合长时间盯需求和文档。',
        tags: ['奶感更轻', '专注续航']
      }
    ],
    sugarOptions: ['标准糖', '少糖', '无糖'],
    tempOptions: ['冰', '热'],
    sizeOptions: ['中杯', '大杯', '超大杯'],
    defaults: { sugar: '无糖', temp: '冰', size: '大杯' }
  }
];

function DrinkBrandBadge({ tea, active = false }) {
  return (
    <span
      aria-hidden="true"
      className={`niuma-tea-badge ${tea.logo ? 'has-logo' : ''} niuma-tea-badge--${tea.key} ${active ? 'is-active' : ''}`}
      style={{
        '--tea-accent': tea.accent,
        '--tea-accent-soft': tea.accentSoft,
        '--tea-badge-width': tea.logo ? `${tea.logoBadgeWidth ?? 36}px` : '30px'
      }}
    >
      {tea.logo ? (
        <img alt="" src={tea.logo} />
      ) : (
        <svg viewBox="0 0 40 40">
          <rect x="2.5" y="2.5" width="35" height="35" rx="12" fill="var(--tea-accent-soft)" />
          <path d="M20 10c-4.6 0-8.4 3.8-8.4 8.4 0 4.1 2.9 7.5 6.8 8.2V31h3.2v-4.3c4-.7 6.9-4.1 6.9-8.3C28.5 13.8 24.7 10 20 10Z" fill="var(--tea-accent)" opacity="0.14" />
          <text x="20" y="24" textAnchor="middle">{tea.short}</text>
        </svg>
      )}
    </span>
  );
}

function TeaScene({
  tea,
  sipToken,
  size,
  fillLevel = 1,
  isDrinking = false,
  sipAriaLabel = '长按杯子喝一口',
  onPressStart,
  onPressEnd
}) {
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

      const liquid = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.58, 1.56, 48),
        new THREE.MeshPhongMaterial({
          color: 0xf6dcb1,
          transparent: true,
          opacity: 0.78,
          shininess: 72
        })
      );
      liquid.position.y = -0.22;

      const liquidSurface = new THREE.Mesh(
        new THREE.CircleGeometry(0.7, 36),
        new THREE.MeshPhongMaterial({
          color: 0xffefcf,
          transparent: true,
          opacity: 0.72,
          shininess: 110
        })
      );
      liquidSurface.position.set(0, 0.55, 0);
      liquidSurface.rotation.x = -Math.PI / 2;

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.045, 16, 88),
        new THREE.MeshBasicMaterial({
          color: 0xe3d6ff,
          transparent: true,
          opacity: 0
        })
      );
      halo.rotation.x = 0.38;
      halo.position.y = -0.1;
      halo.visible = false;

      const light = new THREE.PointLight(0xffffff, 1.8, 20);
      light.position.set(2.4, 3.2, 5.2);
      const light2 = new THREE.PointLight(0xc8d8ff, 1.2, 18);
      light2.position.set(-2.8, -1.2, 4.6);
      const ambient = new THREE.AmbientLight(0xffffff, 1.18);
      scene.add(light, light2, ambient);

      group.add(halo, cup, liquid, liquidSurface, lid, straw);

      const state = {
        THREE,
        renderer,
        scene,
        camera,
        group,
        cupMaterial: cup.material,
        liquidMaterial: liquid.material,
        liquidSurfaceMaterial: liquidSurface.material,
        lidMaterial: lid.material,
        strawMaterial: straw.material,
        haloMaterial: halo.material,
        liquid,
        liquidSurface
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
        group.position.y = -0.22 + sipMotion.sipLift + Math.sin(elapsed * 2.1) * 0.08;
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
        liquid.geometry.dispose();
        liquid.material.dispose();
        liquidSurface.geometry.dispose();
        liquidSurface.material.dispose();
        lid.geometry.dispose();
        lid.material.dispose();
        straw.geometry.dispose();
        straw.material.dispose();
        halo.geometry.dispose();
        halo.material.dispose();
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
    state.liquidMaterial.color.set(tea.drinkTint ?? tea.accentSoft);
    state.liquidSurfaceMaterial.color.set(tea.drinkSurfaceTint ?? tea.cupSecondary);
    state.lidMaterial.color.set(tea.cupSecondary);
    state.strawMaterial.color.set(tea.accent);
    state.haloMaterial.color.set(tea.accent);

    const sizeScale = getTeaSizeScale(size);
    state.group.scale.set(sizeScale.x, sizeScale.y, sizeScale.z);

    if (!shellRef.current) {
      return undefined;
    }

    const animation = animate(shellRef.current, {
      opacity: [0.72, 1],
      scale: [0.95, 1],
      duration: 420,
      ease: 'out(4)'
    });

    return () => {
      animation.cancel?.();
    };
  }, [tea, size]);

  useEffect(() => {
    const state = sceneStateRef.current;

    if (!state) {
      return;
    }

    const normalized = Math.max(0, Math.min(fillLevel, 1));
    const visualLevel = Math.max(normalized, 0.03);
    const liquidHeight = 1.56;
    const topY = 0.55;
    const baseY = -0.22;

    state.liquid.scale.y = visualLevel;
    state.liquid.position.y = baseY - (liquidHeight * (1 - visualLevel)) / 2;
    state.liquid.visible = normalized > 0.01;
    state.liquidSurface.position.y = topY - liquidHeight * (1 - visualLevel);
    state.liquidSurface.visible = normalized > 0.01;
    state.liquidMaterial.opacity = normalized > 0.01 ? 0.78 : 0;
    state.liquidSurfaceMaterial.opacity = normalized > 0.01 ? 0.72 : 0;
  }, [fillLevel]);

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
    <div
      className={`niuma-tea-scene ${isDrinking ? 'is-drinking' : ''}`}
      ref={shellRef}
      onContextMenu={(event) => event.preventDefault()}
      onPointerCancel={onPressEnd}
      onPointerDown={onPressStart}
      onPointerLeave={onPressEnd}
      onPointerUp={onPressEnd}
      role="button"
      tabIndex={0}
      aria-label={sipAriaLabel}
    >
      <canvas aria-hidden="true" className="niuma-tea-scene__canvas" ref={canvasRef} />
    </div>
  );
}

function TeaGiftInbox({ copy, gifts, localizeTeaText, onAccept, onDismiss }) {
  if (!gifts.length) {
    return null;
  }

  return (
    <div className="niuma-tea-gift-inbox" role="status" aria-live="polite">
      <div className="niuma-tea-gift-inbox__head">
        <div className="niuma-tea-gift-inbox__title">
          <Gift aria-hidden="true" size={15} />
          <strong>{copy.giftInboxTitle}</strong>
        </div>
        <span>{gifts.length}</span>
      </div>

      <div className="niuma-tea-gift-inbox__list">
        {gifts.map((gift) => (
          <article className="niuma-tea-gift-card" key={gift.id}>
            <div className="niuma-tea-gift-card__copy">
              <p>
                <strong>{localizeTeaText(gift.brand)}</strong>
                <span>{localizeTeaText(gift.drinkName)}</span>
              </p>
              <small>
                {copy.giftFrom}
                {' '}
                {gift.senderId}
              </small>
            </div>
            <div className="niuma-tea-gift-card__actions">
              <button
                className="niuma-tea-gift-card__primary"
                type="button"
                onClick={() => onAccept(gift)}
              >
                <Check aria-hidden="true" size={14} />
                <span>{copy.giftAccept}</span>
              </button>
              <button
                className="niuma-tea-gift-card__secondary"
                type="button"
                onClick={() => onDismiss(gift.id)}
              >
                {copy.giftDismiss}
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TeaGiftReceipts({ copy, receipts, localizeTeaText, onDismiss }) {
  if (!receipts.length) {
    return null;
  }

  return (
    <div className="niuma-tea-receipts" role="status" aria-live="polite">
      <div className="niuma-tea-receipts__head">
        <div className="niuma-tea-receipts__title">
          <Sparkles aria-hidden="true" size={15} />
          <strong>{copy.giftReceiptTitle}</strong>
        </div>
        <span>{receipts.length}</span>
      </div>

      <div className="niuma-tea-receipts__list">
        {receipts.map((receipt) => (
          <article className="niuma-tea-receipt-card" key={receipt.id}>
            <div className="niuma-tea-receipt-card__copy">
              <p>
                <strong>{receipt.recipientId}</strong>
                <span>{copy.giftReceiptText}</span>
              </p>
              <small>
                {localizeTeaText(receipt.brand)}
                {' · '}
                {localizeTeaText(receipt.drinkName)}
                {' '}
                {copy.giftReceiptThanks}
              </small>
            </div>
            <button
              className="niuma-tea-receipt-card__action"
              type="button"
              onClick={() => onDismiss(receipt.id)}
            >
              <Check aria-hidden="true" size={14} />
              <span>{copy.giftReceiptDismiss}</span>
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function TeaGiftArrival({ copy, gift, localizeTeaText, onClose }) {
  const [settled, setSettled] = useState(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!gift) {
      return undefined;
    }

    setSettled(false);
    const settleTimer = window.setTimeout(() => setSettled(true), 3600);

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        onCloseRef.current();
      }
    }

    document.body.classList.add('has-tea-arrival');
    window.addEventListener('keydown', handleKeydown);

    return () => {
      window.clearTimeout(settleTimer);
      window.removeEventListener('keydown', handleKeydown);
      document.body.classList.remove('has-tea-arrival');
    };
  }, [gift]);

  if (!gift) {
    return null;
  }

  const tea = gift.tea;
  const drink = gift.drink;
  const splashBits = Array.from({ length: 18 });
  const starBits = Array.from({ length: 12 });

  return (
    <div
      aria-label={copy.giftArrivalTitle}
      aria-modal="true"
      className={`niuma-tea-arrival ${settled ? 'is-settled' : ''}`}
      role="dialog"
      style={{
        '--tea-accent': tea.accent,
        '--tea-accent-soft': tea.accentSoft,
        '--tea-accent-deep': tea.accentDeep,
        '--tea-panel-glow': tea.panelGlow
      }}
    >
      <div className="niuma-tea-arrival__sky" aria-hidden="true">
        {starBits.map((_, index) => (
          <i key={`star-${index}`} />
        ))}
      </div>

      <div className="niuma-tea-arrival__shockwave" aria-hidden="true" />
      <div className="niuma-tea-arrival__ground" aria-hidden="true" />

      <div className="niuma-tea-arrival__drop" aria-hidden="true">
        <div className="niuma-tea-arrival__cup">
          <TeaScene
            fillLevel={1}
            isDrinking={false}
            sipAriaLabel={copy.holdToSip}
            sipToken={gift.id}
            tea={tea}
            size={gift.size}
          />
        </div>
      </div>

      <div className="niuma-tea-arrival__splash" aria-hidden="true">
        {splashBits.map((_, index) => (
          <i key={`splash-${index}`} />
        ))}
      </div>

      <div className="niuma-tea-arrival__card">
        <span className="niuma-tea-arrival__kicker">{copy.giftArrivalKicker}</span>
        <h2>{copy.giftArrivalTitle}</h2>
        <div className="niuma-tea-arrival__drink">
          <DrinkBrandBadge tea={tea} />
          <div>
            <strong>{localizeTeaText(tea.brand)} · {localizeTeaText(drink.name)}</strong>
            <span>{copy.giftArrivalFrom} {gift.senderId}</span>
          </div>
        </div>
        <p>{copy.giftArrivalThanks}</p>
        <button className="niuma-tea-arrival__accept" type="button" onClick={() => onCloseRef.current()}>
          <Coffee aria-hidden="true" size={17} />
          <span>{copy.giftArrivalAction}</span>
        </button>
      </div>

      <button
        aria-label={copy.giftArrivalClose}
        className="niuma-tea-arrival__close"
        type="button"
        onClick={() => onCloseRef.current()}
      >
        <X aria-hidden="true" size={19} />
      </button>
    </div>
  );
}

export default function SideWidgets({
  collapsed,
  quote,
  fortune,
  locale = 'zh',
  cornerActions = defaultCornerActions,
  onToggleCollapsed,
  onNextQuote,
  onNextFortune,
  onAction,
  onToggleBossMode,
  layoutMode = 'default'
}) {
  const copy = SIDE_COPY[locale] ?? SIDE_COPY.zh;
  const localizeTeaText = (text) => (locale === 'en' ? (TEA_TEXT_EN[text] ?? text) : text);
  const shellRef = useRef(null);
  const contentRef = useRef(null);
  const coffeeActionRef = useRef(null);
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
  const [teaToastToken, setTeaToastToken] = useState(0);
  const [teaToastText, setTeaToastText] = useState('续命成功 +1');
  const [friendTeaId, setFriendTeaId] = useState('');
  const [giftTargetId, setGiftTargetId] = useState('');
  const [giftSending, setGiftSending] = useState(false);
  const [giftStatus, setGiftStatus] = useState(null);
  const [giftInbox, setGiftInbox] = useState([]);
  const [giftReceipts, setGiftReceipts] = useState([]);
  const [giftArrival, setGiftArrival] = useState(null);
  const [selectedDrinkName, setSelectedDrinkName] = useState(pickRandomDrink(milkTeaBrands[0]).name);
  const [selectedSugar, setSelectedSugar] = useState(milkTeaBrands[0].defaults.sugar);
  const [selectedTemp, setSelectedTemp] = useState(milkTeaBrands[0].defaults.temp);
  const [selectedSize, setSelectedSize] = useState(milkTeaBrands[0].defaults.size);
  const [teaFillLevel, setTeaFillLevel] = useState(1);
  const [teaIsDrinking, setTeaIsDrinking] = useState(false);
  const [displayQuote, setDisplayQuote] = useState('');
  const teaDrinkModeRef = useRef('manual');
  const teaDrinkRafRef = useRef(0);
  const teaDrinkLastTsRef = useRef(0);
  const teaFinishHandledRef = useRef(false);

  const selectedDrink =
    selectedTea.drinks.find((drink) => drink.name === selectedDrinkName) || selectedTea.drinks[0];
  const teaTemperatureMode = getTeaTemperatureMode(selectedTemp);
  const condensationCount =
    teaTemperatureMode === 'iced-max' ? 8 : teaTemperatureMode === 'iced' ? 6 : 4;
  const teaIsEmpty = teaFillLevel <= 0.02;

  useEffect(() => {
    if (locale === 'en' && teaToastText === '续命成功 +1') {
      setTeaToastText('Energy +1');
    }
    if (locale === 'zh' && teaToastText === 'Energy +1') {
      setTeaToastText('续命成功 +1');
    }
  }, [locale, teaToastText]);

  useEffect(() => {
    let disposed = false;

    async function syncFriendId() {
      try {
        const nextFriendId = await ensureTeaFriendId();
        if (!disposed) {
          setFriendTeaId(nextFriendId);
        }
      } catch {
        if (!disposed) {
          setFriendTeaId('');
        }
      }
    }

    void syncFriendId();

    return () => {
      disposed = true;
    };
  }, []);

  useEffect(() => {
    if (!giftStatus?.text) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setGiftStatus(null);
    }, giftStatus.tone === 'error' ? 4200 : 2600);

    return () => window.clearTimeout(timer);
  }, [giftStatus]);

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
    if (!teaOpen) {
      setTeaIsDrinking(false);
      return undefined;
    }

    function handlePointerDown(event) {
      const target = event.target;

      if (teaPanelRef.current?.contains(target) || coffeeActionRef.current?.contains(target)) {
        return;
      }

      setTeaOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setTeaOpen(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [teaOpen]);

  useEffect(() => {
    let disposed = false;

    async function syncGiftInbox() {
      try {
        const [inboxResult, receiptsResult] = await Promise.all([
          fetchTeaGiftInbox(friendTeaId),
          fetchTeaGiftReceipts(friendTeaId)
        ]);

        if (disposed) {
          return;
        }

        if (Array.isArray(inboxResult?.items) && inboxResult.items.length) {
          const nextItems = inboxResult.items.map((gift) => ({
            ...gift,
            brand: milkTeaBrands.find((tea) => tea.key === gift.teaKey)?.brand ?? gift.teaKey
          }));

          setGiftInbox((current) => {
            const seenGiftIds = new Set();
            return [...nextItems, ...current]
              .filter((gift) => {
                if (seenGiftIds.has(gift.id)) {
                  return false;
                }
                seenGiftIds.add(gift.id);
                return true;
              })
              .slice(0, 8);
          });
        }

        if (Array.isArray(receiptsResult?.items) && receiptsResult.items.length) {
          const nextReceipts = receiptsResult.items.map((receipt) => ({
            ...receipt,
            brand: milkTeaBrands.find((tea) => tea.key === receipt.teaKey)?.brand ?? receipt.teaKey
          }));

          setGiftReceipts((current) => {
            const seenReceiptIds = new Set();
            return [...nextReceipts, ...current]
              .filter((receipt) => {
                if (seenReceiptIds.has(receipt.id)) {
                  return false;
                }
                seenReceiptIds.add(receipt.id);
                return true;
              })
              .slice(0, 8);
          });
        }
      } catch {
        // Ignore transient polling failures to avoid noisy UI.
      }
    }

    void syncGiftInbox();

    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') {
        void syncGiftInbox();
      }
    }, TEA_GIFT_POLL_INTERVAL_MS);

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void syncGiftInbox();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      disposed = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [friendTeaId]);

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

  useEffect(() => {
    setTeaFillLevel(1);
    teaFinishHandledRef.current = false;
  }, [selectedTea, selectedDrinkName, selectedTemp, selectedSize]);

  useEffect(() => {
    if (!teaIsDrinking) {
      if (teaDrinkRafRef.current) {
        window.cancelAnimationFrame(teaDrinkRafRef.current);
        teaDrinkRafRef.current = 0;
      }
      teaDrinkLastTsRef.current = 0;
      return undefined;
    }

    function step(timestamp) {
      if (!teaDrinkLastTsRef.current) {
        teaDrinkLastTsRef.current = timestamp;
      }

      const delta = Math.min(42, timestamp - teaDrinkLastTsRef.current);
      teaDrinkLastTsRef.current = timestamp;
      const rate = teaDrinkModeRef.current === 'auto' ? 0.72 : 0.34;

      setTeaFillLevel((current) => {
        const next = Math.max(0, current - (delta / 1000) * rate);

        if (next <= 0.001) {
          window.requestAnimationFrame(() => {
            setTeaIsDrinking(false);
            if (!teaFinishHandledRef.current) {
              teaFinishHandledRef.current = true;
              setTeaToastText(locale === 'en' ? 'Cup finished, fully recharged' : '喝到底啦，精神续满');
              setTeaToastToken(Date.now());
            }
          });
          return 0;
        }

        return next;
      });

      teaDrinkRafRef.current = window.requestAnimationFrame(step);
    }

    teaDrinkRafRef.current = window.requestAnimationFrame(step);

    return () => {
      if (teaDrinkRafRef.current) {
        window.cancelAnimationFrame(teaDrinkRafRef.current);
        teaDrinkRafRef.current = 0;
      }
      teaDrinkLastTsRef.current = 0;
    };
  }, [teaIsDrinking]);

  function handleQuickAction(actionKey) {
    if (actionKey === 'coffee') {
      setTeaOpen((current) => {
        const next = !current;
        if (next) {
          setSelectedDrinkName(pickRandomDrink(selectedTea).name);
        }
        return next;
      });
      setCoffeeFxToken(Date.now());
      return;
    }

    onAction(actionKey);

    if (actionKey === 'encourage') {
      setEncourageFxToken(Date.now());
    }
  }

  function triggerTeaSip() {
    teaFinishHandledRef.current = false;
    setTeaSipToken(Date.now());
    setCoffeeFxToken(Date.now());
  }

  function startTeaDrink(mode = 'manual') {
    if (teaIsEmpty) {
      return;
    }

    teaDrinkModeRef.current = mode;
    triggerTeaSip();
    setTeaToastText(mode === 'auto' ? (locale === 'en' ? 'Refilling...' : '吨吨吨续杯中') : (locale === 'en' ? 'Boosting...' : '续命中...'));
    setTeaToastToken(Date.now());
    setTeaIsDrinking(true);
  }

  function stopTeaDrink() {
    if (teaDrinkModeRef.current === 'auto') {
      return;
    }

    setTeaIsDrinking(false);
  }

  function refillTeaCup() {
    const randomDrink = pickRandomDrink(selectedTea);
    setSelectedDrinkName(randomDrink.name);
    setTeaFillLevel(1);
    setTeaIsDrinking(false);
    teaFinishHandledRef.current = false;
    setTeaToastText(locale === 'en' ? 'Fresh cup is ready' : '新的一杯已续上');
    setTeaToastToken(Date.now());
  }

  function handleTeaPick(tea) {
    const randomDrink = pickRandomDrink(tea);
    setSelectedTea(tea);
    setSelectedDrinkName(randomDrink.name);
    setSelectedSugar(tea.defaults.sugar);
    setSelectedTemp(tea.defaults.temp);
    setSelectedSize(tea.defaults.size);
    setTeaOpen(true);
    setTeaFillLevel(1);
    setTeaIsDrinking(false);
    teaFinishHandledRef.current = false;
    triggerTeaSip();
  }

  async function handleCopyFriendId() {
    if (!friendTeaId) {
      return;
    }

    const copied = await copyText(friendTeaId);

    setGiftStatus({
      tone: copied ? 'success' : 'error',
      text: copied ? copy.giftCopied : friendTeaId
    });
  }

  async function handleSendGift() {
    const recipientId = sanitizeTeaFriendId(giftTargetId);

    if (recipientId.length !== 3) {
      setGiftStatus({ tone: 'error', text: copy.giftInvalidId });
      return;
    }

    if (recipientId === friendTeaId) {
      setGiftStatus({ tone: 'error', text: copy.giftSelfError });
      return;
    }

    setGiftSending(true);

    try {
      await sendTeaGift({
        senderId: friendTeaId,
        recipientId,
        teaKey: selectedTea.key,
        drinkName: selectedDrink.name,
        sugar: selectedSugar,
        temp: selectedTemp,
        size: selectedSize
      });

      setGiftTargetId('');
      setGiftStatus({ tone: 'success', text: copy.giftSent });
      setTeaToastText(locale === 'en' ? 'Tea sent' : '奶茶已送出');
      setTeaToastToken(Date.now());
    } catch (error) {
      setGiftStatus({
        tone: 'error',
        text: error instanceof Error && error.message ? error.message : copy.giftInvalidId
      });
    } finally {
      setGiftSending(false);
    }
  }

  function dismissGift(giftId) {
    setGiftInbox((current) => current.filter((gift) => gift.id !== giftId));
    void acknowledgeTeaGift(friendTeaId, giftId);
  }

  function dismissGiftReceipt(receiptId) {
    setGiftReceipts((current) => current.filter((receipt) => receipt.id !== receiptId));
    void acknowledgeTeaGiftReceipt(friendTeaId, receiptId);
  }

  function acceptGift(gift) {
    const tea = milkTeaBrands.find((item) => item.key === gift.teaKey) ?? milkTeaBrands[0];
    const drink = tea.drinks.find((item) => item.name === gift.drinkName) ?? tea.drinks[0];

    setSelectedTea(tea);
    setSelectedDrinkName(drink.name);
    setSelectedSugar(tea.sugarOptions.includes(gift.sugar) ? gift.sugar : tea.defaults.sugar);
    setSelectedTemp(tea.tempOptions.includes(gift.temp) ? gift.temp : tea.defaults.temp);
    setSelectedSize(tea.sizeOptions.includes(gift.size) ? gift.size : tea.defaults.size);
    setTeaOpen(false);
    setTeaFillLevel(1);
    setTeaIsDrinking(false);
    teaFinishHandledRef.current = false;
    setGiftArrival({
      ...gift,
      tea,
      drink,
      id: `${gift.id}-${Date.now()}`
    });
    dismissGift(gift.id);
  }

  function closeGiftArrival() {
    setGiftArrival(null);
    setTeaOpen(true);
    setTeaToastText(copy.giftAccepted);
    setTeaToastToken(Date.now());
  }

  return (
    <div className="niuma-side-widgets" ref={shellRef}>
      <div className="niuma-side-widgets__content" ref={contentRef} style={scaledStyle}>
        <section className={`niuma-widget niuma-widget--quote ${teaOpen ? 'has-floating-tea' : ''}`}>
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <Sparkles aria-hidden="true" size={16} />
              <span>{copy.cornerTitle}</span>
            </div>
            <button
              className="boss-trigger-btn"
              type="button"
              title={copy.bossModeTitle}
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
                <img alt={copy.quoteAlt} src="/images/mascot-relax-cutout.png" />
                <div className="niuma-widget__quote-copy">
                  <div className="niuma-widget__quote-head">
                    <h3>{copy.quoteTitle}</h3>
                    <button
                      className="niuma-home__ghost-pill niuma-widget__quote-refresh"
                      type="button"
                      onClick={onNextQuote}
                    >
                      {copy.quoteRefresh}
                    </button>
                  </div>
                  <p>“{displayQuote || quote}”</p>
                  <button
                    className="niuma-widget__friend-id"
                    disabled={!friendTeaId}
                    aria-label={copy.giftCopy}
                    title={copy.giftCopy}
                    type="button"
                    onClick={handleCopyFriendId}
                  >
                    <span>ID</span>
                    <strong>{friendTeaId || '...'}</strong>
                    <Copy aria-hidden="true" size={13} />
                  </button>
                </div>
              </div>

              <div className="niuma-widget__quick-actions">
                {cornerActions.map((action) => {
                  return (
                    <button
                      key={action.key}
                      className={`niuma-widget__quick-action niuma-widget__quick-action--${action.key}`}
                      ref={action.key === 'coffee' ? coffeeActionRef : undefined}
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

              <TeaGiftInbox
                copy={copy}
                gifts={giftInbox}
                localizeTeaText={localizeTeaText}
                onAccept={acceptGift}
                onDismiss={dismissGift}
              />
              <TeaGiftReceipts
                copy={copy}
                receipts={giftReceipts}
                localizeTeaText={localizeTeaText}
                onDismiss={dismissGiftReceipt}
              />

              {teaOpen ? (
                <div
                  className={`niuma-tea-popover niuma-tea-popover--${selectedTea.key}`}
                  ref={teaPanelRef}
                  style={{
                    '--tea-accent': selectedTea.accent,
                    '--tea-accent-soft': selectedTea.accentSoft,
                    '--tea-accent-deep': selectedTea.accentDeep,
                    '--tea-panel-glow': selectedTea.panelGlow
                  }}
                >
                  <aside className="niuma-tea-panel__extension">
                    <div className="niuma-tea-panel__stage" ref={teaStageRef}>
                      <div className="niuma-tea-panel__visual">
                        <div className="niuma-tea-panel__visual-aura" aria-hidden="true">
                          <i />
                          <i />
                          <i />
                          <i />
                        </div>
                        {teaTemperatureMode === 'hot' ? (
                          <span className="niuma-tea-panel__steam" aria-hidden="true">
                            <i />
                            <i />
                            <i />
                          </span>
                        ) : (
                          <span
                            className={`niuma-tea-panel__condensation niuma-tea-panel__condensation--${teaTemperatureMode}`}
                            aria-hidden="true"
                          >
                            {Array.from({ length: condensationCount }).map((_, index) => (
                              <i key={`${teaTemperatureMode}-${index}`} />
                            ))}
                          </span>
                        )}
                        <TeaScene
                          fillLevel={teaFillLevel}
                          isDrinking={teaIsDrinking}
                          onPressEnd={stopTeaDrink}
                          onPressStart={() => startTeaDrink('manual')}
                          sipAriaLabel={copy.holdToSip}
                          sipToken={teaSipToken}
                          tea={selectedTea}
                          size={selectedSize}
                        />
                        {teaSipToken ? (
                          <span className="niuma-tea-panel__sip-fx" aria-hidden="true" key={teaSipToken}>
                            <i />
                            <i />
                            <i />
                            <b>{copy.sipLabel}</b>
                          </span>
                        ) : null}
                        {teaToastToken ? (
                          <span className="niuma-tea-panel__toast" aria-hidden="true" key={teaToastToken}>
                            {teaToastText}
                          </span>
                        ) : null}
                      </div>

                      <div className="niuma-tea-panel__copy">
                        <div className="niuma-tea-panel__copy-head">
                          <div className="niuma-tea-panel__extension-header">
                            <em>{copy.drinkCard}</em>
                            <strong>{localizeTeaText(selectedDrink.name)}</strong>
                            <span>{localizeTeaText(selectedTea.brand)} · {localizeTeaText(selectedDrink.effect)}</span>
                          </div>
                          <div className="niuma-tea-panel__extension-meta" aria-hidden="true">
                            {selectedDrink.tags.map((tag) => (
                              <span className="niuma-tea-chip niuma-tea-chip--taste" key={tag}>
                                {localizeTeaText(tag)}
                              </span>
                            ))}
                            <span className="niuma-tea-chip niuma-tea-chip--config niuma-tea-chip--sugar">
                              {localizeTeaText(selectedSugar)}
                            </span>
                            <span className="niuma-tea-chip niuma-tea-chip--config niuma-tea-chip--temp">
                              {localizeTeaText(selectedTemp)}
                            </span>
                            <span className="niuma-tea-chip niuma-tea-chip--config niuma-tea-chip--size">
                              {localizeTeaText(selectedSize)}
                            </span>
                          </div>
                        </div>
                        <div className="niuma-tea-panel__brandline">
                          <DrinkBrandBadge tea={selectedTea} />
                          <div>
                            <strong>{localizeTeaText(selectedTea.brand)}</strong>
                            <span>{localizeTeaText(selectedDrink.name)}</span>
                          </div>
                        </div>
                        <div className="niuma-tea-panel__meta" aria-hidden="true">
                          <span className="niuma-tea-chip niuma-tea-chip--effect">
                            {localizeTeaText(selectedDrink.effect)}
                          </span>
                          <span className="niuma-tea-chip niuma-tea-chip--boost">
                            {selectedTemp === '热' || selectedTemp === '热饮' ? copy.tempBoost : copy.iceBoost}
                          </span>
                        </div>
                        <p>{localizeTeaText(selectedDrink.note)}</p>
                        <div className="niuma-tea-panel__guide">
                          <strong>{copy.drinkGuide}</strong>
                          <div className="niuma-tea-panel__guide-grid">
                            <div>
                              <span>{copy.drinkGuideFlavor}</span>
                              <p>{selectedDrink.tags.map((tag) => localizeTeaText(tag)).join(locale === 'en' ? ' / ' : ' · ')}</p>
                            </div>
                            <div>
                              <span>{copy.drinkGuideCombo}</span>
                              <p>{[selectedSugar, selectedTemp, selectedSize].map((item) => localizeTeaText(item)).join(locale === 'en' ? ' / ' : ' · ')}</p>
                            </div>
                            <div>
                              <span>{copy.drinkGuideMoment}</span>
                              <p>{selectedTemp === '热' || selectedTemp === '热饮' ? copy.tempBoost : copy.iceBoost}</p>
                            </div>
                          </div>
                        </div>
                        <div className="niuma-tea-panel__actions">
                          <button
                            className="niuma-tea-panel__cta"
                            type="button"
                            onClick={() => {
                              if (teaIsEmpty) {
                                refillTeaCup();
                                return;
                              }

                              startTeaDrink('auto');
                            }}
                          >
                            <Coffee aria-hidden="true" size={15} strokeWidth={2.2} />
                            <span>{teaIsEmpty ? copy.refill : teaIsDrinking ? copy.drinking : copy.drinkNow}</span>
                          </button>
                          <span className="niuma-tea-panel__hint">
                            {teaIsEmpty
                              ? copy.emptyHint
                              : teaIsDrinking
                                ? copy.drinkingHint
                                : copy.idleHint}
                          </span>
                        </div>
                      </div>
                    </div>
                  </aside>

                  <div className={`niuma-tea-panel niuma-tea-panel--${selectedTea.key}`}>
                    <div className="niuma-tea-panel__header">
                      <div className="niuma-tea-panel__heading">
                        <em>{copy.panelTag}</em>
                        <strong>{copy.panelTitle}</strong>
                      </div>
                      <div className="niuma-tea-panel__header-side">
                        <span>{localizeTeaText(selectedTea.brand)} · {localizeTeaText(selectedDrink.name)}</span>
                        <button
                          aria-label={copy.panelClose}
                          className="niuma-tea-panel__close"
                          type="button"
                          onClick={() => setTeaOpen(false)}
                        >
                          <X aria-hidden="true" size={15} strokeWidth={2.2} />
                        </button>
                      </div>
                    </div>

                    <div className="niuma-tea-panel__brands" role="list" aria-label={copy.brandsAria}>
                      {milkTeaBrands.map((tea) => (
                        <button
                          key={tea.key}
                          className={`niuma-tea-brand niuma-tea-brand--${tea.key} ${selectedTea.key === tea.key ? 'is-active' : ''}`}
                          type="button"
                          title={localizeTeaText(tea.brand)}
                          aria-label={localizeTeaText(tea.brand)}
                          onClick={() => handleTeaPick(tea)}
                        >
                          <DrinkBrandBadge active={selectedTea.key === tea.key} tea={tea} />
                        </button>
                      ))}
                    </div>

                    <div className="niuma-tea-panel__picker">
                      <div className="niuma-tea-panel__picker-group">
                        <span className="niuma-tea-panel__picker-label">{copy.sugar}</span>
                        <div className="niuma-tea-panel__picker-options">
                          {selectedTea.sugarOptions.map((option) => (
                            <button
                              key={option}
                              className={`niuma-tea-option ${selectedSugar === option ? 'is-active' : ''}`}
                              type="button"
                              onClick={() => setSelectedSugar(option)}
                            >
                              {localizeTeaText(option)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="niuma-tea-panel__picker-group">
                        <span className="niuma-tea-panel__picker-label">{copy.temp}</span>
                        <div className="niuma-tea-panel__picker-options">
                          {selectedTea.tempOptions.map((option) => (
                            <button
                              key={option}
                              className={`niuma-tea-option ${selectedTemp === option ? 'is-active' : ''}`}
                              type="button"
                              onClick={() => setSelectedTemp(option)}
                            >
                              {localizeTeaText(option)}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="niuma-tea-panel__picker-group">
                        <span className="niuma-tea-panel__picker-label">{copy.size}</span>
                        <div className="niuma-tea-panel__picker-options">
                          {selectedTea.sizeOptions.map((option) => (
                            <button
                              key={option}
                              className={`niuma-tea-option ${selectedSize === option ? 'is-active' : ''}`}
                              type="button"
                              onClick={() => setSelectedSize(option)}
                            >
                              {localizeTeaText(option)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="niuma-tea-panel__gift-share">
                      <div className="niuma-tea-panel__gift-share-head">
                        <div>
                          <strong>{copy.giftShareTitle}</strong>
                        </div>
                      </div>

                      <form
                        className="niuma-tea-panel__gift-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          void handleSendGift();
                        }}
                      >
                        <label>
                          <input
                            aria-label={copy.giftFriendId}
                            placeholder={copy.giftFriendPlaceholder}
                            type="text"
                            value={giftTargetId}
                            onChange={(event) => setGiftTargetId(sanitizeTeaFriendId(event.target.value))}
                          />
                        </label>
                        <button disabled={giftSending} type="submit">
                          <Send aria-hidden="true" size={14} />
                          <span>{giftSending ? copy.giftSending : copy.giftSend}</span>
                        </button>
                      </form>

                      <p className="niuma-tea-panel__gift-hint">{copy.giftShareHint}</p>
                      {giftStatus?.text ? (
                        <p className={`niuma-tea-panel__gift-status is-${giftStatus.tone}`}>
                          {giftStatus.text}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}

              <TeaGiftArrival
                copy={copy}
                gift={giftArrival}
                localizeTeaText={localizeTeaText}
                onClose={closeGiftArrival}
              />
            </>
          ) : null}
        </section>

        <section className="niuma-widget niuma-widget--fortune">
          <div className="niuma-widget__header">
            <div className="niuma-widget__title">
              <MoonStar aria-hidden="true" size={16} />
              <span>{copy.fortuneTitle}</span>
            </div>
            <button className="niuma-widget__text-btn" type="button" onClick={onNextFortune}>
              <RefreshCcw aria-hidden="true" size={14} />
              <span>{copy.fortuneRefresh}</span>
            </button>
          </div>

          <div className="niuma-fortune">
            <FortuneGauge locale={locale} score={fortune.score} />
            <div className="niuma-fortune__details">
              <p>
                <strong>{copy.luckyTool}</strong>
                <span>{fortune.luckyTool}</span>
              </p>
              <p>
                <strong>{copy.suitable}</strong>
                <span>{fortune.favorable.join(locale === 'en' ? ', ' : '、')}</span>
              </p>
              <p>
                <strong>{copy.avoid}</strong>
                <span>{fortune.avoid}</span>
              </p>
            </div>
          </div>

          <p className="niuma-fortune__note">{fortune.note}</p>
        </section>

        <MiniGame locale={locale} style={gameHeight ? { height: `${gameHeight}px` } : undefined} />
      </div>
    </div>
  );
}
