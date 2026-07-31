import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminJwtPayload {
  email: string;
  role: 'ADMIN';
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}

export function adminAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No admin token provided' });
  }

  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'ADMIN_JWT_SECRET not configured' });
  }

  try {
    const payload = jwt.verify(token, secret) as AdminJwtPayload;
    if (payload.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin token' });
  }
}
