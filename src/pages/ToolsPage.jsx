import { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header';
import ToolCard from '../components/ToolCard';
import { getHomeToolCatalog, headerNavItems } from '../data/home';

export default function ToolsPage({ theme, setTheme }) {
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = window.localStorage.getItem('niuma-home-favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const allTools = useMemo(() => getHomeToolCatalog(), []);

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
    setFavoriteIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]
    );
  }

  return (
    <div className="page page--niuma-home">
      <div className="niuma-home">
        <div className="niuma-home__bg niuma-home__bg--one" />
        <div className="niuma-home__bg niuma-home__bg--two" />

        <div className="niuma-home__shell">
          <Header
            activeKey="all"
            navItems={headerNavItems}
            setTheme={setTheme}
            theme={theme}
          />

          <main className="niuma-catalog-main">
            <section className="niuma-home__section">
              <div className="niuma-home__section-head">
                <div className="niuma-home__tabs" role="tablist" aria-label="工具列表">
                  <button aria-selected className="is-active" role="tab" type="button">
                    全部工具
                  </button>
                </div>
                <div className="niuma-home__section-meta">
                  <span>共 {allTools.length} 个工具</span>
                </div>
              </div>

              <div className="niuma-home__tool-grid">
                {allTools.map((tool) => (
                  <ToolCard
                    isFavorite={favoriteSet.has(tool.id)}
                    key={tool.id}
                    tool={tool}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
