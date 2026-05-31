import { Button } from '@/components/ui/button';
import { MoonIcon, SunIcon } from './icons/AppIcons';

const THEME_LABELS = {
  zh: {
    light: '切换到浅色主题',
    dark: '切换到深色主题'
  },
  en: {
    light: 'Switch to light theme',
    dark: 'Switch to dark theme'
  }
};

export default function ThemeToggle({ theme, setTheme, className = '', locale = 'zh' }) {
  const isDark = theme === 'dark';
  const labels = THEME_LABELS[locale] ?? THEME_LABELS.zh;

  return (
    <Button
      aria-label={isDark ? labels.light : labels.dark}
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
