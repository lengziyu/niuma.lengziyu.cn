import { Grid2x2, Heart, House } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export default function Header({
  activeKey,
  theme,
  setTheme,
  navItems,
  onNavClick
}) {
  const iconMap = {
    home: House,
    all: Grid2x2,
    favorites: Heart
  };

  return (
    <header className="niuma-home__header">
      <Link className="niuma-home__brand" to="/">
        <img alt="牛马百宝箱 Logo" src="/images/avatar-cow.png" />
        <span>牛马百宝箱</span>
      </Link>

      <div className="niuma-home__header-controls">
        <nav aria-label="主导航" className="niuma-home__nav">
          {navItems.map((item) => {
            const Icon = iconMap[item.key] ?? Grid2x2;
            const to = item.path ?? '/';

            return (
              <NavLink
                className={({ isActive }) =>
                  item.key === activeKey || isActive ? 'is-active' : ''
                }
                key={item.key}
                to={to}
                onClick={() => onNavClick?.(item.key)}
              >
                <Icon aria-hidden="true" size={24} strokeWidth={2.1} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="niuma-home__header-actions">
          <ThemeToggle
            className="niuma-home__theme-btn"
            setTheme={setTheme}
            theme={theme}
          />
        </div>
      </div>
    </header>
  );
}
