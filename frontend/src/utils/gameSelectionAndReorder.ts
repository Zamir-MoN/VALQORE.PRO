/**
 * Windows-style selection behavior and group reordering utilities for VALQORE.PRO
 */

export interface IdentifiableItem {
  id: string;
  isGiveaway?: boolean;
  isBundle?: boolean;
  [key: string]: any;
}

/**
 * Normal Click:
 * - Selects the clicked item and clears previous selection.
 * - The clicked item becomes the current selection anchor.
 */
export function handleNormalSelect(itemId: string): {
  selectedIds: Set<string>;
  anchorId: string;
} {
  return {
    selectedIds: new Set([itemId]),
    anchorId: itemId
  };
}

/**
 * Ctrl + Click:
 * - If unselected, adds item to current selection.
 * - If selected, removes item from current selection.
 * - Preserves other selected items.
 * - Updates the selection anchor to the clicked item.
 */
export function handleCtrlToggle(
  itemId: string,
  currentSelectedIds: Set<string>
): {
  selectedIds: Set<string>;
  anchorId: string;
} {
  const next = new Set(currentSelectedIds);
  if (next.has(itemId)) {
    next.delete(itemId);
  } else {
    next.add(itemId);
  }
  return {
    selectedIds: next,
    anchorId: itemId
  };
}

/**
 * Shift + Click:
 * - Selects the complete range between current selection anchor and clicked item, inclusive.
 * - Supports downward and upward selection.
 * - Preserves previously selected items outside the newly selected range (additive range selection).
 * - If no anchor exists or anchor is missing from visibleList, selects clicked item as initial anchor.
 * - Selection anchor remains preserved for subsequent range extensions.
 */
export function handleShiftSelect<T extends { id: string }>(
  clickedId: string,
  anchorId: string | null,
  currentSelectedIds: Set<string>,
  visibleList: T[]
): {
  selectedIds: Set<string>;
  anchorId: string;
} {
  const clickedIndex = visibleList.findIndex(item => item.id === clickedId);
  if (clickedIndex === -1) {
    return {
      selectedIds: new Set(currentSelectedIds),
      anchorId: anchorId || clickedId
    };
  }

  // If no anchor or anchor not found in visible list, treat clicked as initial anchor
  if (!anchorId) {
    const next = new Set(currentSelectedIds);
    next.add(clickedId);
    return {
      selectedIds: next,
      anchorId: clickedId
    };
  }

  const anchorIndex = visibleList.findIndex(item => item.id === anchorId);
  if (anchorIndex === -1) {
    const next = new Set(currentSelectedIds);
    next.add(clickedId);
    return {
      selectedIds: next,
      anchorId: clickedId
    };
  }

  const startIndex = Math.min(anchorIndex, clickedIndex);
  const endIndex = Math.max(anchorIndex, clickedIndex);

  const next = new Set(currentSelectedIds);
  for (let i = startIndex; i <= endIndex; i++) {
    next.add(visibleList[i].id);
  }

  return {
    selectedIds: next,
    anchorId // Preserve anchor for predictable subsequent Shift-clicks
  };
}

/**
 * Select All visible items in list.
 */
export function handleSelectAll<T extends { id: string }>(
  visibleList: T[]
): {
  selectedIds: Set<string>;
  anchorId: string | null;
} {
  const ids = visibleList.map(item => item.id);
  return {
    selectedIds: new Set(ids),
    anchorId: ids.length > 0 ? ids[0] : null
  };
}

/**
 * Clear all selections.
 */
export function handleClearSelection(): {
  selectedIds: Set<string>;
  anchorId: null;
} {
  return {
    selectedIds: new Set(),
    anchorId: null
  };
}

/**
 * Calculate Group Reordering:
 * - Takes the current visible list, the group of IDs being moved, the target ID, and the position ('above' | 'below').
 * - Preserves the original relative order of the moving items.
 * - Inserts the moving items as a contiguous block at the destination.
 * - If target is in the moving group, returns currentList unchanged (no-op).
 */
export function calculateGroupReorder<T extends { id: string }>(
  currentList: T[],
  movingIds: string[],
  targetId: string,
  position: 'above' | 'below'
): T[] {
  if (!movingIds || movingIds.length === 0) return currentList;

  // Cannot drop group onto one of its own members
  if (movingIds.includes(targetId)) return currentList;

  const movingSet = new Set(movingIds);

  // Extract items to move in their original relative order from currentList
  const itemsToMove = currentList.filter(item => movingSet.has(item.id));
  if (itemsToMove.length === 0) return currentList;

  // Remaining unmoved items in their original relative order
  const remaining = currentList.filter(item => !movingSet.has(item.id));
  const targetIdx = remaining.findIndex(item => item.id === targetId);
  if (targetIdx === -1) return currentList;

  const insertIdx = position === 'above' ? targetIdx : targetIdx + 1;

  return [
    ...remaining.slice(0, insertIdx),
    ...itemsToMove,
    ...remaining.slice(insertIdx)
  ];
}

export type GameStatusFilter = 'all' | 'published' | 'draft' | 'out_of_stock';

/**
 * Filter items by game status:
 * - 'all': all games
 * - 'published': isPublished === true
 * - 'draft': isPublished === false
 * - 'out_of_stock': outOfStock === true (whether published or draft)
 */
export function filterGamesByStatus<T extends IdentifiableItem>(
  gamesList: T[],
  statusFilter: GameStatusFilter
): T[] {
  if (statusFilter === 'published') {
    return gamesList.filter(g => Boolean(g.isPublished));
  }
  if (statusFilter === 'draft') {
    return gamesList.filter(g => !g.isPublished);
  }
  if (statusFilter === 'out_of_stock') {
    return gamesList.filter(g => Boolean(g.outOfStock));
  }
  return gamesList;
}

/**
 * Computes status counts for a list of games in a single pass.
 */
export function calculateStatusCounts<T extends IdentifiableItem>(gamesList: T[]): {
  all: number;
  published: number;
  draft: number;
  outOfStock: number;
  out_of_stock: number;
} {
  let published = 0;
  let draft = 0;
  let outOfStock = 0;

  for (const g of gamesList) {
    if (g.isPublished) published++;
    else draft++;

    if (g.outOfStock) outOfStock++;
  }

  return {
    all: gamesList.length,
    published,
    draft,
    outOfStock,
    out_of_stock: outOfStock
  };
}

/**
 * Merges reordered items of an active tab back into the full games array.
 * Replaces tab items in their existing index slots so items from other tabs
 * (e.g. bundles or giveaways) or from other status categories (e.g. draft games when filtering by published)
 * are never displaced to the end of the database.
 */
export function mergeReorderedWithFullList<T extends IdentifiableItem>(
  fullList: T[],
  reorderedTabList: T[],
  activeTab: string,
  statusFilter: string = 'all'
): T[] {
  let tabIdx = 0;
  return fullList.map(item => {
    const matchesTab =
      activeTab === 'giveaways' ? Boolean(item.isGiveaway) :
      activeTab === 'bundles' ? Boolean(item.isBundle) :
      (!item.isGiveaway && !item.isBundle);

    if (!matchesTab) return item;

    const matchesStatus =
      statusFilter === 'published' ? Boolean(item.isPublished) :
      statusFilter === 'draft' ? !item.isPublished :
      statusFilter === 'out_of_stock' ? Boolean(item.outOfStock) :
      true;

    if (matchesStatus) {
      const replacement = reorderedTabList[tabIdx++];
      return replacement || item;
    }
    return item;
  });
}

