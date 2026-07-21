import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config';
import { sendSuccess, sendError } from '../utils/response';
import { emailService } from '../services/email.service';
import { createNotification } from '../services/notification.service';
import { AuthRequest } from '../middleware/auth';

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    config.betterAuth.secret,
    { expiresIn: '7d' }
  );
};

export const authController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password, role, photo } = req.body;

      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return sendError(res, 'Email already registered', 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const credits = role === 'creator' ? 20 : 50;

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        credits,
        photo: photo || '',
        provider: 'email',
        emailVerified: false,
      });

      const token = generateToken(user);

      await createNotification({
        title: 'Welcome to FundForge AI!',
        message: `Welcome ${name}! You've received ${credits} credits to get started.`,
        type: 'success',
        toEmail: user.email,
        fromEmail: config.adminEmail,
        actionRoute: `/dashboard/${role}`,
      });

      await emailService.sendWelcome(user.email, user.name, user.role, credits);

      sendSuccess(res, {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          photo: user.photo,
        },
      }, 'Registration successful', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (user.provider === 'google') {
        return sendError(res, 'This email uses Google login. Please sign in with Google.', 401);
      }

      if (user.isBlocked) {
        return sendError(res, 'Account is blocked. Contact support.', 403);
      }

      const isMatch = await bcrypt.compare(password, user.password || '');
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 401);
      }

      user.lastLogin = new Date();
      await user.save();

      const token = generateToken(user);

      sendSuccess(res, {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          credits: user.credits,
          photo: user.photo,
          provider: user.provider,
        },
      }, 'Login successful');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async googleAuth(req: Request, res: Response) {
    try {
      const { access_token, role } = req.body;

      if (!access_token) {
        return sendError(res, 'Google access token is required', 400);
      }

      const tokenRes = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${access_token}`);
      if (!tokenRes.ok) {
        return sendError(res, 'Invalid Google access token', 401);
      }
      const tokenInfo = await tokenRes.json();

      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (!userInfoRes.ok) {
        return sendError(res, 'Failed to get Google user info', 401);
      }
      const userInfo: any = await userInfoRes.json();

      const email = userInfo.email;
      if (!email) {
        return sendError(res, 'Email not available from Google', 400);
      }
      const name = userInfo.name || email.split('@')[0];
      const photo = userInfo.picture || '';

      let user = await User.findOne({ email: email.toLowerCase() });

      if (user) {
        if (user.provider !== 'google') {
          return sendError(res, 'This email is registered with email/password. Please login with your password.', 401);
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user);
        return sendSuccess(res, { token, user: { ...user.toObject(), password: undefined } }, 'Login successful');
      }

      if (!role || !['supporter', 'creator'].includes(role)) {
        return sendError(res, 'Please select a role: supporter or creator', 400);
      }

      const credits = role === 'creator' ? 20 : 50;
      user = await User.create({
        name,
        email: email.toLowerCase(),
        photo,
        role,
        credits,
        provider: 'google',
        emailVerified: true,
      });

      const token = generateToken(user);

      await createNotification({
        title: 'Welcome to FundForge AI!',
        message: `Welcome ${name}! You've received ${credits} credits to get started.`,
        type: 'success',
        toEmail: user.email,
        fromEmail: config.adminEmail,
        actionRoute: `/dashboard/${role}`,
      });

      await emailService.sendWelcome(user.email, user.name, user.role, credits);

      sendSuccess(res, { token, user: { ...user.toObject(), password: undefined } }, 'Registration successful', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getMe(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.user?._id).select('-password');
      if (!user) {
        return sendError(res, 'User not found', 404);
      }
      sendSuccess(res, user);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const { name, photo } = req.body;
      const updateData: any = {};
      if (name) updateData.name = name;
      if (photo) updateData.photo = photo;

      const user = await User.findByIdAndUpdate(req.user?._id, updateData, { new: true }).select('-password');
      sendSuccess(res, user, 'Profile updated');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const { currentPassword, newPassword } = req.body;
      const user = await User.findById(req.user?._id);
      if (!user) return sendError(res, 'User not found', 404);

      if (user.provider === 'google') {
        return sendError(res, 'Google accounts cannot change password here', 400);
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password || '');
      if (!isMatch) return sendError(res, 'Current password is incorrect', 400);

      const hashedPassword = await bcrypt.hash(newPassword, 12);
      user.password = hashedPassword;
      await user.save();

      sendSuccess(res, null, 'Password changed successfully');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
