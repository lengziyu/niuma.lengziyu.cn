import { useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import ToolCard from '../components/ToolCard';
import { getHomeToolCatalog, headerNavItems, matchesToolSearch } from '../data/home';
import useFavoriteIds from '../hooks/useFavoriteIds';

export default function ToolsPage({ theme, setTheme }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchInputRef = useRef(null);
  const searchWrapRef = useRef(null);
  const { favoriteSet, setFavoriteIds } = useFavoriteIds();
  const allTools = useMemo(() => getHomeToolCatalog(), []);
  const searchKeyword = searchParams.get('q')?.trim() ?? '';
  const [toolSearch, setToolSearch] = useState(searchKeyword);
  const [searchOpen, setSearchOpen] = useState(Boolean(searchKeyword));
  const visibleTools = useMemo(
    () => allTools.filter((tool) => matchesToolSearch(tool, searchKeyword)),
    [allTools, searchKeyword]
  );

  useEffect(() => {
    setToolSearch(searchKeyword);
    setSearchOpen(Boolean(searchKeyword));
  }, [searchKeyword]);

  function toggleFavorite(toolId) {
    setFavoriteIds((current) =>
      current.includes(toolId)
        ? current.filter((id) => id !== toolId)
        : [...current, toolId]
    );
  }

  function openSearch() {
    setSearchOpen(true);
    window.setTimeout(() => searchInputRef.current?.focus(), 0);
  }

  function closeSearch() {
    if (toolSearch.trim()) {
      return;
    }
    setSearchOpen(false);
  }

  function applySearch() {
    const keyword = toolSearch.trim();
    setSearchParams(keyword ? { q: keyword } : {});
    if (!keyword) {
      setSearchOpen(false);
    }
  }

  function submitToolSearch(event) {
    event.preventDefault();
    applySearch();
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

        <div className="niuma-subpage__search-anchor">
          <form
            ref={searchWrapRef}
            className={`niuma-tools-search ${searchOpen ? 'is-open' : ''}`}
            role="search"
            onMouseEnter={() => setSearchOpen(true)}
            onMouseLeave={closeSearch}
            onSubmit={submitToolSearch}
          >
            <button
              aria-label="搜索工具"
              className="niuma-tools-search__icon"
              type="button"
              onClick={() => {
                if (!searchOpen) {
                  openSearch();
                  return;
                }
                applySearch();
              }}
            >
              <Search aria-hidden="true" size={18} />
            </button>
            <input
              ref={searchInputRef}
              placeholder="搜索工具"
              type="search"
              value={toolSearch}
              onBlur={(event) => {
                if (!searchWrapRef.current?.contains(event.relatedTarget)) {
                  closeSearch();
                }
              }}
              onChange={(event) => setToolSearch(event.target.value)}
              onFocus={() => setSearchOpen(true)}
            />
          </form>
        </div>

        <main className="niuma-subpage__body">
          {searchKeyword ? (
            <div className="niuma-home__section-meta" style={{ marginBottom: 10 }}>
              <span>搜索：{searchKeyword}</span>
              <span>结果：{visibleTools.length} 个工具</span>
            </div>
          ) : null}
          <div className="niuma-home__tool-grid niuma-home__tool-grid--full">
            {visibleTools.length ? (
              visibleTools.map((tool) => (
                <ToolCard
                  isFavorite={favoriteSet.has(tool.id)}
                  key={tool.id}
                  tool={tool}
                  onToggleFavorite={toggleFavorite}
                />
              ))
            ) : (
              <div className="niuma-home__empty-state">
                <strong>没有找到匹配工具</strong>
                <p>试试换个关键词，比如“PDF”“图片”“二维码”。</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
