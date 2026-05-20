import { Moon, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle({ theme, setTheme, className = '' }) {
  const isDark = theme === 'dark';

  return (
    <Button
      aria-label={isDark ? '切换到浅色主题' : '切换到深色主题'}
      className={className}
      size="icon"
      type="button"
      variant="outline"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      {isDark ? (
        <SunMedium className="size-4" />
      ) : (
        <img
          alt=""
          aria-hidden="true"
          className="niuma-theme-toggle__sprite"
          src="/images/sprites/theme-moon.png"
        />
      )}
    </Button>
  );
}
