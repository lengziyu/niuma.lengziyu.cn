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

  function toggleFavorite(toolId) {
    setFavoriteIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]
    );
  }

  return (
    <div className="page page--niuma-subpage">
      <div className="niuma-subpage">
        <header className="niuma-subpage__header">
          <Header
            activeKey="all"
            navItems={headerNavItems}
            setTheme={setTheme}
            theme={theme}
            hidesBrand
          />
        </header>

        <main className="niuma-subpage__body">
          <div className="niuma-home__tool-grid niuma-home__tool-grid--full">
            {allTools.map((tool) => (
              <ToolCard
                isFavorite={favoriteSet.has(tool.id)}
                key={tool.id}
                tool={tool}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
