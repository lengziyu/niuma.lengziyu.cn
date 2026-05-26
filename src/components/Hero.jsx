import { animate } from 'animejs';
import { Search, X } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

const cowLines = [
  '今天也要轻松开工～',
  '文件交给工具，快乐留给自己。',
  '工作可以忙，心态记得放松。'
];

const plantLines = [
  '工位绿植 Buff：心情 +5',
  '浇到赛博绿萝了，专注度回满。',
  '今天的工位也很有生命力。'
];

const laptopLines = [
  '摸鱼保护已启动，请放心开小差。',
  '工位状态：看起来非常专业。',
  '屏幕里的你，像极了效率标兵。'
];

const handLines = [
  '辛苦了，给自己一个赛博击掌。',
  '打工人能量补给成功，继续发光。',
  '这只小手认证：今天也稳稳拿下。'
];

const titleLines = [
  '牛马出征，难题清空。',
  '工具已经就位，放心大胆开工。',
  '今天的你，比待办清单还靠谱。'
];

const coffeeBrands = [
  {
    key: 'luckin',
    name: '瑞幸咖啡',
    logo: '/images/luckin-coffee-brand.svg',
    accent: '#0022AB',
    glow: 'rgba(0, 34, 171, 0.18)',
    drinks: ['生椰拿铁', '丝绒拿铁', '标准美式'],
    lines: [
      '蓝色续命卡已到账，今天也能稳稳清醒。',
      '瑞幸模式启动，工位效率正在回升。',
      '先喝一口，再把待办一个个拿下。'
    ]
  },
  {
    key: 'starbucks',
    name: '星巴克',
    logo: '/images/starbucks-brand.svg',
    accent: '#006241',
    glow: 'rgba(0, 98, 65, 0.2)',
    drinks: ['燕麦馥芮白', '冰美式', '拿铁'],
    lines: [
      '熟悉的咖啡香一上来，状态就回来了。',
      '这杯负责提神，你只管慢慢开工。',
      '今天先不硬撑，给脑子续一格电。'
    ]
  }
];

const hiddenTools = [
  '图片转文字：截图内容一键提取',
  'PDF拆分：需要哪几页就发哪几页',
  '文本去重：名单整理更快',
  '时间戳转换：查日志更省心'
];

const EGG_IDS = ['plant', 'cow', 'laptop', 'coffee', 'box', 'hand', 'title'];

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

export default function Hero({
  hotTags = [],
  onHotSearch,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) {
  const [egg, setEgg] = useState(null);
  const [cowLine, setCowLine] = useState(cowLines[0]);
  const [plantLine, setPlantLine] = useState(plantLines[0]);
  const [laptopLine, setLaptopLine] = useState(laptopLines[0]);
  const [handLine, setHandLine] = useState(handLines[0]);
  const [titleLine, setTitleLine] = useState(titleLines[0]);
  const [coffeeFxToken, setCoffeeFxToken] = useState(0);
  const [selectedCoffeeKey, setSelectedCoffeeKey] = useState(coffeeBrands[0].key);
  const [coffeeDrink, setCoffeeDrink] = useState(coffeeBrands[0].drinks[0]);
  const [coffeeLine, setCoffeeLine] = useState(coffeeBrands[0].lines[0]);
  const [toolTip, setToolTip] = useState(hiddenTools[0]);
  const [eggPanelDismissed, setEggPanelDismissed] = useState(false);
  const [eggStats, setEggStats] = useState({ totalClicks: 0, foundKeys: [] });
  const [fireworkToken, setFireworkToken] = useState(0);
  const bubbleMotionGroupRef = useRef(null);
  const bubbleTextGroupRef = useRef(null);
  const bubbleRevealRectRef = useRef(null);
  const bubbleClipId = useId().replace(/:/g, '');

  const figureClassName = useMemo(
    () => `niuma-home__hero-figure ${egg ? `is-${egg}-active` : ''}`,
    [egg]
  );

  useEffect(() => {
    if (!egg) {
      return undefined;
    }

    const durations = {
      box: 3600,
      coffee: 3400,
      plant: 2200,
      laptop: 2400
    };
    const timer = window.setTimeout(() => setEgg(null), durations[egg] ?? 1600);

    return () => window.clearTimeout(timer);
  }, [egg, coffeeFxToken]);

  useEffect(() => {
    const motionGroup = bubbleMotionGroupRef.current;
    const textGroup = bubbleTextGroupRef.current;
    const revealRect = bubbleRevealRectRef.current;

    if (!motionGroup || !textGroup || !revealRect || typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const textBounds = textGroup.getBBox();
    const fullWidth = Math.ceil(textBounds.width + 18);
    const clipX = Math.floor(textBounds.x - 8);
    const clipY = Math.floor(textBounds.y - 8);
    const clipHeight = Math.ceil(textBounds.height + 16);
    const motionBase = 'translate(1238 218) rotate(8)';
    const animations = [];

    revealRect.setAttribute('x', String(clipX));
    revealRect.setAttribute('y', String(clipY));
    revealRect.setAttribute('height', String(clipHeight));
    revealRect.setAttribute('rx', '18');
    revealRect.setAttribute('width', mediaQuery.matches ? String(fullWidth) : '0');

    motionGroup.style.opacity = mediaQuery.matches ? '1' : '0';
    motionGroup.setAttribute('transform', mediaQuery.matches ? motionBase : `${motionBase} translate(-18 0)`);

    if (mediaQuery.matches) {
      return undefined;
    }

    const revealState = { width: 0, offset: -18 };

    animations.push(
      animate(motionGroup, {
        opacity: [0, 1],
        duration: 1120,
        ease: 'out(4)'
      })
    );
    animations.push(
      animate(revealState, {
        width: [0, fullWidth],
        offset: [-18, 0],
        duration: 1720,
        ease: 'out(4)',
        onUpdate: () => {
          revealRect.setAttribute('width', String(revealState.width));
          motionGroup.setAttribute(
            'transform',
            `${motionBase} translate(${revealState.offset} 0)`
          );
        }
      })
    );

    return () => {
      animations.forEach((animation) => animation.cancel?.());
    };
  }, []);

  function triggerCowEgg() {
    registerEggClick('cow');
    setCowLine((current) => pickRandom(cowLines, current));
    setEgg('cow');
  }

  function activateCoffeeMoment(key = selectedCoffeeKey, { countEgg = false } = {}) {
    const brand = coffeeBrands.find((item) => item.key === key) ?? coffeeBrands[0];

    if (countEgg) {
      registerEggClick('coffee');
    }

    setSelectedCoffeeKey(brand.key);
    setCoffeeDrink((current) => pickRandom(brand.drinks, current));
    setCoffeeLine((current) => pickRandom(brand.lines, current));
    setCoffeeFxToken((current) => current + 1);
    setEgg('coffee');
  }

  function triggerCoffeeEgg() {
    activateCoffeeMoment(selectedCoffeeKey, { countEgg: true });
  }

  function triggerPlantEgg() {
    registerEggClick('plant');
    setPlantLine((current) => pickRandom(plantLines, current));
    setEgg('plant');
  }

  function triggerLaptopEgg() {
    registerEggClick('laptop');
    setLaptopLine((current) => pickRandom(laptopLines, current));
    setEgg('laptop');
  }

  function triggerBoxEgg() {
    registerEggClick('box');
    setToolTip((current) => pickRandom(hiddenTools, current));
    setEgg('box');
  }

  function triggerHandEgg() {
    registerEggClick('hand');
    setHandLine((current) => pickRandom(handLines, current));
    setEgg('hand');
  }

  function triggerTitleEgg() {
    registerEggClick('title');
    setTitleLine((current) => pickRandom(titleLines, current));
    setEgg('title');
  }

  function handleCoffeeBrandPick(key) {
    activateCoffeeMoment(key);
  }

  function registerEggClick(key) {
    let isNewEgg = false;

    setEggPanelDismissed(false);
    setEggStats((current) => {
      isNewEgg = !current.foundKeys.includes(key);

      return {
        totalClicks: current.totalClicks + 1,
        foundKeys: isNewEgg ? [...current.foundKeys, key] : current.foundKeys
      };
    });

    if (isNewEgg) {
      setFireworkToken((current) => current + 1);
    }
  }

  const foundEggCount = eggStats.foundKeys.length;
  const showEggPanel = eggStats.totalClicks > 0 && !eggPanelDismissed;
  const eggEncouragementByCount = [
    '开局就很稳，继续冲！',
    '手气不错，再挖一个！',
    '已经有感觉了，继续点点看！',
    '找到一半了，今天状态很在线！',
    '只剩两个，胜利在望！',
    '最后一个，马上集齐！'
  ];
  const eggBadgeText = foundEggCount >= EGG_IDS.length
    ? '已集齐，太厉害了！'
    : eggEncouragementByCount[Math.max(0, foundEggCount - 1)];
  const isGrandEggCelebration = foundEggCount === EGG_IDS.length;
  const fireworkParticleCount = isGrandEggCelebration ? 14 : 8;
  const activeCoffee = coffeeBrands.find((item) => item.key === selectedCoffeeKey) ?? coffeeBrands[0];

  return (
    <section className="niuma-home__hero-card">
      <div className="niuma-home__hero-copy">
        <div className="niuma-home__hero-1920-strip" role="group" aria-label="开工状态快捷操作">
          <span className="niuma-home__hero-1920-dot" aria-hidden="true" />
          <strong>今日节奏：轻松高效</strong>
          <button
            type="button"
            onClick={triggerCowEgg}
          >
            打气一下
          </button>
          <button
            type="button"
            onClick={triggerCoffeeEgg}
          >
            来杯咖啡
          </button>
        </div>
        {showEggPanel ? (
          <div className="niuma-home__egg-panel" role="status" aria-live="polite">
            {fireworkToken ? (
              <span
                className={`niuma-home__egg-panel-fireworks ${isGrandEggCelebration ? 'is-grand' : ''}`}
                aria-hidden="true"
                key={fireworkToken}
              >
                {Array.from({ length: fireworkParticleCount }, (_, index) => (
                  <i key={`${fireworkToken}-${index}`} />
                ))}
              </span>
            ) : null}
            <span className="niuma-home__egg-panel-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M12 2.8 14.6 8l5.7.8-4.1 4 1 5.7-5.2-2.7-5.2 2.7 1-5.7-4.1-4 5.7-.8L12 2.8Z" />
              </svg>
            </span>
            <div className="niuma-home__egg-panel-copy">
              <strong>彩蛋 {foundEggCount}/{EGG_IDS.length}</strong>
              <span>{eggStats.totalClicks} 次 · {eggBadgeText}</span>
            </div>
            <button
              aria-label="关闭彩蛋提示"
              className="niuma-home__egg-panel-close"
              type="button"
              onClick={() => {
                setEggPanelDismissed(true);
                setEggStats({ totalClicks: 0, foundKeys: [] });
                setFireworkToken(0);
              }}
            >
              <X aria-hidden="true" size={15} />
            </button>
          </div>
        ) : null}
        <p className="niuma-home__hero-greeting">
          <span>Hi，打工人</span>
          <span className="niuma-home__inline-egg-wrap">
            {egg === 'hand' ? (
              <span className="niuma-home__inline-egg-note niuma-home__inline-egg-note--hand" role="status" aria-live="polite">
                {handLine}
              </span>
            ) : null}
            <button
              aria-label="给打工人击掌"
              className="niuma-home__hero-greeting-egg"
              title="赛博击掌"
              type="button"
              onClick={triggerHandEgg}
            >
              🖐🏻
            </button>
          </span>
        </p>
        <h1>
          欢迎来到
          {' '}
          <span className="niuma-home__inline-egg-wrap niuma-home__inline-egg-wrap--title">
            {egg === 'title' ? (
              <span className="niuma-home__inline-egg-note niuma-home__inline-egg-note--title" role="status" aria-live="polite">
                {titleLine}
              </span>
            ) : null}
            <button
              className="niuma-home__hero-title-egg"
              title="点一下牛马"
              type="button"
              onClick={triggerTitleEgg}
            >
              <span className="niuma-home__hero-title-word">牛马</span>
            </button>
          </span>
          {' '}
          百宝箱
        </h1>
        <p className="niuma-home__hero-description">
          轻松搞定图片、文档、转换处理等各种工作难题，
          <span className="niuma-home__hero-description-highlight">
            工作再忙，也要记得摸鱼哦～
            <svg
              aria-hidden="true"
              className="niuma-home__hero-description-underline"
              preserveAspectRatio="none"
              viewBox="0 0 360 42"
            >
              <path
                className="niuma-home__hero-description-underline-main"
                d="M7 24c21 7 45-5 68-3 19 1 37 7 57 5 19-2 36-5 55-2 21 3 41 5 62 4 23-1 45-2 67 0 14 1 25 3 37 2"
              />
            </svg>
          </span>
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
            <defs>
              <clipPath id={bubbleClipId}>
                <rect ref={bubbleRevealRectRef} />
              </clipPath>
            </defs>
            <g className="niuma-home__hero-sparkles">
              <path
                d="M1127 182c18 0 27 14 30 30 3-16 12-30 30-30-18 0-27-14-30-30-3 16-12 30-30 30Z"
                fill="#FFD77A"
                transform="translate(-26 0)"
              />
              <path
                d="M1018 536c14 0 21 11 23 23 2-12 9-23 23-23-14 0-21-11-23-23-2 12-9 23-23 23Z"
                fill="#FFC96B"
              />
            </g>

            <g
              clipPath={`url(#${bubbleClipId})`}
              ref={bubbleMotionGroupRef}
              transform="translate(1238 218) rotate(8)"
            >
              <g ref={bubbleTextGroupRef}>
                <text
                  className="niuma-home__hero-overlay-text niuma-home__hero-overlay-text--bubble"
                  textAnchor="middle"
                >
                  <tspan x="0" y="0">今天也要</tspan>
                  <tspan x="0" dy="76">轻松开工!</tspan>
                  <tspan className="niuma-home__hero-overlay-heart" dx="16" dy="0">❤</tspan>
                </text>
              </g>
            </g>

            <g transform="translate(860 667) rotate(4)">
              <text className="niuma-home__hero-overlay-text niuma-home__hero-overlay-text--mug" textAnchor="middle">
                摸鱼中
              </text>
            </g>
          </svg>

          <button
            aria-label="点击盆栽"
            className="niuma-hero-egg niuma-hero-egg--plant"
            title="点盆栽"
            type="button"
            onClick={triggerPlantEgg}
          />
          <button
            aria-label="点击小牛"
            className="niuma-hero-egg niuma-hero-egg--cow"
            title="点小牛"
            type="button"
            onClick={triggerCowEgg}
          />
          <button
            aria-label="点击电脑贴纸"
            className="niuma-hero-egg niuma-hero-egg--laptop"
            title="点电脑"
            type="button"
            onClick={triggerLaptopEgg}
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
            <>
              <span className="niuma-hero-coffee__fx" aria-hidden="true" key={coffeeFxToken}>
                <span className="niuma-hero-coffee__glow" />
                <span className="niuma-hero-coffee__ripples">
                  <i />
                  <i />
                </span>
                <span className="niuma-hero-coffee__steam">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="niuma-hero-coffee__sparkles">
                  <i />
                  <i />
                  <i />
                </span>
                <b className="niuma-hero-coffee__score">续命 +1</b>
              </span>

              <div
                className="niuma-hero-coffee__panel"
                style={{
                  '--coffee-accent': activeCoffee.accent,
                  '--coffee-glow': activeCoffee.glow
                }}
              >
                <div className="niuma-hero-coffee__panel-head">
                  <strong>今天喝一杯</strong>
                  <span>{coffeeDrink}</span>
                </div>

                <div className="niuma-hero-coffee__brands" role="list" aria-label="咖啡品牌">
                  {coffeeBrands.map((brand) => (
                    <button
                      key={brand.key}
                      aria-label={`切换到${brand.name}`}
                      className={`niuma-hero-coffee__brand ${brand.key === activeCoffee.key ? 'is-active' : ''}`}
                      style={{ '--coffee-brand-accent': brand.accent }}
                      type="button"
                      onClick={() => handleCoffeeBrandPick(brand.key)}
                    >
                      <img alt={`${brand.name} logo`} src={brand.logo} />
                    </button>
                  ))}
                </div>

                <div className="niuma-hero-coffee__copy">
                  <div className="niuma-hero-coffee__brandline">
                    <strong>{activeCoffee.name}</strong>
                    <span>{coffeeDrink}</span>
                  </div>
                  <p>{coffeeLine}</p>
                </div>
              </div>
            </>
          ) : null}

          {egg === 'plant' ? (
            <>
              <span className="niuma-hero-egg__plant-burst" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="niuma-hero-egg__plant-note">{plantLine}</span>
            </>
          ) : null}

          {egg === 'laptop' ? (
            <>
              <span className="niuma-hero-egg__laptop-glow" aria-hidden="true" />
              <span className="niuma-hero-egg__laptop-note">{laptopLine}</span>
            </>
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
