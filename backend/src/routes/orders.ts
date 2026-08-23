import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';
import { createSteamMonUser, generateSecurePassword, grantGameAccess } from '../utils/steamMonService';

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

    let commissionEarned = null;
    if (validCoupon && validCoupon.commissionRate) {
      commissionEarned = (totalAmount * validCoupon.commissionRate) / 100;
    }

    // 3. Create the order and order items in a transaction, and clear cart
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.userId,
          totalAmount,
          status: 'PENDING',
          couponCode: validCoupon ? validCoupon.code : null,
          couponDiscount: validCoupon ? validCoupon.discount : null,
          commissionEarned: commissionEarned,
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

    // 4. Steam Mon Integration
    try {
      // Find games in this order that have a steamAppId
      const gamesWithSteamApp = cartItems.filter(item => item.game.steamAppId);
      
      if (gamesWithSteamApp.length > 0) {
        // Fetch the user from db to get current steamMon credentials
        const user = await prisma.user.findUnique({ where: { id: userPayload.userId } });
        
        let steamMonUsername = user?.steamMonUsername;
        let steamMonPassword = user?.steamMonPassword;

        if (!steamMonUsername || !steamMonPassword) {
           steamMonUsername = user?.username; // Use their Valqore.Pro username
           steamMonPassword = generateSecurePassword();

           // Update user in Valqore.Pro
           await prisma.user.update({
             where: { id: userPayload.userId },
             data: { steamMonUsername, steamMonPassword }
           });
        }

        // Create the user in Steam Mon (it safely handles if user already exists)
        const steamUser = await createSteamMonUser(steamMonUsername as string, steamMonPassword as string);

        // Grant access for each purchased game
        for (const item of gamesWithSteamApp) {
          if (item.game.steamAppId) {
            await grantGameAccess(steamUser.id, item.game.steamAppId);
          }
        }
      }
    } catch (steamErr) {
      console.error('[STEAM MON INTEGRATION ERROR]', steamErr);
      // We don't fail the order if Steam Mon sync fails, but we log it.
    }

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

// Get all orders for admin
router.get('/admin', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;

    // Check if user is admin (admin does not have a userId in the payload, only username)
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { search } = req.query;

    let whereClause: any = {};

    if (search && typeof search === 'string') {
      const searchStr = search.trim();
      // Check if it's a valid UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(searchStr)) {
        whereClause = { id: searchStr };
      } else {
        whereClause = {
          OR: [
            { user: { username: { contains: searchStr, mode: 'insensitive' } } },
            { user: { email: { contains: searchStr, mode: 'insensitive' } } },
            { items: { some: { game: { title: { contains: searchStr, mode: 'insensitive' } } } } }
          ]
        };
      }
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        },
        items: {
          include: {
            game: {
              select: {
                id: true,
                title: true,
                coverImage: true,
                price: true,
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
    console.error('[GET ADMIN ORDERS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch admin orders' });
  }
});

// Update order status (Admin)
router.put('/admin/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;

    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('[UPDATE ADMIN ORDER STATUS ERROR]', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

export default router;
