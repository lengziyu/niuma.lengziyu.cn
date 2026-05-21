import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const cowLines = [
  '今天也要稳稳摸鱼～',
  '文件交给工具，快乐留给自己。',
  '打工可以忙，心态要放松。'
];

const hiddenTools = [
  '图片转文字：截图里的内容一键提取',
  'PDF拆分：只取需要的几页发出去',
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

export default function Hero({
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) {
  const [egg, setEgg] = useState(null);
  const [cowLine, setCowLine] = useState(cowLines[0]);
  const [toolTip, setToolTip] = useState(hiddenTools[0]);

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
          图片、文档、转换处理小能手，帮你轻松搞定各种工作难题，工作再忙，也要记得摸鱼哦～
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
            <g transform="translate(1238 218) rotate(8)">
              <text className="niuma-home__hero-overlay-text niuma-home__hero-overlay-text--bubble" textAnchor="middle">
                <tspan x="0" y="0">今天也要</tspan>
                <tspan x="0" dy="76">加油鸭!</tspan>
                <tspan className="niuma-home__hero-overlay-heart" dx="16" dy="0">❤</tspan>
              </text>
            </g>

            <g transform="translate(860 667) rotate(4)">
              <text className="niuma-home__hero-overlay-text niuma-home__hero-overlay-text--mug" textAnchor="middle">
                摸鱼中
              </text>
            </g>
          </svg>

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
