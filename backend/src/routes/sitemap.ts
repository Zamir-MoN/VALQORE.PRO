import express from 'express';
import { prisma } from '../prismaClient';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const games = await prisma.game.findMany({
      select: {
        id: true,
        slug: true,
      }
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://valqore.pro/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    games.forEach(game => {
      const urlPath = game.slug ? game.slug : game.id;
      // Properly escape XML entities
      const escapedPath = urlPath
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      xml += `
  <url>
    <loc>https://valqore.pro/game/${escapedPath}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += `
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) {
    console.error('Failed to generate sitemap:', err);
    res.status(500).send('Internal Server Error');
  }
});

export const sitemapRouter = router;
