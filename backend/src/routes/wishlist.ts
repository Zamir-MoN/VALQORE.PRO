import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get current user's wishlist
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Admin cannot have a wishlist.' });
      return;
    }

    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId },
      include: { game: true }
    });

    res.json(wishlistItems.map(item => item.game));
  } catch (error) {
    console.error('[GET WISHLIST ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add game to wishlist
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Admin cannot have a wishlist.' });
      return;
    }

    const { gameId } = req.body;
    if (!gameId) {
      res.status(400).json({ error: 'gameId is required' });
      return;
    }

    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId,
        gameId
      },
      include: { game: true }
    });

    res.status(201).json(wishlistItem.game);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Game is already in wishlist' });
      return;
    }
    console.error('[ADD TO WISHLIST ERROR]', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove game from wishlist
router.delete('/:gameId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { gameId } = req.params;

    await prisma.wishlistItem.deleteMany({
      where: {
        userId,
        gameId
      }
    });

    res.json({ message: 'Removed from wishlist' });
  } catch (error) {
    console.error('[REMOVE FROM WISHLIST ERROR]', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
