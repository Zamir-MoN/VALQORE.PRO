// @ts-nocheck
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateAutoScrollSpeed,
  getScrollableAncestor,
  performScroll
} from '../src/utils/dragAutoScroll.ts';

test('1. calculateAutoScrollSpeed returns 0 when pointer is in neutral zone', () => {
  const speed = calculateAutoScrollSpeed(500, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(speed, 0);
});

test('2. calculateAutoScrollSpeed returns 0 when container height is invalid', () => {
  assert.equal(calculateAutoScrollSpeed(50, 100, 100), 0);
  assert.equal(calculateAutoScrollSpeed(50, 200, 100), 0);
});

test('3. calculateAutoScrollSpeed: top zone scrolls upward (negative) with acceleration', () => {
  // Top edge = 0, zoneSize = 120, maxSpeed = 28, minSpeed = 2
  // At boundary (120px): speed is minSpeed (2px)
  const atBoundary = calculateAutoScrollSpeed(120, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atBoundary, -2);

  // Midway (60px): quadratic speed = 2 + 26 * (60/120)^2 = 2 + 6.5 = 8.5
  const atMidway = calculateAutoScrollSpeed(60, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atMidway, -8.5);

  // At top edge (0px): speed is -maxSpeed (-28px)
  const atEdge = calculateAutoScrollSpeed(0, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atEdge, -28);

  // Past top edge (-20px): clamped to -maxSpeed (-28px)
  const pastEdge = calculateAutoScrollSpeed(-20, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(pastEdge, -28);
});

test('4. calculateAutoScrollSpeed: bottom zone scrolls downward (positive) with acceleration', () => {
  // Bottom edge = 1000, zoneSize = 120, maxSpeed = 28, minSpeed = 2
  // At boundary (880px): speed is minSpeed (2px)
  const atBoundary = calculateAutoScrollSpeed(880, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atBoundary, 2);

  // Midway (940px): quadratic speed = 2 + 26 * (60/120)^2 = 8.5
  const atMidway = calculateAutoScrollSpeed(940, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atMidway, 8.5);

  // At bottom edge (1000px): speed is +maxSpeed (28px)
  const atEdge = calculateAutoScrollSpeed(1000, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(atEdge, 28);

  // Past bottom edge (1050px): clamped to +maxSpeed (28px)
  const pastEdge = calculateAutoScrollSpeed(1050, 0, 1000, { zoneSize: 120, maxSpeed: 28, minSpeed: 2 });
  assert.equal(pastEdge, 28);
});

test('5. calculateAutoScrollSpeed supports linear acceleration', () => {
  // Midway with linear acceleration = 2 + (20 - 2) * 0.5 = 11
  const linear = calculateAutoScrollSpeed(50, 0, 1000, {
    zoneSize: 100,
    maxSpeed: 20,
    minSpeed: 2,
    acceleration: 'linear'
  });
  assert.equal(linear, -11);
});

test('6. getScrollableAncestor returns null for null element', () => {
  assert.equal(getScrollableAncestor(null), null);
});

test('7. performScroll scrolls inner container when scroll room is available', () => {
  // Mock inner container with scroll room
  const mockContainer = {
    scrollTop: 100,
    scrollHeight: 1000,
    clientHeight: 400
  } as unknown as HTMLElement;

  // Scroll down (positive delta)
  const resultDown = performScroll(20, mockContainer);
  assert.equal(resultDown.didScrollInner, true);
  assert.equal(mockContainer.scrollTop, 120);

  // Scroll up (negative delta)
  const resultUp = performScroll(-50, mockContainer);
  assert.equal(resultUp.didScrollInner, true);
  assert.equal(mockContainer.scrollTop, 70);
});

test('8. performScroll passes remaining delta to window when container hits boundary', () => {
  let windowScrolledDelta = 0;
  // Mock global window scrollBy
  const originalScrollBy = (globalThis as any).window?.scrollBy;
  (globalThis as any).window = {
    scrollY: 200,
    scrollBy: ({ top }: { top: number }) => {
      windowScrolledDelta = top;
    }
  };

  const mockContainer = {
    scrollTop: 10,
    scrollHeight: 500,
    clientHeight: 200
  } as unknown as HTMLElement;

  // Trying to scroll up by 30, but container only has 10px scrollTop
  const result = performScroll(-30, mockContainer);
  assert.equal(mockContainer.scrollTop, 0); // Inner container absorbed 10px
  assert.equal(result.didScrollInner, true);
  assert.equal(windowScrolledDelta, -20);    // Window absorbed remaining 20px

  // Clean up mock
  if (originalScrollBy) {
    (globalThis as any).window.scrollBy = originalScrollBy;
  } else {
    delete (globalThis as any).window;
  }
});
