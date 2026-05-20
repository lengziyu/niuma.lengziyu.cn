import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ToolCard from '../components/ToolCard';
import { getHomeToolCatalog, headerNavItems } from '../data/home';

export default function FavoritesPage({ theme, setTheme }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = window.localStorage.getItem('niuma-home-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allTools = useMemo(() => getHomeToolCatalog(), []);
  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const favoriteTools = useMemo(
    () => allTools.filter((tool) => favoriteSet.has(tool.id)),
    [allTools, favoriteSet]
  );

  useEffect(() => {
    window.localStorage.setItem('niuma-home-favorites', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  useEffect(() => {
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  function toggleFavorite(toolId) {
    setFavoriteIds((current) => current.filter((id) => id !== toolId));
  }

  return (
    <div className="page page--niuma-home">
      <div className="niuma-home">
        <div className="niuma-home__bg niuma-home__bg--one" />
        <div className="niuma-home__bg niuma-home__bg--two" />

        <div className="niuma-home__shell">
          <Header
            activeKey="favorites"
            navItems={headerNavItems}
            setTheme={setTheme}
            theme={theme}
          />

          <main className="niuma-catalog-main">
            <section className="niuma-home__section">
              <div className="niuma-home__section-head">
                <div className="niuma-home__tabs" role="tablist" aria-label="收藏列表">
                  <button aria-selected className="is-active" role="tab" type="button">
                    我的收藏
                  </button>
                </div>
                <div className="niuma-home__section-meta">
                  <span>共 {favoriteTools.length} 个收藏</span>
                </div>
              </div>

              <div className="niuma-home__tool-grid">
                {favoriteTools.length ? (
                  favoriteTools.map((tool) => (
                    <ToolCard
                      isFavorite
                      key={tool.id}
                      tool={tool}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))
                ) : (
                  <div className="niuma-home__empty-state">
                    <strong>还没有收藏工具</strong>
                    <p>去工具页点一下星标，收藏的工具会出现在这里。</p>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
