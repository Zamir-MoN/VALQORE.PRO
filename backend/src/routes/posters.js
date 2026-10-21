"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
// Get all active posters
router.get('/', async (req, res) => {
    try {
        const posters = await prismaClient_1.prisma.poster.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(posters);
    }
    catch (error) {
        console.error('[GET POSTERS ERROR]', error);
        res.status(500).json({ error: 'Failed to fetch posters' });
    }
});
// Create a new poster
router.post('/', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { imageUrl, imageUrls } = req.body;
        // Support either single string or array of strings
        const urlsToProcess = [];
        if (imageUrls && Array.isArray(imageUrls)) {
            urlsToProcess.push(...imageUrls.filter(u => typeof u === 'string' && u.trim() !== ''));
        }
        else if (imageUrl && typeof imageUrl === 'string') {
            // Split by comma to allow comma-separated uploads from the single input
            const splitted = imageUrl.split(',').map((u) => u.trim()).filter(Boolean);
            urlsToProcess.push(...splitted);
        }
        if (urlsToProcess.length === 0) {
            res.status(400).json({ error: 'Valid Image URL(s) required' });
            return;
        }
        const createdPosters = await prismaClient_1.prisma.$transaction(urlsToProcess.map(url => prismaClient_1.prisma.poster.create({ data: { imageUrl: url } })));
        (0, socket_1.getIO)()?.emit('posters_updated');
        res.status(201).json(createdPosters);
    }
    catch (error) {
        console.error('[CREATE POSTER ERROR]', error);
        res.status(500).json({ error: 'Failed to create poster' });
    }
});
// Delete a poster
router.delete('/:id', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.prisma.poster.delete({
            where: { id }
        });
        (0, socket_1.getIO)()?.emit('posters_updated');
        res.status(204).send();
    }
    catch (error) {
        console.error('[DELETE POSTER ERROR]', error);
        res.status(500).json({ error: 'Failed to delete poster' });
    }
});
exports.default = router;
//# sourceMappingURL=posters.js.map