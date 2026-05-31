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
  getCornerActions,
  getFeatureItems,
  getHeroHotTags,
  getHomeToolCatalog
} from '../data/home';
import { createOfficeFortune, getHomeQuotes } from '../data/quotes';

const HOME_COPY = {
  zh: {
    closeModal: '关闭弹窗',
    relaxDone: '好啦',
    relaxTitle: '10 秒放松时间',
    relaxProgress: '跟着节奏深呼吸，肩膀放松一点，眼睛离开屏幕一小会儿。',
    relaxFinished: '休息完成，继续轻松开工吧。',
    relaxEndEarly: '提前结束',
    relaxBackHome: '返回首页',
    tabsAriaLabel: '工具分类',
    hotTab: '最热',
    latestTab: '最新',
    favoritesOnly: '当前显示：我的收藏',
    moreTools: '更多工具',
    noMatchedTools: '暂时没有匹配的工具',
    noMatchedToolsHint: '换个关键词试试，比如“PDF”“图片”“二维码”。'
  },
  en: {
    closeModal: 'Close modal',
    relaxDone: 'Done',
    relaxTitle: '10-Second Break',
    relaxProgress: 'Breathe slowly, relax your shoulders, and look away from the screen for a moment.',
    relaxFinished: 'Break complete. Let us get back to work with ease.',
    relaxEndEarly: 'End Now',
    relaxBackHome: 'Back to Home',
    tabsAriaLabel: 'Tool categories',
    hotTab: 'Hot',
    latestTab: 'Latest',
    favoritesOnly: 'Showing: Favorites',
    moreTools: 'More Tools',
    noMatchedTools: 'No matching tools yet',
    noMatchedToolsHint: 'Try another keyword, like “PDF”, “image”, or “QR code”.'
  }
};

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

export default function HomePage({ locale = 'zh', onToggleBossMode }) {
  const navigate = useNavigate();
  const copy = HOME_COPY[locale] ?? HOME_COPY.zh;
  const [activeTab, setActiveTab] = useState('recommended');
  const [searchQuery, setSearchQuery] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fortune, setFortune] = useState(() => createOfficeFortune(locale));
  const [quoteCollapsed, setQuoteCollapsed] = useState(false);
  const [relaxOpen, setRelaxOpen] = useState(false);
  const [relaxCountdown, setRelaxCountdown] = useState(10);
  const { favoriteSet, setFavoriteIds } = useFavoriteIds();
  const homeQuotes = useMemo(() => getHomeQuotes(locale), [locale]);
  const heroHotTags = useMemo(() => getHeroHotTags(locale), [locale]);
  const featureItems = useMemo(() => getFeatureItems(locale), [locale]);
  const cornerActions = useMemo(() => getCornerActions(locale), [locale]);

  const catalog = useMemo(() => getHomeToolCatalog(locale), [locale]);

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
    setQuoteIndex(0);
    setFortune(createOfficeFortune(locale));
  }, [locale]);

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

    setFortune((current) => createOfficeFortune(locale, current));
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
                aria-label={copy.closeModal}
                className="niuma-home__modal-close"
                type="button"
                onClick={() => setRelaxOpen(false)}
              >
                <X aria-hidden="true" size={18} />
              </button>
              <div className="niuma-home__breath-ring">
                <span>{relaxCountdown > 0 ? relaxCountdown : copy.relaxDone}</span>
              </div>
              <h3>{copy.relaxTitle}</h3>
              <p>
                {relaxCountdown > 0
                  ? copy.relaxProgress
                  : copy.relaxFinished}
              </p>
              <button
                className="niuma-home__primary-pill"
                type="button"
                onClick={() => setRelaxOpen(false)}
              >
                {relaxCountdown > 0 ? copy.relaxEndEarly : copy.relaxBackHome}
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
                locale={locale}
                onHotSearch={handleHotSearch}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                onSearchSubmit={handleSearchSubmit}
              />

              <section className="niuma-home__section">
                <div className="niuma-home__tools-module">
                  <div className="niuma-home__section-head">
                    <div className="niuma-home__tabs" role="tablist" aria-label={copy.tabsAriaLabel}>
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
                        {copy.hotTab}
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
                        {copy.latestTab}
                      </button>
                    </div>

                    <div className="niuma-home__section-meta">
                      {favoritesOnly ? <span>{copy.favoritesOnly}</span> : null}
                      <button
                        className="niuma-home__meta-link"
                        type="button"
                        onClick={() => navigate('/tools')}
                      >
                        {copy.moreTools}
                      </button>
                    </div>
                  </div>

                  <div className="niuma-home__tool-grid">
                    {homeTools.length ? (
                      homeTools.map((tool) => (
                        <ToolCard
                          isFavorite={favoriteSet.has(tool.id)}
                          key={tool.id}
                          locale={locale}
                          tool={tool}
                          onToggleFavorite={toggleFavorite}
                        />
                      ))
                    ) : (
                      <div className="niuma-home__empty-state">
                        <strong>{copy.noMatchedTools}</strong>
                        <p>{copy.noMatchedToolsHint}</p>
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
                locale={locale}
                cornerActions={cornerActions}
                onAction={handleCornerAction}
                onNextFortune={() => setFortune((current) => createOfficeFortune(locale, current))}
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
