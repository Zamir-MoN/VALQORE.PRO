import fs from 'fs';
import path from 'path';

const REGISTRY_PATH = path.join(__dirname, '../../uploads/slug_history.json');

// In-memory cache for fast lookups
let cache: Record<string, string> | null = null;

function loadRegistry(): Record<string, string> {
  if (cache) return cache;
  try {
    if (fs.existsSync(REGISTRY_PATH)) {
      const data = fs.readFileSync(REGISTRY_PATH, 'utf-8');
      cache = JSON.parse(data);
      return cache || {};
    }
  } catch (err) {
    console.error('[SLUG HISTORY] Error loading registry:', err);
  }
  cache = {};
  return cache;
}

function persistRegistry(): void {
  if (!cache) return;
  try {
    const dir = path.dirname(REGISTRY_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${REGISTRY_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(cache, null, 2), 'utf-8');
    fs.renameSync(tempPath, REGISTRY_PATH);
  } catch (err) {
    console.error('[SLUG HISTORY] Error saving registry:', err);
  }
}

/**
 * Record an old slug mapped to a game's ID
 */
export function recordSlugHistory(oldSlug: string, gameId: string): void {
  if (!oldSlug || !gameId) return;
  const cleanOld = oldSlug.toLowerCase().trim();
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Don't record UUIDs as slug history
  if (uuidRegex.test(cleanOld)) return;

  const registry = loadRegistry();
  registry[cleanOld] = gameId;
  persistRegistry();
}

/**
 * Look up a game's ID from an old slug
 */
export function getGameIdFromSlugHistory(slug: string): string | null {
  if (!slug) return null;
  const clean = slug.toLowerCase().trim();
  const registry = loadRegistry();
  return registry[clean] || null;
}

/**
 * Remove a slug from history if it is claimed by a new/active game
 */
export function removeSlugFromHistory(slug: string): void {
  if (!slug) return;
  const clean = slug.toLowerCase().trim();
  const registry = loadRegistry();
  if (registry[clean]) {
    delete registry[clean];
    persistRegistry();
  }
}

/**
 * Reset in-memory cache (primarily for tests)
 */
export function resetSlugHistoryCache(): void {
  cache = null;
}
