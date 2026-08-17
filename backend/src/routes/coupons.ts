import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all coupons (Admin only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch coupons' });
  }
});

// Create a new coupon
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { code, discount, createdBy } = req.body;
    
    if (!code || !discount || !createdBy) {
      return res.status(400).json({ error: 'Code, discount, and creator are required' });
    }

    const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discount: parseFloat(discount),
        createdBy
      }
    });
    
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create coupon' });
  }
});

// Validate a coupon (Authenticated users)
router.post('/validate', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Coupon code is required' });
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    
    if (!coupon || !coupon.isActive) {
      return res.status(404).json({ error: 'Invalid or expired coupon' });
    }
    
    res.json({ valid: true, discount: coupon.discount, code: coupon.code });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate coupon' });
  }
});

// Delete a coupon
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.coupon.delete({
      where: { id }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete coupon' });
  }
});

export default router;
