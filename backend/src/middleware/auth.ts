import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: { userId?: string, username: string, isAdmin?: boolean };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const JWT_SECRET = process.env.JWT_SECRET as string;
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, JWT_SECRET) as { username: string, userId?: string };
    
    // Explicit Admin Determination based on the existing identity mechanism
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME as string;
    let isAdmin = false;
    if (!decoded.userId && decoded.username === ADMIN_USERNAME) {
      isAdmin = true;
    }

    req.user = { ...decoded, isAdmin };
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token' });
    return;
  }
};

export const isAdminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user || !(req.user as any).isAdmin) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }
  next();
};
