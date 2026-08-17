import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';
import { getIO } from '../socket';

const router = Router();

// Get all active posters
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const posters = await prisma.poster.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posters);
  } catch (error) {
    console.error('[GET POSTERS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch posters' });
  }
});

// Create a new poster
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    if (userPayload.userId) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { imageUrl, imageUrls } = req.body;
    
    // Support either single string or array of strings
    const urlsToProcess: string[] = [];
    if (imageUrls && Array.isArray(imageUrls)) {
      urlsToProcess.push(...imageUrls.filter(u => typeof u === 'string' && u.trim() !== ''));
    } else if (imageUrl && typeof imageUrl === 'string') {
      // Split by comma to allow comma-separated uploads from the single input
      const splitted = imageUrl.split(',').map((u: string) => u.trim()).filter(Boolean);
      urlsToProcess.push(...splitted);
    }
    
    if (urlsToProcess.length === 0) {
      res.status(400).json({ error: 'Valid Image URL(s) required' });
      return;
    }

    const createdPosters = await prisma.$transaction(
      urlsToProcess.map(url => prisma.poster.create({ data: { imageUrl: url } }))
    );
    
    getIO()?.emit('posters_updated');
    res.status(201).json(createdPosters);
  } catch (error) {
    console.error('[CREATE POSTER ERROR]', error);
    res.status(500).json({ error: 'Failed to create poster' });
  }
});

// Delete a poster
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    if (userPayload.userId) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    
    await prisma.poster.delete({
      where: { id }
    });
    
    getIO()?.emit('posters_updated');
    res.status(204).send();
  } catch (error) {
    console.error('[DELETE POSTER ERROR]', error);
    res.status(500).json({ error: 'Failed to delete poster' });
  }
});

export default router;
