"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const prismaClient_1 = require("../prismaClient");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all coupons (Admin only)
router.get('/', auth_1.authMiddleware, async (req, res) => {
    try {
        const coupons = await prismaClient_1.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(coupons);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch coupons' });
    }
});
// Create a new coupon
router.post('/', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { code, discount, createdBy, usageLimit, creatorId, commissionRate } = req.body;
        if (!code || !discount || !createdBy) {
            return res.status(400).json({ error: 'Code, discount, and creator are required' });
        }
        const existing = await prismaClient_1.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return res.status(400).json({ error: 'Coupon code already exists' });
        }
        const coupon = await prismaClient_1.prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                discount: parseFloat(discount),
                createdBy,
                usageLimit: creatorId ? null : (usageLimit ? parseInt(usageLimit, 10) : null),
                creatorId: creatorId || null,
                commissionRate: commissionRate ? parseFloat(commissionRate) : null
            }
        });
        res.status(201).json(coupon);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create coupon' });
    }
});
// Validate a coupon (Authenticated users)
router.post('/validate', auth_1.authMiddleware, async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Coupon code is required' });
        }
        const coupon = await prismaClient_1.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (!coupon || !coupon.isActive) {
            return res.status(404).json({ error: 'Invalid or expired coupon' });
        }
        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({ error: 'Coupon usage limit reached' });
        }
        res.json({ valid: true, discount: coupon.discount, code: coupon.code });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to validate coupon' });
    }
});
// Delete a coupon
router.delete('/:id', auth_1.authMiddleware, auth_1.isAdminMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        await prismaClient_1.prisma.coupon.delete({
            where: { id }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete coupon' });
    }
});
exports.default = router;
//# sourceMappingURL=coupons.js.map