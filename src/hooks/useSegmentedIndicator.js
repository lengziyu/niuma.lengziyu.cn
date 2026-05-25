import { useCallback, useLayoutEffect, useRef } from 'react';

const activeSelector = [
  '[data-segmented-active="true"]',
  '[data-active]',
  '[data-state="active"]',
  '[aria-selected="true"]',
  '.is-active'
].join(',');

export default function useSegmentedIndicator() {
  const segmentedRef = useRef(null);
  const indicatorRef = useRef(null);
  const canRevealIndicatorRef = useRef(true);

  const updateIndicator = useCallback(() => {
    const root = segmentedRef.current;
    const indicator = indicatorRef.current;

    if (!root || !indicator) {
      return;
    }

    const activeItem = root.querySelector(activeSelector);

    if (!activeItem) {
      root.dataset.segmentedReady = 'false';
      indicator.style.opacity = '0';
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const itemRect = activeItem.getBoundingClientRect();

    indicator.style.width = `${itemRect.width}px`;
    indicator.style.height = `${itemRect.height}px`;
    indicator.style.transform = `translate3d(${itemRect.left - rootRect.left + root.scrollLeft}px, ${itemRect.top - rootRect.top + root.scrollTop}px, 0)`;
    indicator.style.borderRadius = getComputedStyle(activeItem).borderRadius;
    const canRevealIndicator = canRevealIndicatorRef.current;
    indicator.style.opacity = canRevealIndicator ? '1' : '0';
    root.dataset.segmentedReady = canRevealIndicator ? 'true' : 'false';
  }, []);

  useLayoutEffect(() => {
    const root = segmentedRef.current;
    const indicator = indicatorRef.current;

    if (!root || !indicator) {
      return undefined;
    }

    let frame = 0;
    let revealFrame = 0;
    let settleFrame = 0;
    let restoreTransitionFrame = 0;
    let revealTimeoutId = 0;
    let isDisposed = false;
    const fontSet = typeof document === 'undefined' ? null : document.fonts;

    const schedule = () => {
      cancelAnimationFrame(frame);
      updateIndicator();
      frame = requestAnimationFrame(updateIndicator);
    };

    const revealIndicator = () => {
      if (isDisposed || canRevealIndicatorRef.current) {
        return;
      }

      canRevealIndicatorRef.current = true;
      indicator.style.transition = 'none';
      updateIndicator();

      cancelAnimationFrame(restoreTransitionFrame);
      restoreTransitionFrame = requestAnimationFrame(() => {
        if (isDisposed) {
          return;
        }

        indicator.style.transition = '';
      });
    };

    const settleAndRevealIndicator = () => {
      if (isDisposed || canRevealIndicatorRef.current) {
        return;
      }

      cancelAnimationFrame(settleFrame);
      cancelAnimationFrame(revealFrame);

      settleFrame = requestAnimationFrame(() => {
        if (isDisposed || canRevealIndicatorRef.current) {
          return;
        }

        updateIndicator();
        revealFrame = requestAnimationFrame(revealIndicator);
      });
    };

    canRevealIndicatorRef.current = false;
    root.dataset.segmentedReady = 'false';
    indicator.style.opacity = '0';
    indicator.style.transition = 'none';
    schedule();

    if (!fontSet || fontSet.status === 'loaded') {
      settleAndRevealIndicator();
    } else {
      fontSet.ready.then(settleAndRevealIndicator).catch(settleAndRevealIndicator);
      if (typeof fontSet.addEventListener === 'function') {
        fontSet.addEventListener('loadingdone', settleAndRevealIndicator);
      }

      revealTimeoutId = window.setTimeout(settleAndRevealIndicator, 1200);
    }

    const resizeObserver = new ResizeObserver(schedule);
    resizeObserver.observe(root);
    Array.from(root.children).forEach((child) => resizeObserver.observe(child));

    const mutationObserver = new MutationObserver(schedule);
    mutationObserver.observe(root, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['data-segmented-active', 'data-active', 'data-state', 'aria-selected', 'class', 'style']
    });

    root.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settleFrame);
      cancelAnimationFrame(revealFrame);
      cancelAnimationFrame(restoreTransitionFrame);
      window.clearTimeout(revealTimeoutId);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      root.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);

      if (fontSet && typeof fontSet.removeEventListener === 'function') {
        fontSet.removeEventListener('loadingdone', settleAndRevealIndicator);
      }
    };
  }, [updateIndicator]);

  return {
    segmentedRef,
    indicatorRef,
    updateIndicator
  };
}
