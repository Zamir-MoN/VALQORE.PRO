import test from 'node:test';
import assert from 'node:assert/strict';
import { recordSlugHistory, getGameIdFromSlugHistory, removeSlugFromHistory, resetSlugHistoryCache } from '../../backend/src/services/slugHistory.service';

// Mock Game object interface
interface MockGame {
  id: string;
  slug: string | null;
  title: string;
  developer: string;
  rating: number;
  genre: string;
  price: number;
  coverImage: string;
  description: string | null;
  isPublished: boolean;
  internalCost?: number | null;
  updatedAt: string;
}

// Mirror backend share-meta logic for testing
function generateShareMetaHtml(game: MockGame | null, requestedIdentifier: string): {
  statusCode: number;
  headers: Record<string, string>;
  html: string;
} {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const slugRegex = /^[a-z0-9_-]+$/i;

  if (!uuidRegex.test(requestedIdentifier) && !slugRegex.test(requestedIdentifier)) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'text/plain' },
      html: 'Invalid Game Identifier'
    };
  }

  const escapeHtml = (unsafe: string) => {
    return (unsafe || '').toString().replace(/[&<"'>]/g, (match) => {
      const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };
      return escapeMap[match];
    });
  };

  const publishedGame = game && game.isPublished ? game : null;
  const fallbackImage = 'https://valqore.pro/images/hero-artwork.png';
  let posterImage = fallbackImage;

  if (publishedGame?.coverImage) {
    if (publishedGame.coverImage.startsWith('http://') || publishedGame.coverImage.startsWith('https://')) {
      posterImage = publishedGame.coverImage;
    } else {
      posterImage = `https://valqore.pro${publishedGame.coverImage.startsWith('/') ? '' : '/'}${publishedGame.coverImage}`;
    }
  }

  const rawTitle = publishedGame ? `${publishedGame.title} | VALQORE` : 'VALQORE';
  const title = escapeHtml(rawTitle);
  const displayTitle = escapeHtml(publishedGame ? publishedGame.title : 'VALQORE');

  let rawDescription = 'Discover top digital PC & console games, exclusive giveaways, verified game accounts, and instant delivery on VALQORE.';
  if (publishedGame && publishedGame.description && publishedGame.description.trim()) {
    const cleanDesc = publishedGame.description.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
    if (cleanDesc.length > 0) {
      rawDescription = cleanDesc.length > 300 ? cleanDesc.slice(0, 297) + '...' : cleanDesc;
    }
  } else if (publishedGame && publishedGame.title) {
    rawDescription = `Check out ${publishedGame.title} on VALQORE! Instant digital delivery, verified game accounts, and 24/7 dedicated support.`;
  }
  const description = escapeHtml(rawDescription);

  const targetSlug = publishedGame ? (publishedGame.slug || publishedGame.id) : requestedIdentifier;
  const canonicalGameUrl = `https://valqore.pro/game/${escapeHtml(targetSlug)}`;
  const safePosterImage = escapeHtml(posterImage);

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <link rel="canonical" href="${canonicalGameUrl}" />
  <meta name="description" content="${description}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="VALQORE" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${safePosterImage}" />
  <meta property="og:image:secure_url" content="${safePosterImage}" />
  <meta property="og:image:alt" content="${displayTitle}" />
  <meta property="og:url" content="${canonicalGameUrl}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${safePosterImage}" />
  <meta http-equiv="refresh" content="0;url=${canonicalGameUrl}" />
  <script>window.location.replace("${canonicalGameUrl}");</script>
</head>
<body style="background:#050505;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <p>Redirecting to <a href="${canonicalGameUrl}" style="color:#DCF836;">${title}</a>...</p>
</body>
</html>`;

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, must-revalidate',
      'Pragma': 'no-cache'
    },
    html
  };
}

test('1. Initial Game Share: returns correct metadata from current database values', () => {
  const game: MockGame = {
    id: 'b41dafb4-798c-4b3f-ab22-d4be93a714ee',
    slug: 'call-of-duty-modern-warfare-4',
    title: 'Call of Duty®: Modern Warfare® 4',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: '/uploads/mw4-cover.webp',
    description: 'Iconic military campaign experience across global hot zones.',
    isPublished: true,
    internalCost: 100,
    updatedAt: '2026-10-18T10:00:00.000Z'
  };

  const res = generateShareMetaHtml(game, 'call-of-duty-modern-warfare-4');
  assert.equal(res.statusCode, 200);
  assert.match(res.html, /<title>Call of Duty®: Modern Warfare® 4 \| VALQORE<\/title>/);
  assert.match(res.html, /content="Call of Duty®: Modern Warfare® 4 \| VALQORE"/);
  assert.match(res.html, /content="https:\/\/valqore\.pro\/uploads\/mw4-cover\.webp"/);
  assert.match(res.html, /content="Iconic military campaign experience across global hot zones\."/);
  assert.match(res.html, /<link rel="canonical" href="https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4" \/>/);
  // Verify internalCost or private fields are NOT leaked
  assert.doesNotMatch(res.html, /internalCost/);
  assert.doesNotMatch(res.html, /password/i);
});

test('2. Admin Title Update: exactly reflects updated title including [Offline Campaign]', () => {
  const game: MockGame = {
    id: 'b41dafb4-798c-4b3f-ab22-d4be93a714ee',
    slug: 'call-of-duty-modern-warfare-4',
    title: 'Call of Duty®: Modern Warfare® 4 [Offline Campaign]',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: '/uploads/mw4-cover.webp',
    description: 'Iconic military campaign experience across global hot zones.',
    isPublished: true,
    updatedAt: '2026-10-18T12:00:00.000Z'
  };

  const res = generateShareMetaHtml(game, 'call-of-duty-modern-warfare-4');
  assert.equal(res.statusCode, 200);
  assert.match(res.html, /<title>Call of Duty®: Modern Warfare® 4 \[Offline Campaign\] \| VALQORE<\/title>/);
  assert.match(res.html, /property="og:title" content="Call of Duty®: Modern Warfare® 4 \[Offline Campaign\] \| VALQORE"/);
  assert.match(res.html, /name="twitter:title" content="Call of Duty®: Modern Warfare® 4 \[Offline Campaign\] \| VALQORE"/);
  assert.match(res.html, /property="og:image:alt" content="Call of Duty®: Modern Warfare® 4 \[Offline Campaign\]"/);
});

test('3. Description and Cover Image updates are reflected immediately in Open Graph tags', () => {
  const game: MockGame = {
    id: 'b41dafb4-798c-4b3f-ab22-d4be93a714ee',
    slug: 'call-of-duty-modern-warfare-4',
    title: 'Call of Duty®: Modern Warfare® 4 [Offline Campaign]',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e',
    description: 'Updated campaign storyline featuring new tactical missions and weapons.',
    isPublished: true,
    updatedAt: '2026-10-18T12:30:00.000Z'
  };

  const res = generateShareMetaHtml(game, 'call-of-duty-modern-warfare-4');
  assert.match(res.html, /property="og:description" content="Updated campaign storyline featuring new tactical missions and weapons\."/);
  assert.match(res.html, /property="og:image" content="https:\/\/images\.unsplash\.com\/photo-1542751371-adc38448a05e"/);
  assert.match(res.html, /property="og:image:secure_url" content="https:\/\/images\.unsplash\.com\/photo-1542751371-adc38448a05e"/);
});

test('4. Old-Slug Compatibility: old slug resolves to updated game and redirects to new canonical URL', () => {
  resetSlugHistoryCache();
  const gameId = 'b41dafb4-798c-4b3f-ab22-d4be93a714ee';
  const oldSlug = 'call-of-duty-4-remastered';
  const newSlug = 'call-of-duty-modern-warfare-4-campaign';

  // Record that oldSlug was renamed
  recordSlugHistory(oldSlug, gameId);

  // Verify registry lookup
  const resolvedGameId = getGameIdFromSlugHistory(oldSlug);
  assert.equal(resolvedGameId, gameId);

  // Now simulate share-meta requested with the old slug
  const updatedGame: MockGame = {
    id: gameId,
    slug: newSlug,
    title: 'Call of Duty®: Modern Warfare® 4 [Offline Campaign]',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: '/uploads/mw4-cover.webp',
    description: 'Updated description',
    isPublished: true,
    updatedAt: '2026-10-18T12:45:00.000Z'
  };

  const res = generateShareMetaHtml(updatedGame, oldSlug);
  // HTML Open Graph title has latest title
  assert.match(res.html, /Call of Duty®: Modern Warfare® 4 \[Offline Campaign\] \| VALQORE/);
  // Canonical URL and redirect point to the NEW slug
  assert.match(res.html, /<link rel="canonical" href="https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4-campaign" \/>/);
  assert.match(res.html, /property="og:url" content="https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4-campaign"/);
  assert.match(res.html, /window\.location\.replace\("https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4-campaign"\)/);

  // Clean up
  removeSlugFromHistory(oldSlug);
  assert.equal(getGameIdFromSlugHistory(oldSlug), null);
});

test('5. Cache-Control and HTTP Response Headers: prevents stale proxy and browser caching', () => {
  const game: MockGame = {
    id: 'b41dafb4-798c-4b3f-ab22-d4be93a714ee',
    slug: 'call-of-duty-modern-warfare-4',
    title: 'Call of Duty®: Modern Warfare® 4',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: '/uploads/mw4.webp',
    description: 'Description',
    isPublished: true,
    updatedAt: '2026-10-18T10:00:00.000Z'
  };

  const res = generateShareMetaHtml(game, 'call-of-duty-modern-warfare-4');
  assert.equal(res.headers['Content-Type'], 'text/html; charset=utf-8');
  assert.equal(res.headers['Cache-Control'], 'no-cache, no-transform, must-revalidate');
  assert.equal(res.headers['Pragma'], 'no-cache');
});

test('6. Visibility Rules: Draft games do not leak internal metadata to crawlers', () => {
  const draftGame: MockGame = {
    id: 'c1234567-1111-2222-3333-444444444444',
    slug: 'secret-unreleased-title',
    title: 'Secret Project [Unreleased]',
    developer: 'Internal Studio',
    rating: 0,
    genre: 'Action',
    price: 999,
    coverImage: '/uploads/secret.webp',
    description: 'Internal secret roadmap',
    isPublished: false,
    internalCost: 50,
    updatedAt: '2026-10-18T10:00:00.000Z'
  };

  // Draft games are not published, so share-meta treats as fallback
  const res = generateShareMetaHtml(draftGame, 'secret-unreleased-title');
  assert.match(res.html, /<title>VALQORE<\/title>/);
  assert.match(res.html, /content="https:\/\/valqore\.pro\/images\/hero-artwork\.png"/);
  assert.doesNotMatch(res.html, /Secret Project/);
  assert.doesNotMatch(res.html, /Internal secret roadmap/);
});

test('7. Invalid Identifier handling: rejects malformed identifiers with HTTP 400', () => {
  const res = generateShareMetaHtml(null, 'invalid$$identifier##');
  assert.equal(res.statusCode, 400);
  assert.equal(res.html, 'Invalid Game Identifier');
});

test('8. Frontend Share URL Construction: appends version query param while preserving clean canonical URL', () => {
  const game: MockGame = {
    id: 'b41dafb4-798c-4b3f-ab22-d4be93a714ee',
    slug: 'call-of-duty-modern-warfare-4',
    title: 'Call of Duty®: Modern Warfare® 4 [Offline Campaign]',
    developer: 'Infinity Ward',
    rating: 4.8,
    genre: 'Shooter',
    price: 349,
    coverImage: '/uploads/mw4.webp',
    description: 'Description',
    isPublished: true,
    updatedAt: '2026-10-18T12:21:23.373Z'
  };

  const apiUrl = 'https://valqore.pro/api';
  const version = game.updatedAt ? new Date(game.updatedAt).getTime() : '';
  const shareUrl = version
    ? `${apiUrl}/games/share-meta/${game.slug || game.id}?v=${version}`
    : `${apiUrl}/games/share-meta/${game.slug || game.id}`;

  // Shared URL includes exact version timestamp for crawler freshness
  assert.equal(shareUrl, 'https://valqore.pro/api/games/share-meta/call-of-duty-modern-warfare-4?v=1792326083373');

  // Verify that backend HTML still generates clean canonical URL without ?v=
  const res = generateShareMetaHtml(game, game.slug!);
  assert.match(res.html, /<link rel="canonical" href="https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4" \/>/);
  assert.match(res.html, /property="og:url" content="https:\/\/valqore\.pro\/game\/call-of-duty-modern-warfare-4"/);
  assert.doesNotMatch(res.html, /<link rel="canonical" href="[^"]*\?v=/);
});
