import React from 'react';
import { animate } from 'animejs';
import { Link, NavLink } from 'react-router-dom';
import {
  FavoriteNavIcon,
  HomeNavIcon,
  ToolsNavIcon
} from './icons/AppIcons';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';
import useSegmentedIndicator from '../hooks/useSegmentedIndicator';

const HEADER_COPY = {
  zh: {
    brandAlt: '牛马百宝箱 Logo',
    brandName: '牛马百宝箱',
    navAria: '主导航'
  },
  en: {
    brandAlt: 'Niuma Toolbox Logo',
    brandName: 'Niuma Toolbox',
    navAria: 'Main navigation'
  }
};

export default function Header({
  activeKey,
  theme,
  setTheme,
  locale = 'zh',
  setLocale,
  navItems,
  onNavClick,
  hidesBrand
}) {
  const { segmentedRef, indicatorRef, updateIndicator } = useSegmentedIndicator();
  const hasAnimatedOnMountRef = React.useRef(false);
  const copy = HEADER_COPY[locale] ?? HEADER_COPY.zh;

  const iconMap = {
    home: HomeNavIcon,
    all: ToolsNavIcon,
    favorites: FavoriteNavIcon
  };

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [activeKey, navItems, updateIndicator]);

  React.useEffect(() => {
    const navRoot = segmentedRef.current;

    if (!navRoot || typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (mediaQuery.matches) {
      return undefined;
    }

    if (!hasAnimatedOnMountRef.current) {
      hasAnimatedOnMountRef.current = true;
      return undefined;
    }

    const activeItem = navRoot.querySelector('.is-active');
    const animations = [];

    if (activeItem) {
      animations.push(
        animate(activeItem, {
          scale: [0.985, 1],
          duration: 180,
          ease: 'out(4)'
        })
      );
    }

    return () => animations.forEach((animation) => animation.cancel?.());
  }, [activeKey, indicatorRef, segmentedRef]);

  return (
    <header className={`niuma-home__header ${hidesBrand ? 'niuma-home__header--centered' : ''}`}>
      <div className="niuma-home__brand-slot">
        {!hidesBrand && (
          <Link className="niuma-home__brand" to="/">
            <img alt={copy.brandAlt} src="/images/avatar-cow.png" />
            <span>{copy.brandName}</span>
          </Link>
        )}
      </div>

      <div className="niuma-home__header-controls">
        <nav aria-label={copy.navAria} className="niuma-home__nav" ref={segmentedRef}>
          <span
            ref={indicatorRef}
            aria-hidden="true"
            className="niuma-home__nav-indicator"
          />
          {navItems.map((item) => {
            const Icon = iconMap[item.key] ?? ToolsNavIcon;
            const to = item.path ?? '/';

            return (
              <NavLink
                className={({ isActive }) => (item.key === activeKey || isActive ? 'is-active' : '')}
                data-segmented-active={item.key === activeKey ? 'true' : undefined}
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
          <LanguageToggle
            className="niuma-home__theme-btn"
            locale={locale}
            setLocale={setLocale}
          />
          <ThemeToggle
            className="niuma-home__theme-btn"
            locale={locale}
            setTheme={setTheme}
            theme={theme}
          />
        </div>
      </div>
    </header>
  );
}
