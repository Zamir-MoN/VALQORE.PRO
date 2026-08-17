import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Create a new order (Checkout)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const { couponCode } = req.body;
    
    if (!userPayload.userId) {
      res.status(403).json({ error: 'Admins cannot place orders' });
      return;
    }

    // 1. Get all cart items for this user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userPayload.userId },
      include: { game: true }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // 2. Calculate total amount
    let totalAmount = cartItems.reduce((acc, item) => {
      return acc + (item.game.price * (1 - item.game.discount / 100));
    }, 0);

    // Fetch and validate coupon if provided
    let validCoupon = null;
    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });
      
      if (!validCoupon || !validCoupon.isActive) {
        res.status(400).json({ error: 'Invalid or expired coupon' });
        return;
      }
      
      if (validCoupon.usageLimit !== null && validCoupon.usageCount >= validCoupon.usageLimit) {
        res.status(400).json({ error: 'Coupon usage limit reached' });
        return;
      }
      
      totalAmount -= validCoupon.discount;
      if (totalAmount < 0) totalAmount = 0;
    }

    // 3. Create the order and order items in a transaction, and clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.userId,
          totalAmount,
          status: 'PENDING',
          items: {
            create: cartItems.map(item => ({
              gameId: item.gameId,
              pricePaid: item.game.price * (1 - item.game.discount / 100)
            }))
          }
        },
        include: { items: true }
      });

      // Clear the cart
      await tx.cartItem.deleteMany({
        where: { userId: userPayload.userId }
      });
      
      // Increment coupon usage count
      if (validCoupon) {
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usageCount: { increment: 1 } }
        });
      }

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('[CREATE ORDER ERROR]', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user's orders
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;

    if (!userPayload.userId) {
      // If admin, they could theoretically get all orders, but let's restrict for now
      res.status(403).json({ error: 'Admins do not have personal orders' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId: userPayload.userId },
      include: {
        items: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                developer: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    console.error('[GET ORDERS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Cancel a pending order
router.put('/:id/cancel', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const { id } = req.params;

    if (!userPayload.userId) {
      res.status(403).json({ error: 'Admins cannot cancel personal orders here' });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (order.userId !== userPayload.userId) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Only pending orders can be cancelled' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('[CANCEL ORDER ERROR]', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
