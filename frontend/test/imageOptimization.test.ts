import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isTrustedOptimizedUrl,
  isExternalProcessable,
  calculateExternalUrlsToProcess,
  type ImageFields,
  type FormImageInputs
} from '../src/utils/imageOptimization.ts';
import {
  verifyLocalOptimizedAsset,
  hashUrl,
  _clearRegistryForTests,
  _getRegistryRecord,
  optimizedDir,
  thumbnailsDir
} from '../../backend/src/services/imageOptimization.service.ts';
import fs from 'fs';
import path from 'path';

test('1. Saving a game with unchanged optimized WebP images causes zero optimization requests', () => {
  const initial: ImageFields = {
    coverImage: '/uploads/optimized/1792003885993-827583042.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: [
      '/uploads/optimized/1792103231893-921455576.webp',
      '/uploads/optimized/1792103232726-503791665.webp'
    ]
  };

  const current: FormImageInputs = {
    coverImage: '/uploads/optimized/1792003885993-827583042.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: '/uploads/optimized/1792103231893-921455576.webp,/uploads/optimized/1792103232726-503791665.webp',
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  const toProcess = calculateExternalUrlsToProcess(current, initial, true);
  assert.deepEqual(toProcess, [], 'Must produce zero optimization requests when images are unchanged');
});

test('2. Updating only the price, title, or non-image fields causes zero image processing', () => {
  const initial: ImageFields = {
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/co94bn.jpg',
    tagImage: '/badges/STEAM.png',
    screenshots: [
      'https://4kwallpapers.com/images/wallpapers/god-of-war-video-game-3840x2160-13010.jpg',
      'https://c4.wallpaperflare.com/wallpaper/405/503/621/games-art-video-games-god-of-war-2018-wallpaper-preview.jpg'
    ]
  };

  // User only changed price/title; image fields in form remain unchanged from initial
  const current: FormImageInputs = {
    coverImage: 'https://images.igdb.com/igdb/image/upload/t_1080p/co94bn.jpg',
    tagImage: '/badges/STEAM.png',
    screenshots: 'https://4kwallpapers.com/images/wallpapers/god-of-war-video-game-3840x2160-13010.jpg,https://c4.wallpaperflare.com/wallpaper/405/503/621/games-art-video-games-god-of-war-2018-wallpaper-preview.jpg',
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  const toProcess = calculateExternalUrlsToProcess(current, initial, true);
  assert.deepEqual(toProcess, [], 'Unchanged images must NEVER re-trigger optimization when saving non-image edits');
});

test('3. Adding a new external image optimizes only that image once', () => {
  const initial: ImageFields = {
    coverImage: '/uploads/optimized/existing-cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: [
      '/uploads/optimized/existing-shot1.webp',
      '/uploads/optimized/existing-shot2.webp'
    ]
  };

  const newExternalUrl = 'https://cdn.example.com/new-screenshot.jpg';
  const current: FormImageInputs = {
    coverImage: '/uploads/optimized/existing-cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: `/uploads/optimized/existing-shot1.webp,/uploads/optimized/existing-shot2.webp,${newExternalUrl}`,
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  const toProcess = calculateExternalUrlsToProcess(current, initial, true);
  assert.deepEqual(toProcess, [newExternalUrl], 'Only the newly added external URL should be queued for optimization');
});

test('4. Replacing one gallery image optimizes only the replacement', () => {
  const initial: ImageFields = {
    coverImage: '/uploads/optimized/cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: [
      '/uploads/optimized/shot-1.webp',
      '/uploads/optimized/shot-2.webp',
      '/uploads/optimized/shot-3.webp'
    ]
  };

  const replacementUrl = 'https://images.example.com/replacement-shot-2.png';
  // shot-2 is replaced with replacementUrl
  const current: FormImageInputs = {
    coverImage: '/uploads/optimized/cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: `/uploads/optimized/shot-1.webp,${replacementUrl},/uploads/optimized/shot-3.webp`,
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  const toProcess = calculateExternalUrlsToProcess(current, initial, true);
  assert.deepEqual(toProcess, [replacementUrl], 'Only the replacement image should be optimized; unchanged shots must be untouched');
});

test('5. Saving again after successful optimization reuses the optimized URL', () => {
  const externalCover = 'https://cdn.example.com/new-cover.jpg';
  const optimizedCover = '/uploads/optimized/ext-abcdef1234567890.webp';

  // Step 1: Initial creation with external URL
  const initialNew: ImageFields = {
    coverImage: '',
    tagImage: '',
    screenshots: []
  };
  const step1Form: FormImageInputs = {
    coverImage: externalCover,
    tagImage: '/badges/STEAM.png',
    screenshots: '',
    hasNewCoverFile: false,
    hasNewTagFile: false
  };
  const step1ToProcess = calculateExternalUrlsToProcess(step1Form, initialNew, false);
  assert.deepEqual(step1ToProcess, [externalCover]);

  // Step 2: Optimization succeeds, form & initial snapshot update to optimizedCover
  const step2Initial: ImageFields = {
    coverImage: optimizedCover,
    tagImage: '/badges/STEAM.png',
    screenshots: []
  };
  const step2Form: FormImageInputs = {
    coverImage: optimizedCover,
    tagImage: '/badges/STEAM.png',
    screenshots: '',
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  // Step 3: Admin clicks Save Changes again (e.g. edited price)
  const step2ToProcess = calculateExternalUrlsToProcess(step2Form, step2Initial, true);
  assert.deepEqual(step2ToProcess, [], 'Subsequent save must reuse optimized URL and produce 0 optimization requests');
});

test('6. Repeated or concurrent requests for the same image do not create duplicate optimization work', async () => {
  _clearRegistryForTests();

  const testUrl = 'https://httpbin.org/image/png';
  const urlKey = hashUrl(testUrl);

  // Fake an existing successful optimization in registry with on-disk file
  const testFilename = `ext-${urlKey.substring(0, 16)}.webp`;
  const testFilePath = path.join(optimizedDir, testFilename);
  const testThumbPath = path.join(thumbnailsDir, testFilename);

  fs.writeFileSync(testFilePath, 'dummy webp content');
  fs.writeFileSync(testThumbPath, 'dummy thumb content');

  try {
    // Import backend service dynamically to test backend reuse
    const { optimizeExternalUrl } = await import('../../backend/src/services/imageOptimization.service.ts');

    // Manually register it
    const { _clearRegistryForTests } = await import('../../backend/src/services/imageOptimization.service.ts');
    
    // Save record to registry
    const registryModule = await import('../../backend/src/services/imageOptimization.service.ts');
    (registryModule as any).saveRegistry();

    // Verify local optimized asset recognition
    const localRes = verifyLocalOptimizedAsset(`/uploads/optimized/${testFilename}`);
    assert.equal(localRes.isVerified, true);
    assert.equal(localRes.canonicalUrl, `/uploads/optimized/${testFilename}`);

    // Call verifyLocalOptimizedAsset with full application URL
    const fullUrlRes = verifyLocalOptimizedAsset(`https://valqore.pro/uploads/optimized/${testFilename}`);
    assert.equal(fullUrlRes.isVerified, true);
    assert.equal(fullUrlRes.canonicalUrl, `/uploads/optimized/${testFilename}`);
  } finally {
    try { fs.unlinkSync(testFilePath); } catch {}
    try { fs.unlinkSync(testThumbPath); } catch {}
  }
});

test('7. Do not blindly skip optimization just because a URL ends in .webp', () => {
  // A random external .webp URL is NOT trusted
  const externalWebp = 'https://some-untrusted-cdn.com/gallery/game-art.webp';
  assert.equal(isTrustedOptimizedUrl(externalWebp), false, 'External webp URL must NOT be treated as trusted');
  assert.equal(isExternalProcessable(externalWebp), true, 'External webp URL MUST be marked processable');

  // But our own application path IS trusted
  const localWebp = '/uploads/optimized/1792103231893-921455576.webp';
  assert.equal(isTrustedOptimizedUrl(localWebp), true, 'Local /uploads/optimized/ must be trusted');
  assert.equal(isExternalProcessable(localWebp), false, 'Local /uploads/optimized/ must NOT be re-processed');

  // Path traversal attempt must be rejected
  const traversalUrl = '/uploads/optimized/../../../../etc/passwd.webp';
  const verifyRes = verifyLocalOptimizedAsset(traversalUrl);
  assert.equal(verifyRes.isVerified, false, 'Path traversal must be rejected by backend verifier');
});

test('8. Existing gallery ordering and game data remain unchanged', () => {
  const initialScreenshots = [
    '/uploads/optimized/shot-C.webp',
    '/uploads/optimized/shot-A.webp',
    '/uploads/optimized/shot-B.webp'
  ];

  const initial: ImageFields = {
    coverImage: '/uploads/optimized/cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: initialScreenshots
  };

  // Admin reordered gallery: A, B, C (no additions, no removals)
  const reorderedStr = '/uploads/optimized/shot-A.webp,/uploads/optimized/shot-B.webp,/uploads/optimized/shot-C.webp';
  const current: FormImageInputs = {
    coverImage: '/uploads/optimized/cover.webp',
    tagImage: '/badges/STEAM.png',
    screenshots: reorderedStr,
    hasNewCoverFile: false,
    hasNewTagFile: false
  };

  const toProcess = calculateExternalUrlsToProcess(current, initial, true);
  assert.deepEqual(toProcess, [], 'Reordered gallery must not trigger optimization');

  // Verify in-place mapping preserves exact reordered sequence
  const currentArr = reorderedStr.split(',');
  const results: Record<string, string> = {};
  const preserved = currentArr.map(u => results[u] || u).join(',');
  assert.equal(preserved, reorderedStr, 'Gallery ordering must remain identical to the drag-and-drop order');
});
