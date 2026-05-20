import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from './icons/AppIcons';

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
      {isDark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}
