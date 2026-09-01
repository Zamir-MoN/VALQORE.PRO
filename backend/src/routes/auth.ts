import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '../prismaClient';
import { authMiddleware } from '../middleware/auth';

import { OAuth2Client } from 'google-auth-library';
import { sendOtpEmail } from '../utils/resendEmail';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'valqore_super_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.VITE_GOOGLE_CLIENT_ID || '421887773463-f2994me4o8934id4nudoo7kg9ng0kdft.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ----------------------------------------------------
// Google OAuth Sign In / Sign Up
// ----------------------------------------------------
router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential, accessToken } = req.body;

    let email: string | undefined;
    let name: string | undefined;
    let googleId: string | undefined;

    if (credential) {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        res.status(400).json({ error: 'Invalid Google token' });
        return;
      }
      email = payload.email.toLowerCase().trim();
      name = payload.name || payload.given_name || email.split('@')[0];
      googleId = payload.sub;
    } else if (accessToken) {
      // Fallback if access token is sent instead of ID token
      const googleRes = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`);
      const userInfo = await googleRes.json();
      if (!userInfo || !userInfo.email) {
        res.status(400).json({ error: 'Failed to retrieve Google user info' });
        return;
      }
      email = userInfo.email.toLowerCase().trim();
      name = userInfo.name || userInfo.given_name || email.split('@')[0];
      googleId = userInfo.sub;
    } else {
      res.status(400).json({ error: 'Google credential or access token is required' });
      return;
    }

    if (!email) {
      res.status(400).json({ error: 'Email could not be verified with Google' });
      return;
    }

    // Check if user already exists with this email
    let user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Generate a clean, unique username based on their Google name/email
      let baseUsername = (name || email.split('@')[0])
        .replace(/[^a-zA-Z0-9_]/g, '')
        .toLowerCase()
        .slice(0, 15) || 'gamer';

      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username: uniqueUsername } })) {
        uniqueUsername = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
        counter++;
        if (counter > 10) {
          uniqueUsername = `${baseUsername}_${Date.now().toString().slice(-4)}`;
          break;
        }
      }

      // Generate a secure random password hash for OAuth account
      const randomPassword = await bcrypt.hash(Math.random().toString(36) + Date.now().toString(), 10);

      user = await prisma.user.create({
        data: {
          username: uniqueUsername,
          email,
          password: randomPassword
        }
      });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('[GOOGLE AUTH ERROR]', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// ----------------------------------------------------
// Send Registration OTP
// ----------------------------------------------------
router.post('/send-register-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      res.status(400).json({ error: 'Username and email are required' });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedUsername },
          { email: trimmedEmail }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.username.toLowerCase() === trimmedUsername.toLowerCase()) {
        res.status(400).json({ error: 'Username is already taken' });
        return;
      }
      res.status(400).json({ error: 'Email is already registered' });
      return;
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any old OTPs for this email to keep table clean
    await prisma.otpVerification.deleteMany({
      where: { email: trimmedEmail }
    });

    // Save new OTP
    await prisma.otpVerification.create({
      data: {
        email: trimmedEmail,
        otp,
        expiresAt
      }
    });

    // Send email
    const emailSent = await sendOtpEmail(trimmedEmail, otp, trimmedUsername);
    if (!emailSent) {
      console.warn('[SEND REGISTER OTP] Email service returned false, but OTP created.');
    }

    res.json({ message: 'Verification code sent to your email' });
  } catch (error: any) {
    console.error('[SEND REGISTER OTP ERROR]', error);
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
});


// ----------------------------------------------------
// Verify Registration OTP & Create User
// ----------------------------------------------------
router.post('/verify-register-otp', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
      res.status(400).json({ error: 'All fields including OTP code are required' });
      return;
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.toLowerCase().trim();
    const trimmedOtp = otp.toString().trim();

    // Find the OTP record
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        email: trimmedEmail,
        otp: trimmedOtp,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      res.status(400).json({ error: 'Invalid or expired verification code' });
      return;
    }

    // Check again if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: trimmedUsername },
          { email: trimmedEmail }
        ]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username: trimmedUsername,
        email: trimmedEmail,
        password: hashedPassword,
      }
    });

    // Clean up used OTPs
    await prisma.otpVerification.deleteMany({
      where: { email: trimmedEmail }
    });

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('[VERIFY REGISTER OTP ERROR]', error);
    res.status(500).json({ error: 'Failed to complete registration' });
  }
});

// Register a new user (Direct fallback)
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }]
      }
    });

    if (existingUser) {
      res.status(400).json({ error: 'Username or email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      }
    });

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    
    res.status(201).json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('[REGISTER ERROR]', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// Login user
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // Check for hardcoded admin fallback
    const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
    const ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || 'valqore2026').trim();

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ token, user: { id: 'admin', username: ADMIN_USERNAME, role: 'ADMIN' } });
      return;
    }

    // Check DB for user (allow login by username or email)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username } // if they typed an email in the username field
        ]
      }
    });
    
    if (!user) {
      res.status(401).json({ error: 'Wrong credentials' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Wrong credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('[LOGIN ERROR]', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    
    // If it's the admin
    if (!userPayload.userId && userPayload.username === (process.env.ADMIN_USERNAME || 'admin')) {
       res.json({ id: 'admin', username: userPayload.username, role: 'ADMIN' });
       return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId },
      select: { id: true, username: true, email: true, createdAt: true, steamMonUsername: true, steamMonPassword: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    console.error('[GET ME ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch user profile: ' + (error.message || String(error)) });
  }
});

// Change user password
router.put('/password', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new password are required' });
      return;
    }

    if (!userPayload.userId && userPayload.username === (process.env.ADMIN_USERNAME || 'admin')) {
      res.status(403).json({ error: 'Cannot change default admin password' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.userId }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Incorrect current password' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('[CHANGE PASSWORD ERROR]', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get all users (Admin only)
router.get('/admin/users', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;


    // Check if user is admin
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        steamMonUsername: true,
        _count: {
          select: {
            orders: true,
            creatorApplications: true,
          }
        }
      }
    });

    res.json(users);
  } catch (error) {
    console.error('[ADMIN GET USERS ERROR]', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete user (Admin only)
router.delete('/admin/users/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userPayload = (req as any).user;

    // Check if user is admin
    if (userPayload.userId) {
      res.status(403).json({ error: 'Access denied. Admins only.' });
      return;
    }

    const { id } = req.params;

    // Delete associated CartItems, WishlistItems, Orders and CreatorApplications
    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('[ADMIN DELETE USER ERROR]', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;

