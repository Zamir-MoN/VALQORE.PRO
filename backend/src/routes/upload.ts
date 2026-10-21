import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import dns from 'dns';
import http from 'http';
import https from 'https';
import axios from 'axios';
import { authMiddleware, isAdminMiddleware } from '../middleware/auth';

const isPrivateIP = (ip: string) => {
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

const secureLookup = (hostname: string, options: dns.LookupOptions, callback: (err: NodeJS.ErrnoException | null, address: any, family?: number) => void) => {
  dns.lookup(hostname, options, (err, address, family) => {
    if (err) return callback(err, address, family);
    let ipToCheck = address as string;
    if (Array.isArray(address)) {
      if (address.length === 0) return callback(new Error('No addresses found'), address, family);
      ipToCheck = address[0].address;
    }
    if (isPrivateIP(ipToCheck)) return callback(new Error(`SSRF Prevention: Resolved to private IP ${ipToCheck}`), address, family);
    callback(null, address, family);
  });
};

const httpAgent = new http.Agent({ lookup: secureLookup as any });
const httpsAgent = new https.Agent({ lookup: secureLookup as any });

const secureAxios = axios.create({
  httpAgent,
  httpsAgent,
  maxRedirects: 3,
  timeout: 10000,
  maxContentLength: 10 * 1024 * 1024 // 10MB
});

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
const tempDir = path.join(uploadDir, 'temp');
const optimizedDir = path.join(uploadDir, 'optimized');
const thumbnailsDir = path.join(uploadDir, 'thumbnails');

[uploadDir, tempDir, optimizedDir, thumbnailsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WEBP, and GIF are allowed.'));
  }
};

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter
});

const processImage = async (file: Express.Multer.File): Promise<string> => {
  const filenameWithoutExt = path.parse(file.filename).name;
  const webpFilename = `${filenameWithoutExt}.webp`;
  
  const optimizedPath = path.join(optimizedDir, webpFilename);
  const thumbnailPath = path.join(thumbnailsDir, webpFilename);
  
  try {
    const image = sharp(file.path);
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
    
    // Delete temp file
    fs.unlink(file.path, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });
    
    return `/uploads/optimized/${webpFilename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
};

router.post('/', authMiddleware, isAdminMiddleware, upload.single('image'), async (req, res) => {
  console.log('Received single upload request');
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  try {
    console.log('Processing image:', req.file.path);
    const imageUrl = await processImage(req.file);
    console.log('Image processed:', imageUrl);
    res.json({ url: imageUrl });
  } catch (error) {
    console.error('Failed to process image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Process multiple files with limited concurrency
router.post('/multiple', authMiddleware, isAdminMiddleware, upload.array('images', 30), async (req, res) => {
  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  try {
    const imageUrls: string[] = [];
    // Process sequentially to limit CPU/Memory usage, or chunks. For 30 images, sequential is safe and prevents spikes.
    for (const file of req.files) {
      const url = await processImage(file as Express.Multer.File);
      imageUrls.push(url);
    }
    res.json({ urls: imageUrls });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process images' });
  }
});

import { optimizeExternalUrls } from '../services/imageOptimization.service';

// Process multiple external urls securely and idempotently
router.post('/external', authMiddleware, isAdminMiddleware, async (req, res) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Missing urls array' });
  }

  try {
    const results = await optimizeExternalUrls(urls);
    res.json({ results });
  } catch (err: any) {
    console.error('[POST /upload/external ERROR]:', err);
    res.status(500).json({ error: 'Failed to process external images' });
  }
});

export default router;
