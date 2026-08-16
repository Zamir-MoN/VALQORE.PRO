import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Get current user's cart
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Admin cannot have a cart.' });
      return;
    }

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { game: true }
    });

    res.json(cartItems.map(item => item.game));
  } catch (error) {
    console.error('[GET CART ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// Add game to cart
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized. Admin cannot have a cart.' });
      return;
    }

    const { gameId } = req.body;
    if (!gameId) {
      res.status(400).json({ error: 'gameId is required' });
      return;
    }

    const cartItem = await prisma.cartItem.create({
      data: {
        userId,
        gameId
      },
      include: { game: true }
    });

    res.status(201).json(cartItem.game);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.status(400).json({ error: 'Game is already in cart' });
      return;
    }
    console.error('[ADD TO CART ERROR]', error);
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

// Remove game from cart
router.delete('/:gameId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { gameId } = req.params;

    await prisma.cartItem.deleteMany({
      where: {
        userId,
        gameId
      }
    });

    res.json({ message: 'Removed from cart' });
  } catch (error) {
    console.error('[REMOVE FROM CART ERROR]', error);
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

export default router;
