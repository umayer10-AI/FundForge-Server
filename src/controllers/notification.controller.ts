import { Response } from 'express';
import { Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
} from '../services/notification.service';

export const notificationController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = { toEmail: req.user!.email };
      if (req.query.type) filter.type = req.query.type;
      if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

      const [notifications, total] = await Promise.all([
        Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Notification.countDocuments(filter),
      ]);

      sendPaginated(res, notifications, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const count = await getUnreadCount(req.user!.email);
      sendSuccess(res, { count });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async read(req: AuthRequest, res: Response) {
    try {
      const notification = await markAsRead(req.params.id, req.user!.email);
      if (!notification) return sendError(res, 'Notification not found', 404);
      sendSuccess(res, notification, 'Marked as read');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async readAll(req: AuthRequest, res: Response) {
    try {
      await markAllAsRead(req.user!.email);
      sendSuccess(res, null, 'All notifications marked as read');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const result = await deleteNotification(req.params.id, req.user!.email);
      if (!result) return sendError(res, 'Notification not found', 404);
      sendSuccess(res, null, 'Notification deleted');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async clearAll(req: AuthRequest, res: Response) {
    try {
      await clearAllNotifications(req.user!.email);
      sendSuccess(res, null, 'All notifications cleared');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
