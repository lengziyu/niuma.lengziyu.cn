import { Button } from '@/components/ui/button';

const LABELS = {
  zh: 'EN',
  en: '中'
};

const ARIA_LABELS = {
  zh: '切换到英文',
  en: 'Switch to Chinese'
};

export default function LanguageToggle({ locale = 'zh', setLocale, className = '' }) {
  const nextLocale = locale === 'zh' ? 'en' : 'zh';

  return (
    <Button
      aria-label={ARIA_LABELS[locale] ?? ARIA_LABELS.zh}
      className={className}
      size="icon"
      type="button"
      variant="outline"
      onClick={() => setLocale(nextLocale)}
    >
      <span className="text-xs font-semibold">{LABELS[locale] ?? LABELS.zh}</span>
    </Button>
  );
}
