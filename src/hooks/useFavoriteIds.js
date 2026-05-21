import { useCallback, useEffect, useMemo, useState } from 'react';

const FAVORITES_STORAGE_KEY = 'niuma-home-favorites';
const FAVORITES_UPDATED_EVENT = 'niuma:favorites-updated';

function readFavoriteIds() {
  try {
    const saved = window.localStorage.getItem(FAVORITES_STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function useFavoriteIds() {
  const [favoriteIds, setFavoriteIds] = useState(() => readFavoriteIds());

  useEffect(() => {
    function syncFromStorage(event) {
      if (event?.key && event.key !== FAVORITES_STORAGE_KEY) {
        return;
      }

      setFavoriteIds(readFavoriteIds());
    }

    function syncFromCustomEvent(event) {
      const nextIds = event.detail;
      setFavoriteIds(Array.isArray(nextIds) ? nextIds : readFavoriteIds());
    }

    window.addEventListener('storage', syncFromStorage);
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFromCustomEvent);

    return () => {
      window.removeEventListener('storage', syncFromStorage);
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFromCustomEvent);
    };
  }, []);

  const updateFavoriteIds = useCallback((updater) => {
    setFavoriteIds((current) => {
      const nextIds = typeof updater === 'function' ? updater(current) : updater;
      const normalizedIds = Array.isArray(nextIds) ? nextIds : [];

      window.localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(normalizedIds));
      window.dispatchEvent(
        new CustomEvent(FAVORITES_UPDATED_EVENT, {
          detail: normalizedIds
        })
      );

      return normalizedIds;
    });
  }, []);

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  return {
    favoriteIds,
    favoriteSet,
    setFavoriteIds: updateFavoriteIds
  };
}
