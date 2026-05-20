import { Link, NavLink } from 'react-router-dom';
import {
  FavoriteNavIcon,
  HomeNavIcon,
  ToolsNavIcon
} from './icons/AppIcons';
import ThemeToggle from './ThemeToggle';

export default function Header({
  activeKey,
  theme,
  setTheme,
  navItems,
  onNavClick,
  hidesBrand
}) {
  const iconMap = {
    home: HomeNavIcon,
    all: ToolsNavIcon,
    favorites: FavoriteNavIcon
  };

  return (
    <header className={`niuma-home__header ${hidesBrand ? 'niuma-home__header--centered' : ''}`}>
      <div className="niuma-home__brand-slot">
        {!hidesBrand && (
          <Link className="niuma-home__brand" to="/">
            <img alt="牛马百宝箱 Logo" src="/images/avatar-cow.png" />
            <span>牛马百宝箱</span>
          </Link>
        )}
      </div>

      <div className="niuma-home__header-controls">
        <nav aria-label="主导航" className="niuma-home__nav">
          {navItems.map((item) => {
            const Icon = iconMap[item.key] ?? ToolsNavIcon;
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
                <Icon />
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
