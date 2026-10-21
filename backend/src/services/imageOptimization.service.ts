import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import crypto from 'crypto';
import dns from 'dns';
import http from 'http';
import https from 'https';
import axios from 'axios';

// SSRF Protection
const isPrivateIP = (ip: string): boolean => {
  if (ip.startsWith('::ffff:')) ip = ip.substring(7);
  const parts = ip.split('.');
  if (parts.length === 4) {
    const num0 = parseInt(parts[0], 10);
    const num1 = parseInt(parts[1], 10);
    if (num0 === 10 || num0 === 127 || num0 === 0) return true;
    if (num0 === 172 && num1 >= 16 && num1 <= 31) return true;
    if (num0 === 192 && num1 === 168) return true;
    if (num0 === 169 && num1 === 254) return true;
    return false;
  }
  if (ip.includes(':')) {
    const ipLower = ip.toLowerCase();
    if (ipLower === '::1') return true;
    if (ipLower.startsWith('fc') || ipLower.startsWith('fd')) return true;
    if (ipLower.startsWith('fe8') || ipLower.startsWith('fe9') || ipLower.startsWith('fea') || ipLower.startsWith('feb')) return true;
  }
  return false;
};

const secureLookup = (
  hostname: string,
  options: dns.LookupOptions,
  callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void
) => {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err, address, family);
    let ipToCheck = address as string;
    if (Array.isArray(address)) {
      if (address.length === 0) return callback(new Error('No addresses found'), address, family);
      ipToCheck = address[0].address;
    }
    if (isPrivateIP(ipToCheck)) {
      return callback(new Error(`SSRF Prevention: Resolved to private IP ${ipToCheck}`), address, family);
    }
    callback(null, address, family);
  });
};

const httpAgent = new http.Agent({ lookup: secureLookup as any });
const httpsAgent = new https.Agent({ lookup: secureLookup as any });

export const secureAxios = axios.create({
  httpAgent,
  httpsAgent,
  maxRedirects: 3,
  timeout: 10000,
  maxContentLength: 10 * 1024 * 1024 // 10MB limit
});

export const uploadDir = path.resolve(__dirname, '../../uploads');
export const tempDir = path.join(uploadDir, 'temp');
export const optimizedDir = path.join(uploadDir, 'optimized');
export const thumbnailsDir = path.join(uploadDir, 'thumbnails');
export const registryFile = path.join(uploadDir, 'external_optimized_registry.json');

// Ensure directories exist
[uploadDir, tempDir, optimizedDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export interface OptimizationRecord {
  sourceUrl: string;
  urlHash: string;
  optimizedUrl: string;
  thumbnailUrl: string;
  optimizedAt: string;
  fileSize?: number;
  status: 'SUCCESS' | 'FAILED';
  error?: string;
  lastAttemptAt: string;
  attemptCount: number;
}

// In-memory registry loaded from disk
const registry = new Map<string, OptimizationRecord>();

// Concurrency locking: deduplicates concurrent requests for the same image
const inFlightOptimizations = new Map<string, Promise<string | null>>();

// Load registry from disk
export const loadRegistry = (): void => {
  try {
    if (fs.existsSync(registryFile)) {
      const data = fs.readFileSync(registryFile, 'utf8');
      const parsed = JSON.parse(data);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [key, val] of Object.entries(parsed)) {
          registry.set(key, val as OptimizationRecord);
        }
      }
    }
  } catch (err) {
    console.error('[IMAGE OPTIMIZER] Failed to read registry from disk:', err);
  }
};

// Initial load
loadRegistry();

// Save registry to disk atomically
export const saveRegistry = (): void => {
  try {
    const obj: Record<string, OptimizationRecord> = {};
    for (const [key, val] of registry.entries()) {
      obj[key] = val;
    }
    const tempSavePath = `${registryFile}.tmp.${Date.now()}`;
    fs.writeFileSync(tempSavePath, JSON.stringify(obj, null, 2), 'utf8');
    fs.renameSync(tempSavePath, registryFile);
  } catch (err) {
    console.error('[IMAGE OPTIMIZER] Failed to save registry to disk:', err);
  }
};

export const normalizeUrl = (url: string): string => url.trim();

export const hashUrl = (url: string): string => {
  return crypto.createHash('sha256').update(normalizeUrl(url)).digest('hex');
};

/**
 * Checks if a URL points to an existing, verified local optimized WebP asset.
 * Prevents trusting arbitrary user-provided paths or filenames.
 */
export const verifyLocalOptimizedAsset = (url: string): { isVerified: boolean; canonicalUrl?: string } => {
  if (!url) return { isVerified: false };
  const trimmed = url.trim();

  // Allow static platform badges directly
  if (trimmed.startsWith('/badges/')) {
    return { isVerified: true, canonicalUrl: trimmed };
  }

  let pathname = trimmed;
  // If absolute URL, extract pathname
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const parsed = new URL(trimmed);
      pathname = parsed.pathname;
    } catch {
      return { isVerified: false };
    }
  }

  // Check if pathname matches /uploads/optimized/<filename>
  const match = pathname.match(/^\/uploads\/optimized\/([a-zA-Z0-9_\-]+\.webp)$/);
  if (!match) {
    return { isVerified: false };
  }

  const filename = match[1];
  const diskPath = path.join(optimizedDir, filename);

  // Security check: ensure path does not escape optimizedDir
  const relative = path.relative(optimizedDir, diskPath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return { isVerified: false };
  }

  if (fs.existsSync(diskPath)) {
    return { isVerified: true, canonicalUrl: `/uploads/optimized/${filename}` };
  }

  return { isVerified: false };
};

/**
 * Optimizes a single image buffer/file into WebP (max 1920px for optimized, max 400px for thumbnail)
 */
export const processImageBuffer = async (
  buffer: Buffer,
  baseFilename: string
): Promise<{ optimizedUrl: string; thumbnailUrl: string; fileSize: number }> => {
  const webpFilename = `${baseFilename}.webp`;
  const optimizedPath = path.join(optimizedDir, webpFilename);
  const thumbnailPath = path.join(thumbnailsDir, webpFilename);

  // If already exists on disk, reuse without overwriting
  if (fs.existsSync(optimizedPath) && fs.existsSync(thumbnailPath)) {
    const stats = fs.statSync(optimizedPath);
    return {
      optimizedUrl: `/uploads/optimized/${webpFilename}`,
      thumbnailUrl: `/uploads/thumbnails/${webpFilename}`,
      fileSize: stats.size
    };
  }

  const image = sharp(buffer);
  const metadata = await image.metadata();

  // Process optimized (max width 1920)
  let optPipeline = image.clone();
  if (metadata.width && metadata.width > 1920) {
    optPipeline = optPipeline.resize({ width: 1920, withoutEnlargement: true });
  }
  await optPipeline.webp({ quality: 80 }).toFile(optimizedPath);

  // Process thumbnail (max width 400)
  let thumbPipeline = image.clone();
  if (metadata.width && metadata.width > 400) {
    thumbPipeline = thumbPipeline.resize({ width: 400, withoutEnlargement: true });
  }
  await thumbPipeline.webp({ quality: 80 }).toFile(thumbnailPath);

  const stats = fs.statSync(optimizedPath);
  return {
    optimizedUrl: `/uploads/optimized/${webpFilename}`,
    thumbnailUrl: `/uploads/thumbnails/${webpFilename}`,
    fileSize: stats.size
  };
};

/**
 * Downloads and optimizes an external image URL.
 * Handles content-type inspection, Sharp decoding, and registry updating.
 */
const downloadAndOptimizeImage = async (url: string): Promise<string | null> => {
  const urlKey = hashUrl(url);
  const prevRecord = registry.get(urlKey);
  const attemptCount = (prevRecord?.attemptCount || 0) + 1;

  try {
    const response = await secureAxios.get(url, { responseType: 'arraybuffer' });
    const rawContentType = response.headers['content-type'];
    const contentType = typeof rawContentType === 'string' ? rawContentType.toLowerCase() : '';

    // Verify content type or allow binary/stream if Sharp can decode it
    const isImageHeader = contentType.startsWith('image/');
    const isOctetStream = contentType.startsWith('application/octet-stream') || contentType.startsWith('binary/data') || contentType === '';
    
    if (!isImageHeader && !isOctetStream) {
      console.error(`[IMAGE OPTIMIZER] Invalid content-type for ${url}: ${contentType}`);
      registry.set(urlKey, {
        sourceUrl: url,
        urlHash: urlKey,
        optimizedUrl: '',
        thumbnailUrl: '',
        optimizedAt: '',
        status: 'FAILED',
        error: `Invalid content type: ${contentType}`,
        lastAttemptAt: new Date().toISOString(),
        attemptCount
      });
      saveRegistry();
      return null;
    }

    const buffer = Buffer.from(response.data);
    // Use stable deterministic filename based on source URL hash to prevent duplicates
    const baseFilename = `ext-${urlKey.substring(0, 16)}`;

    const { optimizedUrl, thumbnailUrl, fileSize } = await processImageBuffer(buffer, baseFilename);

    registry.set(urlKey, {
      sourceUrl: url,
      urlHash: urlKey,
      optimizedUrl,
      thumbnailUrl,
      optimizedAt: new Date().toISOString(),
      fileSize,
      status: 'SUCCESS',
      lastAttemptAt: new Date().toISOString(),
      attemptCount
    });
    saveRegistry();

    return optimizedUrl;
  } catch (err: any) {
    console.error(`[IMAGE OPTIMIZER] Failed to process external URL ${url}:`, err.message || err);
    registry.set(urlKey, {
      sourceUrl: url,
      urlHash: urlKey,
      optimizedUrl: '',
      thumbnailUrl: '',
      optimizedAt: '',
      status: 'FAILED',
      error: err.message || String(err),
      lastAttemptAt: new Date().toISOString(),
      attemptCount
    });
    saveRegistry();
    return null;
  }
};

/**
 * Idempotently optimizes an external image URL.
 * - If verified local asset, reuses immediately.
 * - If previously optimized in registry, reuses cached WebP without downloading.
 * - If concurrent request is in-flight, awaits the shared promise.
 */
export const optimizeExternalUrl = async (url: string): Promise<string | null> => {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. Check if already a verified local optimized asset
  const localCheck = verifyLocalOptimizedAsset(trimmed);
  if (localCheck.isVerified && localCheck.canonicalUrl) {
    return localCheck.canonicalUrl;
  }

  // Only process http and https
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return null;
  }

  const urlKey = hashUrl(trimmed);

  // 2. Check persistent registry
  const cached = registry.get(urlKey);
  if (cached && cached.status === 'SUCCESS' && cached.optimizedUrl) {
    const filename = path.basename(cached.optimizedUrl);
    const diskPath = path.join(optimizedDir, filename);
    if (fs.existsSync(diskPath)) {
      return cached.optimizedUrl;
    }
  }

  // 3. Deduplicate in-flight requests (Concurrency locking)
  const existingPromise = inFlightOptimizations.get(urlKey);
  if (existingPromise) {
    return await existingPromise;
  }

  // 4. Launch new download & optimization
  const optimizationPromise = (async () => {
    try {
      return await downloadAndOptimizeImage(trimmed);
    } finally {
      inFlightOptimizations.delete(urlKey);
    }
  })();

  inFlightOptimizations.set(urlKey, optimizationPromise);
  return await optimizationPromise;
};

/**
 * Optimizes a batch of external URLs.
 * Deduplicates inputs within the batch and returns a map of { [url]: optimizedUrl | null }.
 */
export const optimizeExternalUrls = async (urls: string[]): Promise<Record<string, string | null>> => {
  const results: Record<string, string | null> = {};
  if (!Array.isArray(urls) || urls.length === 0) {
    return results;
  }

  // Deduplicate URLs in input
  const uniqueUrls = Array.from(new Set(urls.map(u => (typeof u === 'string' ? u.trim() : '')))).filter(Boolean);

  for (const url of uniqueUrls) {
    results[url] = await optimizeExternalUrl(url);
  }

  return results;
};

// Clear registry (helper for testing)
export const _clearRegistryForTests = (): void => {
  registry.clear();
  inFlightOptimizations.clear();
  try {
    if (fs.existsSync(registryFile)) {
      fs.unlinkSync(registryFile);
    }
  } catch {}
};

// Get registry copy (helper for testing / inspecting)
export const _getRegistryRecord = (url: string): OptimizationRecord | undefined => {
  return registry.get(hashUrl(url));
};
