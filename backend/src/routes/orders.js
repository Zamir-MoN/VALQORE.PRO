"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const steamMonService_1 = require("../utils/steamMonService");
const order_util_1 = require("../utils/order.util");
const router = (0, express_1.Router)();
// Create a new order (Checkout)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        const { couponCode } = req.body;
        if (!userPayload.userId) {
            res.status(403).json({ error: 'Admins cannot place orders' });
            return;
        }
        // 1. Get all cart items for this user
        const cartItems = await prismaClient_1.prisma.cartItem.findMany({
            where: { userId: userPayload.userId },
            include: { game: true }
        });
        if (cartItems.length === 0) {
            res.status(400).json({ error: 'Cart is empty' });
            return;
        }
        // 2. Calculate total amount
        let totalAmount = cartItems.reduce((acc, item) => {
            return acc + item.game.price;
        }, 0);
        // Fetch and validate coupon if provided
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
        // 3. Create the order and order items in a transaction, and clear cart
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
                            couponCode: validCoupon ? validCoupon.code : null,
                            couponDiscount: validCoupon ? validCoupon.discount : null,
                            commissionEarned: commissionEarned,
                            items: {
                                create: cartItems.map(item => ({
                                    gameId: item.gameId,
                                    pricePaid: item.game.price
                                }))
                            }
                        },
                        include: { items: true }
                    });
                    // Clear the cart
                    await tx.cartItem.deleteMany({
                        where: { userId: userPayload.userId }
                    });
                    // Increment coupon usage count atomically
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
        // 4. Steam Mon Integration
        try {
            // Find games in this order that have a steamAppId
            const gamesWithSteamApp = cartItems.filter(item => item.game.steamAppId);
            if (gamesWithSteamApp.length > 0) {
                // Fetch the user from db to get current steamMon credentials
                const user = await prismaClient_1.prisma.user.findUnique({ where: { id: userPayload.userId } });
                let steamMonUsername = user?.steamMonUsername;
                let steamMonPassword = user?.steamMonPassword;
                if (!steamMonUsername || !steamMonPassword) {
                    steamMonUsername = user?.username; // Use their Valqore.Pro username
                    steamMonPassword = (0, steamMonService_1.generateSecurePassword)();
                    // Update user in Valqore.Pro
                    await prismaClient_1.prisma.user.update({
                        where: { id: userPayload.userId },
                        data: { steamMonUsername, steamMonPassword }
                    });
                }
                // Create the user in Steam Mon (it safely handles if user already exists)
                const steamUser = await (0, steamMonService_1.createSteamMonUser)(steamMonUsername, steamMonPassword);
                // Grant access for each purchased game
                for (const item of gamesWithSteamApp) {
                    if (item.game.steamAppId) {
                        await (0, steamMonService_1.grantGameAccess)(steamUser.id, item.game.steamAppId);
                    }
                }
            }
        }
        catch (steamErr) {
            console.error('[STEAM MON INTEGRATION ERROR]', steamErr);
            // We don't fail the order if Steam Mon sync fails, but we log it.
        }
        res.status(201).json(order);
    }
    catch (error) {
        if (error.message === 'COUPON_LIMIT_REACHED') {
            res.status(400).json({ error: 'Coupon usage limit reached or coupon deactivated' });
            return;
        }
        console.error('[CREATE ORDER ERROR]', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
});
// Get user's orders
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        if (!userPayload.userId) {
            // If admin, they could theoretically get all orders, but let's restrict for now
            res.status(403).json({ error: 'Admins do not have personal orders' });
            return;
        }
        const orders = await prismaClient_1.prisma.order.findMany({
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
    }
    catch (error) {
        console.error('[GET ORDERS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});
// Cancel a pending order
router.put('/:id/cancel', auth_1.authMiddleware, async (req, res) => {
    try {
        const userPayload = req.user;
        const { id } = req.params;
        if (!userPayload.userId) {
            res.status(403).json({ error: 'Admins cannot cancel personal orders here' });
            return;
        }
        const order = await prismaClient_1.prisma.order.findUnique({
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
        const updatedOrder = await prismaClient_1.prisma.order.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('[CANCEL ORDER ERROR]', error);
        res.status(500).json({ error: 'Failed to cancel order' });
    }
});
// Get all orders for admin
router.get('/admin', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { search } = req.query;
        let whereClause = {};
        if (search && typeof search === 'string') {
            const searchStr = search.trim();
            // Check if it's a valid Order ID (VPXXXXXXXX)
            const orderIdRegex = /^VP[A-F0-9]{8}$/i;
            if (orderIdRegex.test(searchStr)) {
                whereClause = { id: searchStr };
            }
            else {
                whereClause = {
                    OR: [
                        { user: { username: { contains: searchStr, mode: 'insensitive' } } },
                        { user: { email: { contains: searchStr, mode: 'insensitive' } } },
                        { items: { some: { game: { title: { contains: searchStr, mode: 'insensitive' } } } } }
                    ]
                };
            }
        }
        const orders = await prismaClient_1.prisma.order.findMany({
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
    }
    catch (error) {
        console.error('[GET ADMIN ORDERS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch admin orders' });
    }
});
// Update order status (Admin)
router.put('/admin/:id/status', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await prismaClient_1.prisma.order.findUnique({
            where: { id }
        });
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        const updatedOrder = await prismaClient_1.prisma.order.update({
            where: { id },
            data: { status }
        });
        res.json(updatedOrder);
    }
    catch (error) {
        console.error('[UPDATE ADMIN ORDER STATUS ERROR]', error);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});
// Delete all orders (Admin)
router.delete('/admin/all', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        // Delete all OrderItems first (if cascade isn't working natively on their DB)
        await prismaClient_1.prisma.orderItem.deleteMany({});
        // Delete all Orders
        await prismaClient_1.prisma.order.deleteMany({});
        res.json({ message: 'All orders deleted successfully' });
    }
    catch (error) {
        console.error('[DELETE ALL ORDERS ERROR]', error);
        res.status(500).json({ error: 'Failed to delete all orders' });
    }
});
exports.default = router;
//# sourceMappingURL=orders.js.map