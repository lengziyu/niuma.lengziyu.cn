import { useEffect, useRef, useState } from 'react';
import { animate } from 'animejs';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import { headerNavItems } from './data/home';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import HomePage1920 from './pages/HomePage1920';
import ToolPage from './pages/ToolPage';
import ToolsPage from './pages/ToolsPage';

function PageTransition({ children, isHomeRoute }) {
  const location = useLocation();
  const pageRef = useRef(null);

  useEffect(() => {
    const pageRoot = pageRef.current;

    if (!pageRoot || typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      return undefined;
    }

    const pageSurface = pageRoot.firstElementChild;
    const surfaceBlur = isHomeRoute ? 10 : 12;
    const nodeBlur = isHomeRoute ? 14 : 18;

    if (!pageSurface) {
      return undefined;
    }

    const stagedNodes = Array.from(
      pageSurface.querySelectorAll(
        [
          '.niuma-home__layout > *',
          '.niuma-home__section > *',
          '.niuma-side-widgets > *',
          '.niuma-subpage__search-anchor',
          '.niuma-subpage__body > *',
          '.tool-detail-header',
          '.tool-detail-stage'
        ].join(', ')
      )
    );

    const entranceAnimations = [
      animate(pageSurface, {
        opacity: [0, 1],
        translateY: [14, 0],
        scale: [0.988, 1],
        filter: [`blur(${surfaceBlur}px)`, 'blur(0px)'],
        duration: isHomeRoute ? 420 : 380,
        ease: 'out(4)',
        onBegin: () => {
          pageSurface.style.willChange = 'transform, opacity, filter';
        },
        onComplete: () => {
          pageSurface.style.willChange = '';
          pageSurface.style.opacity = '1';
          pageSurface.style.transform = '';
          pageSurface.style.filter = '';
        }
      })
    ];

    if (stagedNodes.length) {
      stagedNodes.forEach((node) => {
        node.style.transformOrigin = '50% 50%';
        node.style.willChange = 'transform, opacity, filter';
      });

      entranceAnimations.push(
        animate(stagedNodes, {
          opacity: [0, 1],
          translateY: [16, 0],
          scale: [0.976, 1],
          filter: [`blur(${nodeBlur}px)`, 'blur(0px)'],
          delay: (_, index) => index * 14,
          duration: isHomeRoute ? 400 : 360,
          ease: 'out(4)',
          onComplete: () => {
            stagedNodes.forEach((node) => {
              node.style.willChange = '';
              node.style.opacity = '1';
              node.style.transform = '';
              node.style.filter = '';
            });
          }
        })
      );
    }

    return () => {
      entranceAnimations.forEach((animation) => animation.cancel?.());
    };
  }, [isHomeRoute, location.pathname]);

  return (
    <main className={`page-transition ${isHomeRoute ? 'is-home-route' : ''}`} ref={pageRef}>
      {children}
    </main>
  );
}

function GlobalHeader({ setTheme, theme }) {
  const location = useLocation();
  const pathname = location.pathname;
  const isHomeRoute = pathname === '/' || pathname === '/home-1920';
  const activeKey =
    pathname === '/favorites'
      ? 'favorites'
      : pathname.startsWith('/tools')
        ? 'all'
        : 'home';

  function handleNavClick(key) {
    if (key === 'home' && isHomeRoute) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <div
      className={`app-global-header ${isHomeRoute ? 'is-home' : 'is-subpage'} ${
        pathname === '/home-1920' ? 'is-home-1920' : ''
      }`}
    >
      <div className="app-global-header__inner">
        <Header
          activeKey={activeKey}
          hidesBrand={!isHomeRoute}
          navItems={headerNavItems}
          setTheme={setTheme}
          theme={theme}
          onNavClick={handleNavClick}
        />
      </div>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('niuma-theme');

    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('niuma-theme', theme);
  }, [theme]);

  const isHomeRoute = location.pathname === '/' || location.pathname === '/home-1920';

  return (
    <>
      <GlobalHeader setTheme={setTheme} theme={theme} />
      <PageTransition isHomeRoute={isHomeRoute}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/home-1920" element={<HomePage1920 />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route path="/tools/:toolId" element={<ToolPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PageTransition>
    </>
  );
}
