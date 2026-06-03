import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    tenantId: string;
    name: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_9911';

// Authenticate JWT token middleware
export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Autentikasi gagal: Token tidak disediakan' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      role: string;
      tenantId: string;
      name: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Autentikasi gagal: Token tidak valid atau kadaluwarsa' });
  }
};

// Enforce Role-Based Access Control (RBAC) middleware
export const authorize = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized: User not authenticated' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Akses ditolak: Peran ${req.user.role} tidak memiliki izin untuk tindakan ini` 
      });
    }

    next();
  };
};
