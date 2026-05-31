export const LOCALE_STORAGE_KEY = 'niuma-locale';
export const DEFAULT_LOCALE = 'zh';
export const SUPPORTED_LOCALES = ['zh', 'en'];

export function normalizeLocale(locale) {
  return SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
}

export function readStoredLocale() {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return normalizeLocale(stored);
}
