import { useMemo } from 'react';
import ToolCard from '../components/ToolCard';
import { getHomeToolCatalog } from '../data/home';
import useFavoriteIds from '../hooks/useFavoriteIds';

const FAVORITES_PAGE_COPY = {
  zh: {
    emptyTitle: '还没有收藏工具',
    emptyHint: '去工具页点一下星标，收藏的工具会出现在这里。'
  },
  en: {
    emptyTitle: 'No favorite tools yet',
    emptyHint: 'Click the star on a tool card and your favorites will show up here.'
  }
};

export default function FavoritesPage({ locale = 'zh' }) {
  const copy = FAVORITES_PAGE_COPY[locale] ?? FAVORITES_PAGE_COPY.zh;
  const { favoriteSet, setFavoriteIds } = useFavoriteIds();
  const allTools = useMemo(() => getHomeToolCatalog(locale), [locale]);
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
                  locale={locale}
                  tool={tool}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="niuma-home__empty-state">
                <strong>{copy.emptyTitle}</strong>
                <p>{copy.emptyHint}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
