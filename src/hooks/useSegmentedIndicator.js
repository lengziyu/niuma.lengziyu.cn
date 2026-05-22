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
    indicator.style.opacity = '1';
    root.dataset.segmentedReady = 'true';
  }, []);

  useLayoutEffect(() => {
    const root = segmentedRef.current;

    if (!root) {
      return undefined;
    }

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      updateIndicator();
      frame = requestAnimationFrame(updateIndicator);
    };

    schedule();

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
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      root.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [updateIndicator]);

  return {
    segmentedRef,
    indicatorRef,
    updateIndicator
  };
}
