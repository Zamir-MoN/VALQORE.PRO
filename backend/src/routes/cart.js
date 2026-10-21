"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get current user's cart
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized. Admin cannot have a cart.' });
            return;
        }
        const cartItems = await prismaClient_1.prisma.cartItem.findMany({
            where: { userId },
            include: { game: true }
        });
        res.json(cartItems.map(item => {
            const { internalCost, ...publicGame } = item.game;
            return publicGame;
        }));
    }
    catch (error) {
        console.error('[GET CART ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});
// Add game to cart
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized. Admin cannot have a cart.' });
            return;
        }
        const { gameId } = req.body;
        if (!gameId) {
            res.status(400).json({ error: 'gameId is required' });
            return;
        }
        // Check if user has already purchased this game in a COMPLETED order
        const alreadyOwned = await prismaClient_1.prisma.orderItem.findFirst({
            where: {
                gameId,
                order: {
                    userId,
                    status: 'COMPLETED'
                }
            }
        });
        if (alreadyOwned) {
            res.status(400).json({ error: 'This game is already in your library' });
            return;
        }
        const cartItem = await prismaClient_1.prisma.cartItem.create({
            data: {
                userId,
                gameId
            },
            include: { game: true }
        });
        const { internalCost, ...publicGame } = cartItem.game;
        res.status(201).json(publicGame);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Game is already in cart' });
            return;
        }
        console.error('[ADD TO CART ERROR]', error);
        res.status(500).json({ error: 'Failed to add to cart' });
    }
});
// Remove game from cart
router.delete('/:gameId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { gameId } = req.params;
        await prismaClient_1.prisma.cartItem.deleteMany({
            where: {
                userId,
                gameId
            }
        });
        res.json({ message: 'Removed from cart' });
    }
    catch (error) {
        console.error('[REMOVE FROM CART ERROR]', error);
        res.status(500).json({ error: 'Failed to remove from cart' });
    }
});
exports.default = router;
//# sourceMappingURL=cart.js.map