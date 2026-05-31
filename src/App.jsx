import { useCallback, useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { getHeaderNavItems } from './data/home';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import ToolPage from './pages/ToolPage';
import ToolsPage from './pages/ToolsPage';
import BossMode from './components/BossMode';
import {
  LOCALE_STORAGE_KEY,
  readStoredLocale
} from './i18n/locale';
import './styles/boss.css';

const APP_COPY = {
  zh: {
    bossTitle: '企业智能工作台 - 数据中心',
    normalTitle: '牛马百宝箱 | 打工人工具箱',
    bossExitTitle: '退出奋斗模式 (Ctrl+B)',
    bossExitText: '退出'
  },
  en: {
    bossTitle: 'Enterprise Intelligence Console - Data Center',
    normalTitle: 'Niuma Toolbox | Productivity Toolkit',
    bossExitTitle: 'Exit focus mode (Ctrl+B)',
    bossExitText: 'Exit'
  }
};

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
  const [locale, setLocale] = useState(() => readStoredLocale());
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('niuma-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const [bossMode, setBossMode] = useState(() => {
    return window.localStorage.getItem('niuma-boss-mode') === 'true';
  });

  const [bossExiting, setBossExiting] = useState(false);
  const copy = APP_COPY[locale] ?? APP_COPY.zh;
  const headerNavItems = getHeaderNavItems(locale);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('niuma-theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute('lang', locale === 'en' ? 'en' : 'zh-CN');
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }, [locale]);

  useEffect(() => {
    window.localStorage.setItem('niuma-boss-mode', String(bossMode));
    document.title = bossMode ? copy.bossTitle : copy.normalTitle;
  }, [bossMode, copy]);

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
            title={copy.bossExitTitle}
            onClick={toggleBossMode}
          >
            {copy.bossExitText}
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
                locale={locale}
                setLocale={setLocale}
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
              element={<HomePage locale={locale} onToggleBossMode={toggleBossMode} />}
            />
            <Route
              path="/tools"
              element={<ToolsPage locale={locale} />}
            />
            <Route
              path="/favorites"
              element={<FavoritesPage locale={locale} />}
            />
            <Route
              path="/tools/:toolId"
              element={<ToolPage locale={locale} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </div>
    </>
  );
}
