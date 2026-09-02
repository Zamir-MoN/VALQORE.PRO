import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';
import QRCode from 'qrcode';
import rateLimit from 'express-rate-limit';
import { getIO } from '../socket';
import { fulfillOrderSteamAccess } from '../services/verification.service';

const confirmLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many verification attempts, please try again later.' }
});

const router = Router();

function generatePurpose() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'DX-';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 1. Create Delta APay Checkout Session & Order
router.post('/create-session', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const { couponCode } = req.body;

    if (!userPayload.userId) {
      res.status(403).json({ error: 'Admins cannot place orders' });
      return;
    }

    // Get user cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: userPayload.userId },
      include: { game: true }
    });

    if (cartItems.length === 0) {
      res.status(400).json({ error: 'Cart is empty' });
      return;
    }

    // Calculate total amount
    let totalAmount = cartItems.reduce((acc, item) => {
      return acc + (item.game.price * (1 - item.game.discount / 100));
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

    const purpose = generatePurpose();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Create Order with PENDING status in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userPayload.userId,
          totalAmount,
          status: 'PENDING',
          purpose,
          paymentMethod: 'DELTA_PAY',
          expiresAt,
          couponCode: validCoupon ? validCoupon.code : null,
          couponDiscount: validCoupon ? validCoupon.discount : null,
          commissionEarned,
          items: {
            create: cartItems.map(item => ({
              gameId: item.gameId,
              pricePaid: item.game.price * (1 - item.game.discount / 100)
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
        await tx.coupon.update({
          where: { id: validCoupon.id },
          data: { usageCount: { increment: 1 } }
        });
      }

      return newOrder;
    });

    const upiUri = `upi://pay?pa=20-delta-mondal@fam&pn=Delta%20X&mc=0000&am=${order.totalAmount}&tn=${purpose}&tr=${purpose}&cu=INR`;
    
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
      purpose,
      upiUri,
      qrCode,
      expiresAt: order.expiresAt
    });
  } catch (error) {
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

    const purpose = order.purpose || generatePurpose();
    const upiUri = `upi://pay?pa=20-delta-mondal@fam&pn=Delta%20X&mc=0000&am=${order.totalAmount}&tn=${purpose}&tr=${purpose}&cu=INR`;
    
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
      purpose,
      upiUri,
      qrCode,
      submittedUtr: order.submittedUtr,
      items: (order as any).items
    });
  } catch (error) {
    console.error('[GET PAYMENT DETAILS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch payment details' });
  }
});

// 3. Confirm Payment via 12-digit UTR
router.post('/:orderId/confirm', authMiddleware, confirmLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const orderId = String(req.params.orderId);
    const { utr } = req.body;

    if (!utr || typeof utr !== 'string' || !/^\d{12}$/.test(utr.trim())) {
      res.status(400).json({ error: 'Valid 12-digit UTR is required' });
      return;
    }

    const cleanUtr = utr.trim();

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    if (userPayload.userId && order.userId !== userPayload.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    if (order.status === 'COMPLETED') {
      res.json({ success: true, message: 'Order is already paid and completed!' });
      return;
    }

    if (order.status !== 'PENDING') {
      res.status(400).json({ error: 'Order is no longer pending' });
      return;
    }

    // Check if Transaction already registered by email
    const transaction = await prisma.transaction.findUnique({
      where: { utr: cleanUtr }
    });

    if (transaction) {
      if (transaction.orderId && transaction.orderId !== order.id) {
        res.status(400).json({ error: 'This UTR has already been used for another order' });
        return;
      }

      if (Math.abs(transaction.amount - order.totalAmount) > 0.01) {
        res.status(400).json({ error: `Amount mismatch. Expected ₹${order.totalAmount}, got ₹${transaction.amount}` });
        return;
      }

      // Match found! Complete order immediately
      await prisma.$transaction(async (tx) => {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: { orderId: order.id }
        });

        await tx.order.update({
          where: { id: order.id },
          data: { status: 'COMPLETED', submittedUtr: cleanUtr }
        });
      });

      // Emit live WebSocket update
      try {
        getIO()?.emit(`payment_status_${order.id}`, { status: 'COMPLETED' });
        getIO()?.emit('orders_updated');
      } catch (e) {}

      // Fulfill Steam Mon Account
      await fulfillOrderSteamAccess(order.id);

      res.json({ success: true, message: 'Payment verified successfully!' });
      return;
    }

    // If transaction doesn't exist yet in DB:
    const existingOrderWithUtr = await prisma.order.findFirst({
      where: { submittedUtr: cleanUtr, id: { not: order.id } }
    });

    if (existingOrderWithUtr) {
      res.status(400).json({ error: 'This UTR has already been submitted for another order' });
      return;
    }

    // Save UTR on order waiting for bank notification
    await prisma.order.update({
      where: { id: order.id },
      data: { submittedUtr: cleanUtr }
    });

    res.json({ success: true, pending: true, message: 'UTR submitted! Verifying with bank...' });
  } catch (error) {
    console.error('[CONFIRM PAYMENT ERROR]', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
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

export default router;
