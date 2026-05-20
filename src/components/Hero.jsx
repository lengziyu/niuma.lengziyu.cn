import { Search } from 'lucide-react';

export default function Hero({
  searchQuery,
  onSearchChange,
  onSearchSubmit
}) {
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
        <div className="niuma-home__hero-figure">
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
        </div>
      </div>
    </section>
  );
}
