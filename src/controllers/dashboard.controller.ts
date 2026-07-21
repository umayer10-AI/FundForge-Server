import { Response } from 'express';
import { Campaign, Contribution, Payment, Withdrawal, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess } from '../utils/response';

export const dashboardController = {
  async getSupporterStats(req: AuthRequest, res: Response) {
    try {
      const [totalContributions, approvedContributions, pendingContributions, rejectedContributions, totalPayments] = await Promise.all([
        Contribution.countDocuments({ supporterId: req.user!._id }),
        Contribution.countDocuments({ supporterId: req.user!._id, status: 'approved' }),
        Contribution.countDocuments({ supporterId: req.user!._id, status: 'pending' }),
        Contribution.countDocuments({ supporterId: req.user!._id, status: 'rejected' }),
        Payment.aggregate([
          { $match: { userId: req.user!._id, status: 'succeeded' } },
          { $group: { _id: null, total: { $sum: '$price' } } },
        ]),
      ]);

      const totalSpent = totalPayments[0]?.total || 0;

      const user = await User.findById(req.user!._id).select('credits');

      sendSuccess(res, {
        credits: user?.credits || 0,
        contributions: {
          total: totalContributions,
          approved: approvedContributions,
          pending: pendingContributions,
          rejected: rejectedContributions,
        },
        totalSpent,
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCreatorStats(req: AuthRequest, res: Response) {
    try {
      const [totalCampaigns, activeCampaigns, pendingCampaigns, completedCampaigns, totalContributions, pendingContributions, totalWithdrawals] = await Promise.all([
        Campaign.countDocuments({ creatorId: req.user!._id }),
        Campaign.countDocuments({ creatorId: req.user!._id, status: 'approved', deadline: { $gt: new Date() } }),
        Campaign.countDocuments({ creatorId: req.user!._id, status: 'pending' }),
        Campaign.countDocuments({ creatorId: req.user!._id, status: 'completed' }),
        Contribution.countDocuments({ creatorId: req.user!._id }),
        Contribution.countDocuments({ creatorId: req.user!._id, status: 'pending' }),
        Withdrawal.aggregate([
          { $match: { creatorId: req.user!._id, status: 'approved' } },
          { $group: { _id: null, total: { $sum: '$credits' } } },
        ]),
      ]);

      const campaigns = await Campaign.find({ creatorId: req.user!._id, status: 'approved' });
      const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
      const totalSupporters = campaigns.reduce((sum, c) => sum + c.totalSupporters, 0);

      const withdrawnCredits = totalWithdrawals[0]?.total || 0;
      const availableWithdrawal = totalRaised - withdrawnCredits;

      sendSuccess(res, {
        campaigns: { total: totalCampaigns, active: activeCampaigns, pending: pendingCampaigns, completed: completedCampaigns },
        totalRaised,
        totalSupporters,
        contributions: { total: totalContributions, pending: pendingContributions },
        availableWithdrawal: Math.max(0, availableWithdrawal),
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCreatorAnalytics(req: AuthRequest, res: Response) {
    try {
      const [monthlyRaised, campaignGrowth, contributionTrend, categoryDistribution] = await Promise.all([
        Contribution.aggregate([
          { $match: { creatorId: req.user!._id, status: 'approved' } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
        Campaign.aggregate([
          { $match: { creatorId: req.user!._id } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
        Contribution.aggregate([
          { $match: { creatorId: req.user!._id } },
          { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
          { $limit: 12 },
        ]),
        Campaign.aggregate([
          { $match: { creatorId: req.user!._id } },
          { $group: { _id: '$category', count: { $sum: 1 }, totalRaised: { $sum: '$raisedAmount' } } },
        ]),
      ]);

      sendSuccess(res, { monthlyRaised, campaignGrowth, contributionTrend, categoryDistribution });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};

function sendError(res: Response, message: string, statusCode: number = 500) {
  return res.status(statusCode).json({ success: false, message, errors: [] });
}
