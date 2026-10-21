export interface ImageFields {
  coverImage: string;
  tagImage: string;
  screenshots: string[];
}

/**
 * Checks if a URL is an application-verified local optimized asset.
 * Accepts:
 * - Local static badges: '/badges/...'
 * - Local uploads: '/uploads/optimized/...'
 * - Full canonical URLs pointing to /uploads/optimized/ on our domain or current host
 *
 * NOTE: URLs ending in '.webp' from unknown external hosts are NOT considered trusted.
 */
export const isTrustedOptimizedUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Local static badges
  if (trimmed.startsWith('/badges/')) return true;

  // Local optimized upload path
  if (trimmed.startsWith('/uploads/optimized/')) return true;

  // Full URL pointing to our host's /uploads/optimized/
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.pathname.startsWith('/uploads/optimized/')) {
        const host = parsed.host.toLowerCase();
        const currentHost = typeof window !== 'undefined' ? window.location.host.toLowerCase() : '';
        if (
          host === currentHost ||
          host === 'valqore.pro' ||
          host === 'www.valqore.pro' ||
          host.includes('localhost') ||
          host.includes('127.0.0.1')
        ) {
          return true;
        }
      }
    } catch {
      return false;
    }
  }

  return false;
};

/**
 * Checks if a URL is an external image that requires optimization.
 * Returns true ONLY for external http/https URLs that are NOT already in our trusted storage.
 */
export const isExternalProcessable = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

  // Trusted local storage is already optimized
  if (isTrustedOptimizedUrl(trimmed)) return false;

  // Must be an external http/https URL
  return trimmed.startsWith('http://') || trimmed.startsWith('https://');
};

export interface FormImageInputs {
  coverImage: string;
  tagImage: string;
  screenshots: string;
  hasNewCoverFile?: boolean;
  hasNewTagFile?: boolean;
}

/**
 * Calculates the exact list of external URLs that actually need optimization during save.
 *
 * Rules:
 * - If editing and the image field is unchanged from initial load, SKIP IT ENTIRELY.
 * - If gallery screenshots were only reordered, SKIP THEM.
 * - If screenshots were removed, SKIP THEM.
 * - Only newly added or genuinely changed external images are returned.
 * - Local uploaded files (handled via multer) do not need external optimization.
 */
export const calculateExternalUrlsToProcess = (
  current: FormImageInputs,
  initial: ImageFields | null,
  isEditing: boolean
): string[] => {
  const urlsToProcess: string[] = [];

  const curCover = (current.coverImage || '').trim();
  const curTag = (current.tagImage || '').trim();
  const curScreenshots = (current.screenshots || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (isEditing && initial) {
    const initCover = (initial.coverImage || '').trim();
    const initTag = (initial.tagImage || '').trim();
    const initScreenshotsSet = new Set(initial.screenshots.map(s => s.trim()).filter(Boolean));

    // Cover Image: only process if genuinely changed from initial, no local file uploaded, and is external
    if (!current.hasNewCoverFile && curCover !== initCover && isExternalProcessable(curCover)) {
      urlsToProcess.push(curCover);
    }

    // Tag Image: only process if genuinely changed from initial, no local file uploaded, and is external
    if (!current.hasNewTagFile && curTag !== initTag && isExternalProcessable(curTag)) {
      urlsToProcess.push(curTag);
    }

    // Screenshots: only process screenshots that are NOT in the initial set (i.e. genuinely newly added)
    for (const shotUrl of curScreenshots) {
      if (!initScreenshotsSet.has(shotUrl) && isExternalProcessable(shotUrl)) {
        urlsToProcess.push(shotUrl);
      }
    }
  } else {
    // New game creation
    if (!current.hasNewCoverFile && isExternalProcessable(curCover)) {
      urlsToProcess.push(curCover);
    }
    if (!current.hasNewTagFile && isExternalProcessable(curTag)) {
      urlsToProcess.push(curTag);
    }
    for (const shotUrl of curScreenshots) {
      if (isExternalProcessable(shotUrl)) {
        urlsToProcess.push(shotUrl);
      }
    }
  }

  // Deduplicate and return
  return Array.from(new Set(urlsToProcess));
};

/**
 * Checks if ANY image-related field is dirty compared to initial snapshot.
 */
export const isImageStateDirty = (
  current: FormImageInputs,
  initial: ImageFields | null,
  isEditing: boolean
): boolean => {
  if (!isEditing || !initial) {
    return Boolean(
      current.hasNewCoverFile ||
      current.hasNewTagFile ||
      current.coverImage.trim() ||
      current.tagImage.trim() ||
      current.screenshots.trim()
    );
  }

  if (current.hasNewCoverFile || current.hasNewTagFile) return true;
  if ((current.coverImage || '').trim() !== (initial.coverImage || '').trim()) return true;
  if ((current.tagImage || '').trim() !== (initial.tagImage || '').trim()) return true;

  const curShots = (current.screenshots || '').split(',').map(s => s.trim()).filter(Boolean).join(',');
  const initShots = initial.screenshots.map(s => s.trim()).filter(Boolean).join(',');
  if (curShots !== initShots) return true;

  return false;
};
