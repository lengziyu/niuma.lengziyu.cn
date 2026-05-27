import {
  useEffect,
  useMemo,
  useState
} from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import FeatureBadgeIcon from '../components/FeatureBadgeIcon';
import Hero from '../components/Hero';
import SideWidgets from '../components/SideWidgets';
import ToolCard from '../components/ToolCard';
import useFavoriteIds from '../hooks/useFavoriteIds';
import {
  featureItems,
  getHomeToolCatalog,
  heroHotTags
} from '../data/home';
import { createOfficeFortune, homeQuotes } from '../data/quotes';

function pickAnotherIndex(length, currentIndex) {
  if (length <= 1) {
    return currentIndex;
  }

  let nextIndex = currentIndex;

  while (nextIndex === currentIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
}

export default function HomePage({ onToggleBossMode }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fortune, setFortune] = useState(() => createOfficeFortune());
  const [quoteCollapsed, setQuoteCollapsed] = useState(false);
  const [relaxOpen, setRelaxOpen] = useState(false);
  const [relaxCountdown, setRelaxCountdown] = useState(10);
  const { favoriteSet, setFavoriteIds } = useFavoriteIds();

  const catalog = useMemo(() => getHomeToolCatalog(), []);

  const visibleTools = useMemo(() => {
    let list =
      activeTab === 'recommended'
        ? catalog
            .filter((tool) => tool.isRecommended)
            .sort((a, b) => a.recommendedOrder - b.recommendedOrder)
        : catalog;

    if (favoritesOnly) {
      list = list.filter((tool) => favoriteSet.has(tool.id));
    }

    return list;
  }, [activeTab, catalog, favoriteSet, favoritesOnly]);
  const homeTools = visibleTools.slice(0, 4);

  useEffect(() => {
    if (!relaxOpen || relaxCountdown <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRelaxCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [relaxCountdown, relaxOpen]);

  useEffect(() => {
    if (!relaxOpen) {
      return undefined;
    }

    function handleKeydown(event) {
      if (event.key === 'Escape') {
        setRelaxOpen(false);
      }
    }

    window.addEventListener('keydown', handleKeydown);

    return () => window.removeEventListener('keydown', handleKeydown);
  }, [relaxOpen]);

  function toggleFavorite(toolId) {
    setFavoriteIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]
    );
  }

  function handleSearchSubmit() {
    const keyword = searchQuery.trim();
    navigate(keyword ? `/tools?q=${encodeURIComponent(keyword)}` : '/tools');
  }

  function handleHotSearch(keyword) {
    setSearchQuery(keyword);
    navigate(`/tools?q=${encodeURIComponent(keyword)}`);
  }

  function openRelaxModal() {
    setRelaxCountdown(10);
    setRelaxOpen(true);
  }

  function handleCornerAction(action) {
    if (action === 'relax') {
      openRelaxModal();
      return;
    }

    if (action === 'encourage') {
      setQuoteIndex((current) => pickAnotherIndex(homeQuotes.length, current));
      return;
    }

    setFortune((current) => createOfficeFortune(current));
  }

  const relaxModal =
    relaxOpen && typeof document !== 'undefined'
      ? createPortal(
          <div
            aria-modal="true"
            className="niuma-home__modal"
            role="dialog"
            onClick={() => setRelaxOpen(false)}
          >
            <div className="niuma-home__modal-card" onClick={(event) => event.stopPropagation()}>
              <button
                aria-label="关闭弹窗"
                className="niuma-home__modal-close"
                type="button"
                onClick={() => setRelaxOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
              <div className="niuma-home__breath-ring">
                <span>{relaxCountdown > 0 ? relaxCountdown : '好啦'}</span>
              </div>
              <h3>10 秒放松时间</h3>
              <p>
                {relaxCountdown > 0
                  ? '跟着节奏深呼吸，肩膀放松一点，眼睛离开屏幕一小会儿。'
                  : '休息完成，继续轻松开工吧。'}
              </p>
              <button
                className="niuma-home__primary-pill"
                type="button"
                onClick={() => setRelaxOpen(false)}
              >
                {relaxCountdown > 0 ? '提前结束' : '返回首页'}
              </button>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <div className="page page--niuma-home">
      <div className="niuma-home">
        <div className="niuma-home__bg niuma-home__bg--one" />
        <div className="niuma-home__bg niuma-home__bg--two" />

        <div className="niuma-home__shell">
          <main className="niuma-home__layout">
            <div className="niuma-home__primary">
              <Hero
                hotTags={heroHotTags}
                onHotSearch={handleHotSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
              />

              <section className="niuma-home__section">
                <div className="niuma-home__tools-module">
                  <div className="niuma-home__section-head">
                    <div className="niuma-home__tabs" role="tablist" aria-label="工具分类">
                      <button
                        aria-selected={activeTab === 'recommended'}
                        className={activeTab === 'recommended' ? 'is-active' : ''}
                        role="tab"
                        type="button"
                        onClick={() => {
                          setActiveTab('recommended');
                          setFavoritesOnly(false);
                        }}
                      >
                        最热
                      </button>
                      <button
                        aria-selected={activeTab === 'all'}
                        className={activeTab === 'all' ? 'is-active' : ''}
                        role="tab"
                        type="button"
                        onClick={() => {
                          setActiveTab('all');
                          setFavoritesOnly(false);
                        }}
                      >
                        最新
                      </button>
                    </div>

                    <div className="niuma-home__section-meta">
                      {favoritesOnly ? <span>当前显示：我的收藏</span> : null}
                      <button
                        className="niuma-home__meta-link"
                        type="button"
                        onClick={() => navigate('/tools')}
                      >
                        更多工具
                      </button>
                    </div>
                  </div>

                  <div className="niuma-home__tool-grid">
                    {homeTools.length ? (
                      homeTools.map((tool) => (
                        <ToolCard
                          isFavorite={favoriteSet.has(tool.id)}
                          key={tool.id}
                          tool={tool}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))
                    ) : (
                      <div className="niuma-home__empty-state">
                        <strong>暂时没有匹配的工具</strong>
                        <p>换个关键词试试，比如“PDF”“图片”“二维码”。</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="niuma-home__features-module">
                  <div className="niuma-home__features">
                    {featureItems.map((item) => {
                      return (
                        <article
                          className={`niuma-home__feature niuma-home__feature--${item.icon}`}
                          key={item.title}
                        >
                          <span className="niuma-home__feature-icon">
                            <FeatureBadgeIcon icon={item.icon} />
                          </span>
                          <div className="niuma-home__feature-copy">
                            <h3>{item.title}</h3>
                            <p>{item.description}</p>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            </div>

            <aside className="niuma-home__sidebar">
              <SideWidgets
                collapsed={quoteCollapsed}
                fortune={fortune}
                quote={homeQuotes[quoteIndex]}
                onAction={handleCornerAction}
                onNextFortune={() => setFortune((current) => createOfficeFortune(current))}
                onNextQuote={() =>
                  setQuoteIndex((current) => pickAnotherIndex(homeQuotes.length, current))
                }
                onToggleBossMode={onToggleBossMode}
                onToggleCollapsed={() => setQuoteCollapsed((current) => !current)}
              />
            </aside>
          </main>
        </div>

        {relaxModal}
      </div>
    </div>
  );
}
