"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get current user's wishlist
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized. Admin cannot have a wishlist.' });
            return;
        }
        const wishlistItems = await prismaClient_1.prisma.wishlistItem.findMany({
            where: { userId },
            include: { game: true }
        });
        res.json(wishlistItems.map(item => {
            const { internalCost, ...publicGame } = item.game;
            return publicGame;
        }));
    }
    catch (error) {
        console.error('[GET WISHLIST ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch wishlist' });
    }
});
// Add game to wishlist
router.post('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized. Admin cannot have a wishlist.' });
            return;
        }
        const { gameId } = req.body;
        if (!gameId) {
            res.status(400).json({ error: 'gameId is required' });
            return;
        }
        const wishlistItem = await prismaClient_1.prisma.wishlistItem.create({
            data: {
                userId,
                gameId
            },
            include: { game: true }
        });
        const { internalCost, ...publicGame } = wishlistItem.game;
        res.status(201).json(publicGame);
    }
    catch (error) {
        if (error.code === 'P2002') {
            res.status(400).json({ error: 'Game is already in wishlist' });
            return;
        }
        console.error('[ADD TO WISHLIST ERROR]', error);
        res.status(500).json({ error: 'Failed to add to wishlist' });
    }
});
// Remove game from wishlist
router.delete('/:gameId', auth_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { gameId } = req.params;
        await prismaClient_1.prisma.wishlistItem.deleteMany({
            where: {
                userId,
                gameId
            }
        });
        res.json({ message: 'Removed from wishlist' });
    }
    catch (error) {
        console.error('[REMOVE FROM WISHLIST ERROR]', error);
        res.status(500).json({ error: 'Failed to remove from wishlist' });
    }
});
exports.default = router;
//# sourceMappingURL=wishlist.js.map