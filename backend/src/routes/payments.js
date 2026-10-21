"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const qrcode_1 = __importDefault(require("qrcode"));
const socket_1 = require("../socket");
const verification_service_1 = require("../services/verification.service");
const order_util_1 = require("../utils/order.util");
const router = (0, express_1.Router)();
// 1. Create Delta APay Checkout Session & Order
router.post('/create-session', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        const { couponCode } = req.body;
        if (!userPayload.userId) {
            res.status(403).json({ error: 'Admins cannot place orders' });
            return;
        }
        // Get user cart items
        const cartItems = await prismaClient_1.prisma.cartItem.findMany({
            where: { userId: userPayload.userId },
            include: { game: true }
        });
        if (cartItems.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }
        // Check if user has already purchased any of these cart games
        const gameIds = cartItems.map(item => item.gameId);
        const existingPurchases = await prismaClient_1.prisma.orderItem.findMany({
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
        await prismaClient_1.prisma.order.updateMany({
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
            validCoupon = await prismaClient_1.prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() }
            });
            if (!validCoupon || !validCoupon.isActive) {
                res.status(400).json({ error: 'Invalid or expired coupon' });
                return;
            }
            // Usage limit is now atomically validated inside the transaction
            totalAmount -= validCoupon.discount;
            if (totalAmount < 0)
                totalAmount = 0;
        }
        let commissionEarned = null;
        if (validCoupon && validCoupon.commissionRate) {
            commissionEarned = (totalAmount * validCoupon.commissionRate) / 100;
        }
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Create Order with PENDING status in transaction
        let order = null;
        let attempts = 0;
        while (attempts < 10 && !order) {
            attempts++;
            try {
                const generatedId = (0, order_util_1.generateOrderId)();
                order = await prismaClient_1.prisma.$transaction(async (tx) => {
                    const newOrder = await tx.order.create({
                        data: {
                            id: generatedId,
                            userId: userPayload.userId,
                            totalAmount,
                            status: 'PENDING',
                            paymentMethod: 'DELTA_PAY',
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
            }
            catch (err) {
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
        const qrCode = await qrcode_1.default.toDataURL(upiUri, {
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
    }
    catch (error) {
        if (error.message === 'COUPON_LIMIT_REACHED') {
            res.status(400).json({ error: 'Coupon usage limit reached or coupon deactivated' });
            return;
        }
        console.error('[DELTA PAY CREATE SESSION ERROR]', error);
        res.status(500).json({ error: 'Failed to create payment session' });
    }
});
// 2. Get Payment Details & Status
router.get('/:orderId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        const orderId = String(req.params.orderId);
        const order = await prismaClient_1.prisma.order.findUnique({
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
        const qrCode = await qrcode_1.default.toDataURL(upiUri, {
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
            items: order.items.map((item) => {
                const { internalCost, ...publicGame } = item.game;
                return { ...item, game: publicGame };
            })
        });
    }
    catch (error) {
        console.error('[GET PAYMENT DETAILS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
});
// 4. Cancel Pending Payment
router.post('/:orderId/cancel', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        const orderId = String(req.params.orderId);
        const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
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
        await prismaClient_1.prisma.order.update({
            where: { id: order.id },
            data: { status: 'CANCELLED' }
        });
        try {
            (0, socket_1.getIO)()?.emit(`payment_status_${order.id}`, { status: 'CANCELLED' });
            (0, socket_1.getIO)()?.emit('orders_updated');
        }
        catch (e) { }
        res.json({ success: true, message: 'Payment cancelled' });
    }
    catch (error) {
        console.error('[CANCEL PAYMENT ERROR]', error);
        res.status(500).json({ error: 'Failed to cancel payment' });
    }
});
// 5. Admin: Get all payments/transactions
router.get('/admin/all', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { status, search } = req.query;
        let whereClause = {};
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
        const payments = await prismaClient_1.prisma.order.findMany({
            where: whereClause,
            include: {
                user: { select: { id: true, username: true, email: true } },
                items: { include: { game: { select: { id: true, title: true, coverImage: true } } } },
                transaction: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payments);
    }
    catch (error) {
        console.error('[ADMIN GET PAYMENTS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});
// 6. Admin: Manually verify/approve payment
router.put('/admin/:orderId/verify', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const orderId = String(req.params.orderId);
        const { utr } = req.body;
        const order = await prismaClient_1.prisma.order.findUnique({ where: { id: orderId } });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        await prismaClient_1.prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'COMPLETED',
                submittedUtr: utr || order.submittedUtr || 'MANUAL-APPROVAL'
            }
        });
        try {
            (0, socket_1.getIO)()?.emit(`payment_status_${orderId}`, { status: 'COMPLETED' });
            (0, socket_1.getIO)()?.emit('orders_updated');
        }
        catch (e) { }
        await (0, verification_service_1.fulfillOrderSteamAccess)(orderId);
        res.json({ success: true, message: 'Payment manually approved and completed' });
    }
    catch (error) {
        console.error('[ADMIN VERIFY ERROR]', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map