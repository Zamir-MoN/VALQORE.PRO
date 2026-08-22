import { Router, Request, Response } from 'express';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';
import { sendApprovalEmail } from '../utils/email';

const router = Router();

// Get the current user's application status
router.get('/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    
    if (!userPayload.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }

    // Fetch the most recent application (highest createdAt)
    const application = await prisma.creatorApplication.findFirst({
      where: { userId: userPayload.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!application) {
      res.json({ status: null });
      return;
    }

    res.json({ status: application.status, applicationId: application.id });
  } catch (error) {
    console.error('[CREATOR STATUS ERROR]', error);
    res.status(500).json({ error: 'An error occurred while fetching application status' });
  }
});

// Submit a new creator application
router.post('/apply', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    
    if (!userPayload.userId) {
      res.status(403).json({ error: 'Admins cannot submit creator applications' });
      return;
    }

    const {
      name,
      youtubeLink,
      instagramLink,
      facebookLink,
      otherLink,
      intent,
      contactPlatforms,
      creatorEmail,
      agreedToGuidelines
    } = req.body;

    // Basic Validation
    if (!name || !intent || !creatorEmail) {
      res.status(400).json({ error: 'Name, intent, and email are required.' });
      return;
    }

    if (!agreedToGuidelines) {
      res.status(400).json({ error: 'You must agree to the guidelines.' });
      return;
    }

    if (!youtubeLink && !instagramLink && !facebookLink && !otherLink) {
      res.status(400).json({ error: 'At least one social media link is required.' });
      return;
    }

    if (!contactPlatforms || Object.keys(contactPlatforms).length === 0) {
      res.status(400).json({ error: 'At least one contact method is required.' });
      return;
    }

    // Check if user already has a pending or approved application
    const existingApplication = await prisma.creatorApplication.findFirst({
      where: {
        userId: userPayload.userId,
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existingApplication) {
      res.status(400).json({ error: 'You already have an active application.' });
      return;
    }

    // Save the application
    const application = await prisma.creatorApplication.create({
      data: {
        userId: userPayload.userId,
        name,
        youtubeLink,
        instagramLink,
        facebookLink,
        otherLink,
        intent,
        contactPlatforms: JSON.stringify(contactPlatforms),
        creatorEmail,
        agreedToGuidelines: true,
        status: 'PENDING'
      }
    });

    res.status(201).json({ success: true, applicationId: application.id });
  } catch (error) {
    console.error('[CREATOR APPLY ERROR]', error);
    res.status(500).json({ error: 'An error occurred while submitting your application' });
  }
});

// Get all applications (Admin only)
router.get('/admin/applications', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    
    // Check if user is admin (admin does not have a userId in the payload, only username)
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const applications = await prisma.creatorApplication.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { email: true }
        }
      }
    });

    res.json(applications);
  } catch (error) {
    console.error('[GET ADMIN CREATOR APPLICATIONS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update application status (Admin only)
router.put('/admin/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    
    // Check if user is admin
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { id } = req.params;
    const { status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED.' });
      return;
    }

    const application = await prisma.creatorApplication.findUnique({
      where: { id }
    });

    if (!application) {
      res.status(404).json({ error: 'Application not found.' });
      return;
    }

    const updatedApplication = await prisma.creatorApplication.update({
      where: { id },
      data: { status }
    });

    if (status === 'APPROVED') {
      await sendApprovalEmail(application.creatorEmail, application.name);
    }

    res.json({ success: true, application: updatedApplication });
  } catch (error) {
    console.error('[CREATOR STATUS UPDATE ERROR]', error);
    res.status(500).json({ error: 'An error occurred while updating application status' });
  }
});

export default router;
