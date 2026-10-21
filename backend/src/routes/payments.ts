import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware, isAdminMiddleware } from '../middleware/auth';
import QRCode from 'qrcode';

import { getIO } from '../socket';
import { fulfillOrderSteamAccess } from '../services/verification.service';

import { generateOrderId } from '../utils/order.util';

const router = Router();

// 1. Create Delta APay Checkout Session & Order
router.post('/create-session', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const { couponCode, termsAccepted, policyVersion } = req.body;

    if (!userPayload.userId) {
      res.status(403).json({ error: 'Admins cannot place orders' });
      return;
    }

    // Mandatory Terms of Service consent verification
    if (termsAccepted !== true) {
      res.status(400).json({ error: 'You must read and agree to the Terms of Service, including the Account Usage, Warranty & Support Policy, to proceed with checkout.' });
      return;
    }

    const currentPolicyVersion = policyVersion && typeof policyVersion === 'string' && policyVersion.trim().length > 0 
      ? policyVersion.trim() 
      : '2026-09-v1';

    // Get user cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userPayload.userId },
      include: { game: true }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Check if user has already purchased any of these cart games
    const gameIds = cartItems.map(item => item.gameId);
    const existingPurchases = await prisma.orderItem.findMany({
      where: {
        gameId: { in: gameIds },
        order: {
          userId: userPayload.userId,
          status: 'COMPLETED'
        }
      },
      include: { game: true }
    });

    if (existingPurchases.length > 0) {
      const ownedTitles = existingPurchases.map(p => p.game.title).join(', ');
      res.status(400).json({ error: `Already in your library: ${ownedTitles}` });
      return;
    }

    // Auto-cancel previous unpaid pending orders for this user to avoid multiple open pending orders
    await prisma.order.updateMany({
      where: {
        userId: userPayload.userId,
        status: 'PENDING'
      },
      data: {
        status: 'CANCELLED'
      }
    });

    // Calculate total amount
    let totalAmount = cartItems.reduce((acc, item) => {
      return acc + item.game.price;
    }, 0);

    // Validate coupon
    let validCoupon = null;
    if (couponCode) {
      validCoupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() }
      });

      if (!validCoupon || !validCoupon.isActive) {
        res.status(400).json({ error: 'Invalid or expired coupon' });
        return;
      }

      // Usage limit is now atomically validated inside the transaction

      totalAmount -= validCoupon.discount;
      if (totalAmount < 0) totalAmount = 0;
    }

    let commissionEarned = null;
    if (validCoupon && validCoupon.commissionRate) {
      commissionEarned = (totalAmount * validCoupon.commissionRate) / 100;
    }

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create Order with PENDING status in transaction
    let order: any = null;
    let attempts = 0;

    while (attempts < 10 && !order) {
      attempts++;
      try {
        const generatedId = generateOrderId();
        order = await prisma.$transaction(async (tx) => {
          const newOrder = await tx.order.create({
            data: {
              id: generatedId,
              userId: userPayload.userId,
              totalAmount,
              status: 'PENDING',
              paymentMethod: 'DELTA_PAY',
              termsAccepted: true,
              termsAcceptedAt: new Date(),
              termsVersion: currentPolicyVersion,
              expiresAt,
              couponCode: validCoupon ? validCoupon.code : null,
              couponDiscount: validCoupon ? validCoupon.discount : null,
              commissionEarned,
              items: {
                create: cartItems.map(item => ({
                  gameId: item.gameId,
                  pricePaid: item.game.price
                }))
              }
            },
            include: { items: { include: { game: true } } }
          });

          // Clear the cart
          await tx.cartItem.deleteMany({
            where: { userId: userPayload.userId }
          });

          if (validCoupon) {
            const result = await tx.coupon.updateMany({
              where: {
                id: validCoupon.id,
                isActive: true,
                OR: [
                  { usageLimit: null },
                  { usageCount: { lt: validCoupon.usageLimit } }
                ]
              },
              data: { usageCount: { increment: 1 } }
            });
            if (result.count === 0) {
              throw new Error('COUPON_LIMIT_REACHED');
            }
          }

          return newOrder;
        });
      } catch (err: any) {
        if (err.code === 'P2002' && attempts < 10) {
          console.warn(`[ORDER CREATE] Collision detected for Order ID. Retrying... (${attempts}/10)`);
          continue;
        }
        throw err;
      }
    }

    if (!order) {
      res.status(500).json({ error: 'Failed to generate unique Order ID after 10 attempts' });
      return;
    }

    const upiUri = `upi://pay?pa=valqore.pro.paul@fam&pn=Valqore&am=${order.totalAmount}&tn=${order.id}`;
    
    // Generate high resolution dark theme QR Code for sleek UI
    const qrCode = await QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      }
    });

    res.status(201).json({
      success: true,
      orderId: order.id,
      amount: order.totalAmount,
      upiUri,
      qrCode,
      expiresAt: order.expiresAt
    });
  } catch (error: any) {
    if (error.message === 'COUPON_LIMIT_REACHED') {
      res.status(400).json({ error: 'Coupon usage limit reached or coupon deactivated' });
      return;
    }
    console.error('[DELTA PAY CREATE SESSION ERROR]', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
});

// 2. Get Payment Details & Status
router.get('/:orderId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const orderId = String(req.params.orderId);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { game: true } }
      }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (userPayload.userId && order.userId !== userPayload.userId) {
      res.status(403).json({ error: 'Unauthorized access to this order' });
      return;
    }

    const upiUri = `upi://pay?pa=valqore.pro.paul@fam&pn=Valqore&am=${order.totalAmount}&tn=${order.id}`;
    
    const qrCode = await QRCode.toDataURL(upiUri, {
      width: 400,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      }
    });

    res.json({
      orderId: order.id,
      status: order.status,
      amount: order.totalAmount,
      upiUri,
      qrCode,
      submittedUtr: order.submittedUtr,
      items: (order as any).items.map((item: any) => {
        const { internalCost, ...publicGame } = item.game;
        return { ...item, game: publicGame };
      })
    });
  } catch (error) {
    console.error('[GET PAYMENT DETAILS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

// 3. Submit UTR Manually
router.post('/:orderId/submit-utr', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const orderId = String(req.params.orderId);
    const { utr } = req.body;

    if (!utr || typeof utr !== 'string' || utr.trim().length !== 12) {
      res.status(400).json({ error: 'Please enter a valid 12-digit UTR number' });
      return;
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.status !== 'PENDING') {
      res.status(400).json({ error: 'Invalid or already processed order' });
      return;
    }

    if (order.userId !== userPayload.userId) {
      res.status(403).json({ error: 'Unauthorized access to this order' });
      return;
    }

    // 1. Check if ANY order (pending or completed) has already claimed this UTR
    const existingClaim = await prisma.order.findFirst({
      where: { submittedUtr: utr }
    });
    if (existingClaim && existingClaim.id !== order.id) {
      res.status(400).json({ error: 'This UTR has already been claimed by another order' });
      return;
    }

    // Check if the transaction with this UTR and exact amount already exists
    const transaction = await prisma.transaction.findUnique({
      where: { utr }
    });

    if (transaction) {
      // 2. Check if transaction is already linked to an order
      if (transaction.orderId && transaction.orderId !== order.id) {
        res.status(400).json({ error: 'This UTR has already been processed and linked to another order' });
        return;
      }
      if (Math.abs(transaction.amount - order.totalAmount) <= 0.01) {
        // Amount matches! Process it immediately
        await prisma.$transaction(async (tx) => {
          await tx.transaction.update({
            where: { id: transaction.id },
            data: { orderId: order.id }
          });

          await tx.order.update({
            where: { id: order.id },
            data: { status: 'COMPLETED', submittedUtr: utr }
          });
        });

        await fulfillOrderSteamAccess(order.id);

        try {
          getIO()?.emit(`payment_status_${order.id}`, { status: 'COMPLETED' });
        } catch (e) {}

        res.json({ success: true, message: 'Payment verified instantly!' });
        return;
      } else {
        res.status(400).json({ error: `UTR found but amount mismatch. Expected ₹${order.totalAmount}, found ₹${transaction.amount}` });
        return;
      }
    }

    // Transaction not found yet. Save UTR to order so cron can find it later
    await prisma.order.update({
      where: { id: order.id },
      data: { submittedUtr: utr }
    });

    res.json({ success: true, message: 'UTR submitted successfully. Waiting for bank sync...' });
  } catch (error) {
    console.error('[SUBMIT UTR ERROR]', error);
    res.status(500).json({ error: 'Failed to submit UTR' });
  }
});


// 4. Cancel Pending Payment
router.post('/:orderId/cancel', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const orderId = String(req.params.orderId);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (userPayload.userId && order.userId !== userPayload.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.status(400).json({ error: 'Cannot cancel a completed order' });
      return;
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { status: 'CANCELLED' }
    });

    try {
      getIO()?.emit(`payment_status_${order.id}`, { status: 'CANCELLED' });
      getIO()?.emit('orders_updated');
    } catch (e) {}

    res.json({ success: true, message: 'Payment cancelled' });
  } catch (error) {
    console.error('[CANCEL PAYMENT ERROR]', error);
    res.status(500).json({ error: 'Failed to cancel payment' });
  }
});

// 5. Admin: Get all payments/transactions
router.get('/admin/all', authMiddleware, isAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {

    const { status, search } = req.query;

    let whereClause: any = {};
    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (search && typeof search === 'string') {
      const searchStr = search.trim();
      whereClause.OR = [
        { purpose: { contains: searchStr, mode: 'insensitive' } },
        { submittedUtr: { contains: searchStr, mode: 'insensitive' } },
        { user: { username: { contains: searchStr, mode: 'insensitive' } } },
        { user: { email: { contains: searchStr, mode: 'insensitive' } } }
      ];
    }

    const payments = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, username: true, email: true } },
        items: { include: { game: { select: { id: true, title: true, coverImage: true } } } },
        transaction: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    console.error('[ADMIN GET PAYMENTS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// 6. Admin: Manually verify/approve payment
router.put('/admin/:orderId/verify', authMiddleware, isAdminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {

    const orderId = String(req.params.orderId);
    const { utr } = req.body;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'COMPLETED',
        submittedUtr: utr || order.submittedUtr || 'MANUAL-APPROVAL'
      }
    });

    try {
      getIO()?.emit(`payment_status_${orderId}`, { status: 'COMPLETED' });
      getIO()?.emit('orders_updated');
    } catch (e) {}

    await fulfillOrderSteamAccess(orderId);

    res.json({ success: true, message: 'Payment manually approved and completed' });
  } catch (error) {
    console.error('[ADMIN VERIFY ERROR]', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

export default router;
