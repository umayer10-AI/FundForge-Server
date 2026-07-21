import { Response } from 'express';
import { User, Campaign, Contribution, Payment, Withdrawal, Report, Notification } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

export const adminController = {
  async getDashboardStats(_req: AuthRequest, res: Response) {
    try {
      const [
        totalUsers, totalSupporters, totalCreators, totalAdmins,
        totalCampaigns, approvedCampaigns, pendingCampaigns, rejectedCampaigns, suspendedCampaigns,
        totalContributions, totalPayments, totalWithdrawals, pendingWithdrawals, pendingReports,
        totalRaised
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'supporter' }),
        User.countDocuments({ role: 'creator' }),
        User.countDocuments({ role: 'admin' }),
        Campaign.countDocuments(),
        Campaign.countDocuments({ status: 'approved' }),
        Campaign.countDocuments({ status: 'pending' }),
        Campaign.countDocuments({ status: 'rejected' }),
        Campaign.countDocuments({ status: 'suspended' }),
        Contribution.countDocuments(),
        Payment.countDocuments({ status: 'succeeded' }),
        Withdrawal.countDocuments(),
        Withdrawal.countDocuments({ status: 'pending' }),
        Report.countDocuments({ status: 'pending' }),
        Campaign.aggregate([{ $group: { _id: null, total: { $sum: '$raisedAmount' } } }]),
      ]);

      sendSuccess(res, {
        users: { total: totalUsers, supporters: totalSupporters, creators: totalCreators, admins: totalAdmins },
        campaigns: { total: totalCampaigns, approved: approvedCampaigns, pending: pendingCampaigns, rejected: rejectedCampaigns, suspended: suspendedCampaigns },
        contributions: totalContributions,
        payments: totalPayments,
        withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals },
        reports: { pending: pendingReports },
        totalRaised: totalRaised[0]?.total || 0,
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getUsers(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.search) {
        filter.$or = [
          { name: { $regex: req.query.search, $options: 'i' } },
          { email: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      let sort: any = { createdAt: -1 };
      if (req.query.sort === 'oldest') sort = { createdAt: 1 };
      if (req.query.sort === 'highest_credits') sort = { credits: -1 };

      const [users, total] = await Promise.all([
        User.find(filter).select('-password').sort(sort).skip(skip).limit(limit).lean(),
        User.countDocuments(filter),
      ]);

      sendPaginated(res, users, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { role } = req.body;
      if (!['supporter', 'creator', 'admin'].includes(role)) {
        return sendError(res, 'Invalid role', 400);
      }

      const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
      if (!user) return sendError(res, 'User not found', 404);

      await createNotification({
        title: 'Role Updated',
        message: `Your role has been updated to ${role}.`,
        type: 'info',
        toEmail: user.email,
        fromEmail: config.adminEmail,
      });

      sendSuccess(res, user, 'User role updated');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async toggleUserStatus(req: AuthRequest, res: Response) {
    try {
      const { action } = req.body; // block, unblock, suspend, activate
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, 'User not found', 404);

      if (user.role === 'admin' && req.user!._id !== user._id.toString()) {
        return sendError(res, 'Cannot modify another admin', 403);
      }

      switch (action) {
        case 'block':
          user.isBlocked = true;
          break;
        case 'unblock':
          user.isBlocked = false;
          break;
        default:
          return sendError(res, 'Invalid action', 400);
      }

      await user.save();

      await createNotification({
        title: `Account ${action === 'block' ? 'Blocked' : 'Activated'}`,
        message: `Your account has been ${action === 'block' ? 'blocked' : 'activated'}.`,
        type: action === 'block' ? 'error' : 'success',
        toEmail: user.email,
        fromEmail: config.adminEmail,
      });

      sendSuccess(res, user, `User ${action === 'block' ? 'blocked' : 'activated'} successfully`);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return sendError(res, 'User not found', 404);

      if (user.role === 'admin') {
        const adminCount = await User.countDocuments({ role: 'admin' });
        if (adminCount <= 1) return sendError(res, 'Cannot delete the last admin', 400);
      }

      await User.findByIdAndDelete(req.params.id);
      await Notification.deleteMany({ toEmail: user.email });

      sendSuccess(res, null, 'User deleted');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getAllCampaigns(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { creatorName: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      let sort: any = { createdAt: -1 };
      if (req.query.sort === 'oldest') sort = { createdAt: 1 };
      if (req.query.sort === 'most_raised') sort = { raisedAmount: -1 };

      const [campaigns, total] = await Promise.all([
        Campaign.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Campaign.countDocuments(filter),
      ]);

      sendPaginated(res, campaigns, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async approveCampaign(req: AuthRequest, res: Response) {
    try {
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { status: 'approved' },
        { new: true }
      );
      if (!campaign) return sendError(res, 'Campaign not found', 404);

      await createNotification({
        title: 'Campaign Approved',
        message: `Your campaign "${campaign.title}" has been approved and is now visible to supporters!`,
        type: 'success',
        toEmail: campaign.creatorEmail,
        fromEmail: config.adminEmail,
        actionRoute: '/dashboard/creator/my-campaigns',
      });

      await emailService.sendCampaignApproved(campaign.creatorEmail, campaign.title);

      sendSuccess(res, campaign, 'Campaign approved');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async rejectCampaign(req: AuthRequest, res: Response) {
    try {
      const { reason } = req.body;
      const campaign = await Campaign.findByIdAndUpdate(
        req.params.id,
        { status: 'rejected', rejectionReason: reason || 'No reason provided' },
        { new: true }
      );
      if (!campaign) return sendError(res, 'Campaign not found', 404);

      await createNotification({
        title: 'Campaign Rejected',
        message: `Your campaign "${campaign.title}" has been rejected. Reason: ${reason || 'N/A'}`,
        type: 'error',
        toEmail: campaign.creatorEmail,
        fromEmail: config.adminEmail,
      });

      await emailService.sendCampaignRejected(campaign.creatorEmail, campaign.title, reason || 'No reason provided');

      sendSuccess(res, campaign, 'Campaign rejected');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getPayments(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;

      const [payments, total] = await Promise.all([
        Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Payment.countDocuments(filter),
      ]);

      sendPaginated(res, payments, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getAnalytics(_req: AuthRequest, res: Response) {
    try {
      const [userGrowth, campaignGrowth, categoryStats, monthlyRevenue] = await Promise.all([
        User.aggregate([
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
        Campaign.aggregate([
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
        Campaign.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 }, totalRaised: { $sum: '$raisedAmount' } } },
          { $sort: { count: -1 } },
        ]),
        Payment.aggregate([
          { $match: { status: 'succeeded' } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$price' } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
      ]);

      sendSuccess(res, { userGrowth, campaignGrowth, categoryStats, monthlyRevenue });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
