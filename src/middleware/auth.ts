import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { sendError } from '../utils/response';
import { config } from '../config';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: string;
    credits: number;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.session_token) {
      token = req.cookies.session_token;
    }

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const decoded = jwt.verify(token, config.betterAuth.secret) as { id: string; email: string; role: string };
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    if (user.isBlocked) {
      return sendError(res, 'Account is blocked', 403);
    }

    req.user = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
    };

    next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to access this resource', 403);
    }
    next();
  };
};
