import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';

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
    if (!userPayload.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { imageUrl } = req.body;
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      res.status(400).json({ error: 'Valid Image URL is required' });
      return;
    }

    const poster = await prisma.poster.create({
      data: {
        imageUrl
      }
    });
    
    res.status(201).json(poster);
  } catch (error) {
    console.error('[CREATE POSTER ERROR]', error);
    res.status(500).json({ error: 'Failed to create poster' });
  }
});

// Delete a poster
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    if (!userPayload.isAdmin) {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    const { id } = req.params;
    
    await prisma.poster.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('[DELETE POSTER ERROR]', error);
    res.status(500).json({ error: 'Failed to delete poster' });
  }
});

export default router;
