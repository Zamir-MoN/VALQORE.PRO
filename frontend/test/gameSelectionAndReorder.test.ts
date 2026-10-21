import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleNormalSelect,
  handleCtrlToggle,
  handleShiftSelect,
  handleSelectAll,
  handleClearSelection,
  calculateGroupReorder,
  mergeReorderedWithFullList,
  filterGamesByStatus,
  calculateStatusCounts
} from '../src/utils/gameSelectionAndReorder.ts';

test('1. Normal click: selects game and clears previous multi-selection, sets anchor', () => {
  const step1 = handleNormalSelect('game-A');
  assert.deepEqual([...step1.selectedIds], ['game-A']);
  assert.equal(step1.anchorId, 'game-A');

  const step2 = handleNormalSelect('game-C');
  assert.deepEqual([...step2.selectedIds], ['game-C']);
  assert.equal(step2.anchorId, 'game-C');
});

test('2. Ctrl + click: toggles selection and updates anchor', () => {
  const initial = new Set(['game-A']);
  
  // Add game-B
  const added = handleCtrlToggle('game-B', initial);
  assert.deepEqual([...added.selectedIds].sort(), ['game-A', 'game-B']);
  assert.equal(added.anchorId, 'game-B');

  // Remove game-A
  const removed = handleCtrlToggle('game-A', added.selectedIds);
  assert.deepEqual([...removed.selectedIds], ['game-B']);
  assert.equal(removed.anchorId, 'game-A');
});

test('3. Shift + click: selects range between anchor and clicked, both downward and upward', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' }
  ];

  // Downward from B to E
  const down = handleShiftSelect('E', 'B', new Set(['B']), visibleList);
  assert.deepEqual([...down.selectedIds].sort(), ['B', 'C', 'D', 'E']);
  assert.equal(down.anchorId, 'B'); // Anchor preserved

  // Upward from E to B
  const up = handleShiftSelect('B', 'E', new Set(['E']), visibleList);
  assert.deepEqual([...up.selectedIds].sort(), ['B', 'C', 'D', 'E']);
  assert.equal(up.anchorId, 'E'); // Anchor preserved
});

test('4. Shift + click: preserves previously selected games outside the newly selected range (additive)', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' }
  ];

  // A is already selected. Anchor is C. User Shift-clicks E.
  const currentSelected = new Set(['A', 'C']);
  const result = handleShiftSelect('E', 'C', currentSelected, visibleList);
  // Range is C..E (C, D, E). A was outside range and must be preserved!
  assert.deepEqual([...result.selectedIds].sort(), ['A', 'C', 'D', 'E']);
});

test('5. Shift + click: when pressed before any anchor exists, selects clicked as initial anchor', () => {
  const visibleList = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  const result = handleShiftSelect('B', null, new Set(), visibleList);
  assert.deepEqual([...result.selectedIds], ['B']);
  assert.equal(result.anchorId, 'B');
});

test('6. User prompt scenario: Select Game B, Ctrl-click Game D, then Shift-click Game F', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' }
  ];

  // Step 1: Select Game B
  const s1 = handleNormalSelect('B');
  assert.deepEqual([...s1.selectedIds], ['B']);
  assert.equal(s1.anchorId, 'B');

  // Step 2: Ctrl-click Game D
  const s2 = handleCtrlToggle('D', s1.selectedIds);
  assert.deepEqual([...s2.selectedIds].sort(), ['B', 'D']);
  assert.equal(s2.anchorId, 'D'); // Anchor updated to D

  // Step 3: Shift-click Game F
  const s3 = handleShiftSelect('F', s2.anchorId, s2.selectedIds, visibleList);
  // Range from anchor D to target F: [D, E, F]. B is outside and preserved!
  assert.deepEqual([...s3.selectedIds].sort(), ['B', 'D', 'E', 'F']);
});

test('7. Group drag-and-drop: preserves relative order of selected games', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' },
    { id: 'E' },
    { id: 'F' }
  ];

  // Selected: B, D, F. Moving IDs: ['B', 'D', 'F']
  // Scenario A: Drag group downward to C (drop below C)
  const movedAfterC = calculateGroupReorder(visibleList, ['B', 'D', 'F'], 'C', 'below');
  assert.deepEqual(movedAfterC.map(g => g.id), ['A', 'C', 'B', 'D', 'F', 'E']);

  // Scenario B: Drag group upward to C (drop above C)
  const movedBeforeC = calculateGroupReorder(visibleList, ['B', 'D', 'F'], 'C', 'above');
  assert.deepEqual(movedBeforeC.map(g => g.id), ['A', 'B', 'D', 'F', 'C', 'E']);

  // Scenario C: Drag group to top (drop above A)
  const movedToTop = calculateGroupReorder(visibleList, ['B', 'D', 'F'], 'A', 'above');
  assert.deepEqual(movedToTop.map(g => g.id), ['B', 'D', 'F', 'A', 'C', 'E']);

  // Scenario D: Drag group to bottom (drop below E)
  const movedToBottom = calculateGroupReorder(visibleList, ['B', 'D', 'F'], 'E', 'below');
  assert.deepEqual(movedToBottom.map(g => g.id), ['A', 'C', 'E', 'B', 'D', 'F']);
});

test('8. Group drag-and-drop: dropping onto a member of the dragged group is a safe no-op', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' }
  ];
  const noop = calculateGroupReorder(visibleList, ['B', 'C'], 'B', 'above');
  assert.deepEqual(noop.map(g => g.id), ['A', 'B', 'C', 'D']);
});

test('9. Single-game drag: dragging an unselected game moves only that game', () => {
  const visibleList = [
    { id: 'A' },
    { id: 'B' },
    { id: 'C' },
    { id: 'D' }
  ];
  const single = calculateGroupReorder(visibleList, ['B'], 'D', 'below');
  assert.deepEqual(single.map(g => g.id), ['A', 'C', 'D', 'B']);
});

test('10. mergeReorderedWithFullList preserves non-tab items in their original slots', () => {
  const fullList = [
    { id: 'Game-1', isGiveaway: false, isBundle: false },
    { id: 'Bundle-1', isGiveaway: false, isBundle: true },
    { id: 'Game-2', isGiveaway: false, isBundle: false },
    { id: 'Giveaway-1', isGiveaway: true, isBundle: false },
    { id: 'Game-3', isGiveaway: false, isBundle: false }
  ];

  // Reorder games tab: [Game-3, Game-1, Game-2]
  const reorderedGamesTab = [
    { id: 'Game-3', isGiveaway: false, isBundle: false },
    { id: 'Game-1', isGiveaway: false, isBundle: false },
    { id: 'Game-2', isGiveaway: false, isBundle: false }
  ];

  const merged = mergeReorderedWithFullList(fullList, reorderedGamesTab, 'games');
  assert.deepEqual(merged.map(g => g.id), [
    'Game-3',
    'Bundle-1', // Bundle-1 stayed at index 1!
    'Game-1',
    'Giveaway-1', // Giveaway-1 stayed at index 3!
    'Game-2'
  ]);
});

test('11. Select All and Clear Selection', () => {
  const visibleList = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  const all = handleSelectAll(visibleList);
  assert.deepEqual([...all.selectedIds], ['A', 'B', 'C']);
  assert.equal(all.anchorId, 'A');

  const clear = handleClearSelection();
  assert.equal(clear.selectedIds.size, 0);
  assert.equal(clear.anchorId, null);
});

test('12. Deselecting all games before dragging: dragging an unselected game operates on that game only', () => {
  const visibleList = [{ id: 'A' }, { id: 'B' }, { id: 'C' }];
  // Select A, then deselect A
  const s1 = handleNormalSelect('A');
  const s2 = handleCtrlToggle('A', s1.selectedIds);
  assert.equal(s2.selectedIds.size, 0);

  // Now user drags B: movingIds should be ['B']
  const movingIds = s2.selectedIds.has('B') ? [...s2.selectedIds] : ['B'];
  const reordered = calculateGroupReorder(visibleList, movingIds, 'C', 'below');
  assert.deepEqual(reordered.map(g => g.id), ['A', 'C', 'B']);
});

test('13. Large selection reorder preserves relative order and integrity', () => {
  const items = Array.from({ length: 50 }, (_, i) => ({ id: `game-${i}` }));
  // Select all even indices (0, 2, 4, ..., 48) - 25 items
  const evenIds = items.filter((_, i) => i % 2 === 0).map(g => g.id);
  
  // Move all even games to after game-1
  const reordered = calculateGroupReorder(items, evenIds, 'game-1', 'below');
  assert.equal(reordered.length, 50);
  
  // Verify all even items appear together after game-1 in their original relative order
  const game1Idx = reordered.findIndex(g => g.id === 'game-1');
  const movedSlice = reordered.slice(game1Idx + 1, game1Idx + 1 + evenIds.length);
  assert.deepEqual(movedSlice.map(g => g.id), evenIds);
  
  // Verify no duplicates
  const idSet = new Set(reordered.map(g => g.id));
  assert.equal(idSet.size, 50);
});

test('14. Filtered list: selection and range operate on the visible list order', () => {
  // Full list has A, B, C, D, E, F
  // Search query filters to only B, D, F
  const filteredList = [{ id: 'B' }, { id: 'D' }, { id: 'F' }];
  
  // Select B as anchor
  const s1 = handleNormalSelect('B');
  // Shift-click F in the filtered list
  const s2 = handleShiftSelect('F', s1.anchorId, s1.selectedIds, filteredList);
  // All visible games in filtered list (B, D, F) are selected
  assert.deepEqual([...s2.selectedIds].sort(), ['B', 'D', 'F']);
});

test('15. filterGamesByStatus returns correct subsets for all, published, draft, and out_of_stock', () => {
  const gamesList = [
    { id: '1', title: 'Game 1', isPublished: true, outOfStock: false },
    { id: '2', title: 'Game 2', isPublished: false, outOfStock: false },
    { id: '3', title: 'Game 3', isPublished: true, outOfStock: true },
    { id: '4', title: 'Game 4', isPublished: false, outOfStock: true },
  ];

  // All
  const all = filterGamesByStatus(gamesList, 'all');
  assert.equal(all.length, 4);

  // Published
  const published = filterGamesByStatus(gamesList, 'published');
  assert.deepEqual(published.map(g => g.id), ['1', '3']);

  // Draft
  const draft = filterGamesByStatus(gamesList, 'draft');
  assert.deepEqual(draft.map(g => g.id), ['2', '4']);

  // Out of Stock (includes both published Game 3 and draft Game 4)
  const oos = filterGamesByStatus(gamesList, 'out_of_stock');
  assert.deepEqual(oos.map(g => g.id), ['3', '4']);
});

test('16. calculateStatusCounts returns exact counts in single pass', () => {
  const gamesList = [
    { id: '1', isPublished: true, outOfStock: false },
    { id: '2', isPublished: false, outOfStock: false },
    { id: '3', isPublished: true, outOfStock: true },
    { id: '4', isPublished: false, outOfStock: true },
    { id: '5', isPublished: true, outOfStock: false },
  ];

  const counts = calculateStatusCounts(gamesList);
  assert.equal(counts.all, 5);
  assert.equal(counts.published, 3); // 1, 3, 5
  assert.equal(counts.draft, 2);     // 2, 4
  assert.equal(counts.outOfStock, 2); // 3, 4
});

test('17. mergeReorderedWithFullList when statusFilter is active preserves unaffected games in their slots', () => {
  const fullList = [
    { id: 'P1', isPublished: true, isBundle: false, isGiveaway: false },
    { id: 'D1', isPublished: false, isBundle: false, isGiveaway: false },
    { id: 'P2', isPublished: true, isBundle: false, isGiveaway: false },
    { id: 'B1', isPublished: true, isBundle: true, isGiveaway: false },
    { id: 'P3', isPublished: true, isBundle: false, isGiveaway: false },
  ];

  // Reorder published games tab from [P1, P2, P3] to [P3, P1, P2]
  const reorderedPublished = [
    { id: 'P3', isPublished: true, isBundle: false, isGiveaway: false },
    { id: 'P1', isPublished: true, isBundle: false, isGiveaway: false },
    { id: 'P2', isPublished: true, isBundle: false, isGiveaway: false },
  ];

  const merged = mergeReorderedWithFullList(fullList, reorderedPublished, 'games', 'published');
  assert.deepEqual(merged.map(g => g.id), [
    'P3', // Published slot 1 gets P3
    'D1', // Draft item D1 preserved in place!
    'P1', // Published slot 2 gets P1
    'B1', // Bundle B1 preserved in place!
    'P2'  // Published slot 3 gets P2
  ]);
});

