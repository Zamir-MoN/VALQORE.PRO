import test from 'node:test';
import assert from 'node:assert/strict';

interface Game {
  id: string;
  title: string;
  price: number;
  steamPrice?: number | null;
  internalCost?: number | null;
  isPublished?: boolean;
  outOfStock?: boolean;
  isBundle?: boolean;
  bundleGames?: string | null;
  creatorAccess?: boolean;
  order?: number;
  coverImage?: string;
}

// Emulates optimistic toggle logic used in AdminDashboard
function toggleCreatorAccessOptimistic(
  games: Game[],
  targetId: string,
  processingId: string | null
): { updatedGames: Game[]; newProcessingId: string | null; blocked: boolean } {
  if (processingId === targetId) {
    return { updatedGames: games, newProcessingId: processingId, blocked: true };
  }

  const target = games.find(g => g.id === targetId);
  if (!target) {
    return { updatedGames: games, newProcessingId: processingId, blocked: false };
  }

  const nextStatus = !Boolean(target.creatorAccess);
  const updatedGames = games.map(g =>
    g.id === targetId ? { ...g, creatorAccess: nextStatus } : g
  );

  return { updatedGames, newProcessingId: targetId, blocked: false };
}

// Emulates rollback logic on API failure
function rollbackCreatorAccess(
  games: Game[],
  targetId: string,
  originalStatus: boolean
): Game[] {
  return games.map(g =>
    g.id === targetId ? { ...g, creatorAccess: originalStatus } : g
  );
}

// Creator program eligibility filter from Library.tsx
function getCreatorAccessibleGames(games: Game[]): Game[] {
  return games.filter(g => Boolean(g.creatorAccess));
}

// Creator pass eligibility check from GameDetails.tsx
function canClaimCreatorPass(game: Game, creatorStatus: string): boolean {
  return Boolean(game.creatorAccess) && creatorStatus === 'APPROVED';
}

test('1. Creator Access toggle preserves all other game fields', () => {
  const initialGame: Game = {
    id: 'game-1',
    title: 'Wuchang: Fallen Feathers',
    price: 199.00,
    steamPrice: 399.00,
    internalCost: 80.00,
    isPublished: true,
    outOfStock: false,
    isBundle: false,
    bundleGames: null,
    creatorAccess: false,
    order: 1,
    coverImage: '/uploads/wuchang.jpg'
  };

  const { updatedGames, blocked } = toggleCreatorAccessOptimistic([initialGame], 'game-1', null);
  assert.equal(blocked, false);
  const updated = updatedGames[0];

  // creatorAccess is toggled to true
  assert.equal(updated.creatorAccess, true);

  // All other fields are strictly preserved
  assert.equal(updated.id, initialGame.id);
  assert.equal(updated.title, initialGame.title);
  assert.equal(updated.price, initialGame.price);
  assert.equal(updated.steamPrice, initialGame.steamPrice);
  assert.equal(updated.internalCost, initialGame.internalCost);
  assert.equal(updated.isPublished, initialGame.isPublished);
  assert.equal(updated.outOfStock, initialGame.outOfStock);
  assert.equal(updated.isBundle, initialGame.isBundle);
  assert.equal(updated.bundleGames, initialGame.bundleGames);
  assert.equal(updated.order, initialGame.order);
  assert.equal(updated.coverImage, initialGame.coverImage);
});

test('2. Creator Access toggle works for both Published and Draft games', () => {
  const games: Game[] = [
    { id: 'published-game', title: 'Published Game', price: 299, isPublished: true, creatorAccess: false },
    { id: 'draft-game', title: 'Draft Game', price: 0, isPublished: false, creatorAccess: false }
  ];

  // Toggle published game: OFF -> ON
  const res1 = toggleCreatorAccessOptimistic(games, 'published-game', null);
  assert.equal(res1.updatedGames.find(g => g.id === 'published-game')?.creatorAccess, true);
  assert.equal(res1.updatedGames.find(g => g.id === 'published-game')?.isPublished, true);

  // Toggle draft game: OFF -> ON (remains draft)
  const res2 = toggleCreatorAccessOptimistic(games, 'draft-game', null);
  assert.equal(res2.updatedGames.find(g => g.id === 'draft-game')?.creatorAccess, true);
  assert.equal(res2.updatedGames.find(g => g.id === 'draft-game')?.isPublished, false);

  // Toggle ON -> OFF
  const res3 = toggleCreatorAccessOptimistic(res1.updatedGames, 'published-game', null);
  assert.equal(res3.updatedGames.find(g => g.id === 'published-game')?.creatorAccess, false);
});

test('3. Duplicate click prevention blocks concurrent requests for the same game', () => {
  const games: Game[] = [
    { id: 'game-1', title: 'Game 1', price: 100, creatorAccess: false }
  ];

  // First click sets processingId to 'game-1'
  const firstClick = toggleCreatorAccessOptimistic(games, 'game-1', null);
  assert.equal(firstClick.blocked, false);
  assert.equal(firstClick.newProcessingId, 'game-1');

  // Second click while processing is blocked
  const secondClick = toggleCreatorAccessOptimistic(firstClick.updatedGames, 'game-1', 'game-1');
  assert.equal(secondClick.blocked, true);
  assert.deepEqual(secondClick.updatedGames, firstClick.updatedGames);
});

test('4. API failure triggers rollback restoring original state', () => {
  const originalGames: Game[] = [
    { id: 'game-1', title: 'Game 1', price: 100, creatorAccess: false }
  ];

  // Optimistic update
  const { updatedGames } = toggleCreatorAccessOptimistic(originalGames, 'game-1', null);
  assert.equal(updatedGames[0].creatorAccess, true);

  // Simulate network/server error rollback
  const rolledBack = rollbackCreatorAccess(updatedGames, 'game-1', false);
  assert.equal(rolledBack[0].creatorAccess, false);
});

test('5. Creator program eligibility directly respects the canonical creatorAccess field', () => {
  const storeGames: Game[] = [
    { id: 'g1', title: 'Creator Exclusive', price: 100, creatorAccess: true },
    { id: 'g2', title: 'Standard Game', price: 100, creatorAccess: false }
  ];

  // Library.tsx check
  const creatorLibraryGames = getCreatorAccessibleGames(storeGames);
  assert.equal(creatorLibraryGames.length, 1);
  assert.equal(creatorLibraryGames[0].id, 'g1');

  // GameDetails.tsx checks
  assert.equal(canClaimCreatorPass(storeGames[0], 'APPROVED'), true);
  assert.equal(canClaimCreatorPass(storeGames[0], 'PENDING'), false);
  assert.equal(canClaimCreatorPass(storeGames[1], 'APPROVED'), false);
});
