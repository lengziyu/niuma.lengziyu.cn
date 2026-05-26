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
  const lastFrameRef = useRef({
    width: '',
    height: '',
    transform: '',
    borderRadius: '',
    opacity: ''
  });

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

    const width = `${itemRect.width}px`;
    const height = `${itemRect.height}px`;
    const transform = `translate3d(${itemRect.left - rootRect.left + root.scrollLeft}px, ${itemRect.top - rootRect.top + root.scrollTop}px, 0)`;
    const borderRadius = getComputedStyle(activeItem).borderRadius;
    const canRevealIndicator = canRevealIndicatorRef.current;
    const opacity = canRevealIndicator ? '1' : '0';

    if (lastFrameRef.current.width !== width) {
      indicator.style.width = width;
      lastFrameRef.current.width = width;
    }

    if (lastFrameRef.current.height !== height) {
      indicator.style.height = height;
      lastFrameRef.current.height = height;
    }

    if (lastFrameRef.current.transform !== transform) {
      indicator.style.transform = transform;
      lastFrameRef.current.transform = transform;
    }

    if (lastFrameRef.current.borderRadius !== borderRadius) {
      indicator.style.borderRadius = borderRadius;
      lastFrameRef.current.borderRadius = borderRadius;
    }

    if (lastFrameRef.current.opacity !== opacity) {
      indicator.style.opacity = opacity;
      lastFrameRef.current.opacity = opacity;
    }

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
    lastFrameRef.current.opacity = '0';
    indicator.style.transition = 'none';
    updateIndicator();
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
      attributeFilter: ['data-segmented-active', 'data-active', 'data-state', 'aria-selected', 'class']
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
