import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { headerNavItems } from './data/home';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import ToolsPage from './pages/ToolsPage';
import BossMode from './components/BossMode';
import './styles/boss.css';

const BOSS_TITLE = '企业智能工作台 - 数据中心';
const NORMAL_TITLE = '牛马百宝箱 | 打工人工具箱';

function PageTransition({ children }) {
  const location = useLocation();

  return (
    <main className="page-transition" key={location.pathname}>
      {children}
    </main>
  );
}

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('niuma-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const [bossMode, setBossMode] = useState(() => {
    return window.localStorage.getItem('niuma-boss-mode') === 'true';
  });

  const [bossExiting, setBossExiting] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('niuma-theme', theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem('niuma-boss-mode', String(bossMode));
    document.title = bossMode ? BOSS_TITLE : NORMAL_TITLE;
  }, [bossMode]);

  const toggleBossMode = useCallback(() => {
    if (bossMode) {
      setBossExiting(true);
      setTimeout(() => {
        setBossMode(false);
        setBossExiting(false);
      }, 300);
    } else {
      setBossMode(true);
    }
  }, [bossMode]);

  // Keyboard shortcut: Ctrl+B / Cmd+B
  useEffect(() => {
    function handleKeydown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        toggleBossMode();
      }
    }
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [toggleBossMode]);

  const pathname = location.pathname;
  const isHomeRoute = pathname === '/';
  const showGlobalHeader = pathname === '/' || pathname === '/tools' || pathname === '/favorites';
  const activeKey = pathname === '/favorites' ? 'favorites' : pathname === '/tools' ? 'all' : 'home';

  return (
    <>
      {/* Boss Mode Overlay */}
      {(bossMode || bossExiting) && (
        <div className={`boss-mode-wrapper ${bossExiting ? 'is-exiting' : ''}`}>
          <BossMode />
          <button
            className="boss-exit-btn"
            type="button"
            title="退出奋斗模式 (Ctrl+B)"
            onClick={toggleBossMode}
          >
            退出
          </button>
        </div>
      )}

      {/* Normal App */}
      <div style={{ display: bossMode ? 'none' : undefined }}>
        {showGlobalHeader ? (
          <div className={`app-global-header ${isHomeRoute ? 'is-home' : 'is-subpage'}`}>
            <div className="app-global-header__inner">
              <Header
                activeKey={activeKey}
                hidesBrand={!isHomeRoute}
                navItems={headerNavItems}
                setTheme={setTheme}
                theme={theme}
              />
            </div>
          </div>
        ) : null}
        <PageTransition>
          <Routes>
            <Route
              path="/"
              element={<HomePage />}
            />
            <Route
              path="/tools"
              element={<ToolsPage />}
            />
            <Route
              path="/favorites"
              element={<FavoritesPage />}
            />
            <Route
              path="/tools/:toolId"
              element={<ToolPage />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </div>
    </>
  );
}
