import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import FavoritesPage from './pages/FavoritesPage';
import HomePage from './pages/HomePage';
import HomePage1920 from './pages/HomePage1920';
import ToolPage from './pages/ToolPage';
import ToolsPage from './pages/ToolsPage';

function PageTransition({ children }) {
  const location = useLocation();

  return (
    <main className="page-transition" key={location.pathname}>
      {children}
    </main>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = window.localStorage.getItem('niuma-theme');

    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    window.localStorage.setItem('niuma-theme', theme);
  }, [theme]);

  return (
    <PageTransition>
      <Routes>
        <Route
          path="/"
          element={<HomePage theme={theme} setTheme={setTheme} />}
        />
        <Route
          path="/home-1920"
          element={<HomePage1920 theme={theme} setTheme={setTheme} />}
        />
        <Route
          path="/tools"
          element={<ToolsPage theme={theme} setTheme={setTheme} />}
        />
        <Route
          path="/favorites"
          element={<FavoritesPage theme={theme} setTheme={setTheme} />}
        />
        <Route
          path="/tools/:toolId"
          element={<ToolPage theme={theme} setTheme={setTheme} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageTransition>
  );
}
