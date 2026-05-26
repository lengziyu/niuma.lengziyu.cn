import { useMemo } from 'react';
import ToolCard from '../components/ToolCard';
import { getHomeToolCatalog } from '../data/home';
import useFavoriteIds from '../hooks/useFavoriteIds';

export default function FavoritesPage() {
  const { favoriteSet, setFavoriteIds } = useFavoriteIds();
  const allTools = useMemo(() => getHomeToolCatalog(), []);
  const favoriteTools = useMemo(
    () => allTools.filter((tool) => favoriteSet.has(tool.id)),
    [allTools, favoriteSet]
  );

  function toggleFavorite(toolId) {
    setFavoriteIds((current) => current.filter((id) => id !== toolId));
  }

  return (
    <div className="page page--niuma-subpage">
      <div className="niuma-subpage">
        <main className="niuma-subpage__body">
          <div className="niuma-home__tool-grid niuma-home__tool-grid--full">
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
        </main>
      </div>
    </div>
  );
}
