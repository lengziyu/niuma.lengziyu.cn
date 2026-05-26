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

const hiddenTools = [
  '图片转文字：截图内容一键提取',
  'PDF拆分：需要哪几页就发哪几页',
  '文本去重：名单整理更快',
  '时间戳转换：查日志更省心'
];

const EGG_IDS = ['plant', 'cow', 'laptop', 'coffee', 'box'];

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
      plant: 2200,
      laptop: 2400
    };
    const timer = window.setTimeout(() => setEgg(null), durations[egg] ?? 1600);

    return () => window.clearTimeout(timer);
  }, [egg]);

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

  function triggerCoffeeEgg() {
    registerEggClick('coffee');
    setEgg('coffee');
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
  const remainingEggCount = Math.max(0, EGG_IDS.length - foundEggCount);
  const showEggPanel = eggStats.totalClicks > 0 && !eggPanelDismissed;
  const eggBadgeText = remainingEggCount > 0 ? `再找 ${remainingEggCount}` : '已集齐';
  const isGrandEggCelebration = foundEggCount === EGG_IDS.length;
  const fireworkParticleCount = isGrandEggCelebration ? 14 : 8;

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
            <span className="niuma-hero-egg__bubbles" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
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
