import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

export function BrandMark({ large = false }) {
  return (
    <span className={`brand-mark ${large ? 'brand-mark--large' : ''}`} aria-hidden="true">
      <svg viewBox="0 0 32 32" role="img">
        <path d="M7 10.5h10.2a3 3 0 0 1 3 3v8H10a3 3 0 0 1-3-3z" />
        <path d="M19.8 12.5H25a2 2 0 0 1 2 2v7h-7.2z" />
        <path d="M10 8h6" />
        <path d="M22.5 8h3.5" />
      </svg>
    </span>
  );
}

export default function SiteHeader({ theme, setTheme }) {
  const location = useLocation();
  const isToolPage = location.pathname !== '/';

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/84 backdrop-blur-xl">
      <div className="mx-auto flex min-h-[72px] max-w-[1240px] items-center justify-between gap-6 px-6 sm:px-8 lg:px-10">
        <Link className="inline-flex items-center gap-4" to="/">
          <BrandMark />
          <span className="block">
            <strong className="block text-[15px] font-semibold tracking-[-0.01em] text-foreground">
              牛马百宝箱
            </strong>
            <small className="mt-1 block text-[13px] text-muted-foreground">
              办公工具站
            </small>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isToolPage ? (
            <Link
              className="inline-flex h-10 items-center justify-center rounded-full border border-border bg-card px-4 text-sm text-foreground shadow-[var(--shadow-subtle)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/28 hover:bg-muted/70"
              to="/"
            >
              返回工具列表
            </Link>
          ) : null}

          <ThemeToggle
            className="size-10 rounded-full border-border bg-card shadow-[var(--shadow-subtle)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/28 hover:bg-muted/70"
            setTheme={setTheme}
            theme={theme}
          />
        </div>
      </div>
    </header>
  );
}
