/**
 * Auto-scroll utilities for drag-and-drop operations in Admin Dashboard.
 *
 * Provides frame-based auto-scrolling (requestAnimationFrame) when dragging
 * games near viewport or scrollable container edges, with quadratic acceleration,
 * container boundary overflow handling, and Lenis/native scroll support.
 */

export interface AutoScrollOptions {
  zoneSize?: number;      // Pixel distance from edge where auto-scroll activates (default: 120)
  maxSpeed?: number;      // Maximum scroll speed in pixels per frame (default: 28)
  minSpeed?: number;      // Minimum starting scroll speed in pixels per frame (default: 2)
  acceleration?: 'linear' | 'quadratic'; // Acceleration curve (default: 'quadratic')
}

/**
 * Calculates scroll speed and direction based on pointer Y relative to container/viewport edges.
 * Returns negative value for scrolling UP, positive value for scrolling DOWN, 0 for neutral zone.
 */
export function calculateAutoScrollSpeed(
  clientY: number,
  topEdge: number,
  bottomEdge: number,
  options: AutoScrollOptions = {}
): number {
  const zoneSize = options.zoneSize ?? 120;
  const maxSpeed = options.maxSpeed ?? 28;
  const minSpeed = options.minSpeed ?? 2;
  const acceleration = options.acceleration ?? 'quadratic';

  const containerHeight = bottomEdge - topEdge;
  if (containerHeight <= 0) return 0;

  // Effective zone size cannot exceed half container height
  const effectiveZone = Math.min(zoneSize, containerHeight / 2);

  // Top zone: clientY is between (topEdge - 100) and (topEdge + effectiveZone)
  if (clientY <= topEdge + effectiveZone && clientY >= topEdge - 100) {
    const distanceIntoZone = Math.max(0, (topEdge + effectiveZone) - clientY);
    const ratio = Math.min(1, distanceIntoZone / effectiveZone);
    const factor = acceleration === 'quadratic' ? ratio * ratio : ratio;
    const speed = minSpeed + (maxSpeed - minSpeed) * factor;
    return -speed;
  }

  // Bottom zone: clientY is between (bottomEdge - effectiveZone) and (bottomEdge + 100)
  if (clientY >= bottomEdge - effectiveZone && clientY <= bottomEdge + 100) {
    const distanceIntoZone = Math.max(0, clientY - (bottomEdge - effectiveZone));
    const ratio = Math.min(1, distanceIntoZone / effectiveZone);
    const factor = acceleration === 'quadratic' ? ratio * ratio : ratio;
    const speed = minSpeed + (maxSpeed - minSpeed) * factor;
    return speed;
  }

  return 0;
}

/**
 * Traverses DOM upwards to find the nearest scrollable ancestor container (excluding body/html).
 */
export function getScrollableAncestor(element: HTMLElement | null): HTMLElement | null {
  if (!element || typeof window === 'undefined') return null;

  let curr = element.parentElement;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    try {
      const style = window.getComputedStyle(curr);
      const overflowY = style.overflowY;
      const isScrollableType = overflowY === 'auto' || overflowY === 'scroll';
      const hasScrollableContent = curr.scrollHeight > curr.clientHeight;

      if (isScrollableType && hasScrollableContent) {
        return curr;
      }
    } catch {
      // Fallback in non-browser/test environments
      if (curr.scrollHeight > curr.clientHeight) {
        return curr;
      }
    }
    curr = curr.parentElement;
  }

  return null;
}

/**
 * Smoothly scrolls window/document using Lenis (if active) or native window scroll.
 */
export function scrollWindow(delta: number): boolean {
  if (typeof window === 'undefined' || delta === 0) return false;

  const lenis = (window as any).lenis;
  if (lenis && typeof lenis.scrollTo === 'function') {
    const current = typeof lenis.scroll === 'number'
      ? lenis.scroll
      : (window.scrollY || document.documentElement?.scrollTop || 0);
    const docHeight = Math.max(
      document.body?.scrollHeight || 0,
      document.documentElement?.scrollHeight || 0
    );
    const maxLimit = typeof lenis.limit === 'number'
      ? lenis.limit
      : Math.max(0, docHeight - window.innerHeight);

    const target = Math.max(0, Math.min(maxLimit, current + delta));
    if (target !== current) {
      lenis.scrollTo(target, { immediate: true, force: true });
      return true;
    }
    return false;
  }

  // Fallback: native scroll
  const prevY = window.scrollY || document.documentElement?.scrollTop || 0;
  if (typeof window.scrollBy === 'function') {
    window.scrollBy({ top: delta, left: 0, behavior: 'instant' as ScrollBehavior });
  } else if (document.documentElement) {
    document.documentElement.scrollTop += delta;
  }
  const newY = window.scrollY || document.documentElement?.scrollTop || 0;
  return newY !== prevY;
}

/**
 * Attempts to scroll the scrollable ancestor first.
 * If the container cannot scroll further in that direction, scrolls window with remaining delta.
 */
export function performScroll(
  delta: number,
  container: HTMLElement | null
): { didScrollInner: boolean; didScrollWindow: boolean } {
  if (delta === 0) return { didScrollInner: false, didScrollWindow: false };

  let remainingDelta = delta;
  let didScrollInner = false;

  if (container) {
    if (delta < 0 && container.scrollTop > 0) {
      const canScroll = Math.max(delta, -container.scrollTop);
      container.scrollTop += canScroll;
      remainingDelta = delta - canScroll;
      didScrollInner = true;
    } else if (delta > 0) {
      const maxScroll = container.scrollHeight - container.clientHeight;
      if (container.scrollTop < maxScroll - 1) {
        const canScroll = Math.min(delta, maxScroll - container.scrollTop);
        container.scrollTop += canScroll;
        remainingDelta = delta - canScroll;
        didScrollInner = true;
      }
    }
  }

  let didScrollWindow = false;
  if (remainingDelta !== 0) {
    didScrollWindow = scrollWindow(remainingDelta);
  }

  return { didScrollInner, didScrollWindow };
}
