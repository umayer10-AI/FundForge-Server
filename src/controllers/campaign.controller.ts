import { Response } from 'express';
import { Campaign, Contribution, CreditTransaction, User, Wishlist } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

export const campaignController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { title, story, category, goal, minimumContribution, deadline, reward, image } = req.body;

      const campaign = await Campaign.create({
        title,
        story,
        category,
        goal,
        minimumContribution,
        deadline: new Date(deadline),
        reward,
        image,
        creatorId: req.user!._id,
        creatorName: req.user!.name,
        creatorEmail: req.user!.email,
        status: 'pending',
      });

      await createNotification({
        title: 'Campaign Submitted',
        message: `Your campaign "${title}" has been submitted for review.`,
        type: 'campaign',
        toEmail: req.user!.email,
        fromEmail: config.adminEmail,
        actionRoute: '/dashboard/creator/my-campaigns',
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          title: 'New Campaign',
          message: `${req.user!.name} submitted a new campaign "${title}" for approval.`,
          type: 'campaign',
          toEmail: admin.email,
          fromEmail: req.user!.email,
          actionRoute: '/dashboard/admin/campaign-approvals',
        });
      }

      sendSuccess(res, campaign, 'Campaign created successfully', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      const filter: any = { status: 'approved', deadline: { $gt: new Date() } };

      if (req.query.category) filter.category = req.query.category;
      if (req.query.creatorId) filter.creatorId = req.query.creatorId;
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { story: { $regex: req.query.search, $options: 'i' } },
          { creatorName: { $regex: req.query.search, $options: 'i' } },
        ];
      }
      if (req.query.minGoal) filter.goal = { $gte: parseInt(req.query.minGoal as string) };
      if (req.query.maxGoal) filter.goal = { ...filter.goal, $lte: parseInt(req.query.maxGoal as string) };

      let sort: any = { createdAt: -1 };
      if (req.query.sort === 'oldest') sort = { createdAt: 1 };
      if (req.query.sort === 'most_raised') sort = { raisedAmount: -1 };
      if (req.query.sort === 'least_raised') sort = { raisedAmount: 1 };
      if (req.query.sort === 'most_supporters') sort = { totalSupporters: -1 };
      if (req.query.sort === 'ending_soon') sort = { deadline: 1 };
      if (req.query.sort === 'highest_goal') sort = { goal: -1 };
      if (req.query.sort === 'lowest_goal') sort = { goal: 1 };
      if (req.query.sort === 'alphabetical') sort = { title: 1 };
      if (req.query.sort === 'trending') sort = { raisedAmount: -1, totalSupporters: -1 };

      const [campaigns, total] = await Promise.all([
        Campaign.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Campaign.countDocuments(filter),
      ]);

      sendPaginated(res, campaigns, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const campaign = await Campaign.findById(req.params.id).lean();
      if (!campaign) return sendError(res, 'Campaign not found', 404);

      if (campaign.status !== 'approved' && campaign.creatorId !== req.user?._id && req.user?.role !== 'admin') {
        return sendError(res, 'Campaign not found', 404);
      }

      sendSuccess(res, campaign);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getMyCampaigns(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 12;
      const skip = (page - 1) * limit;

      const filter: any = { creatorId: req.user!._id };
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        filter.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { category: { $regex: req.query.search, $options: 'i' } },
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

  async update(req: AuthRequest, res: Response) {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) return sendError(res, 'Campaign not found', 404);
      if (campaign.creatorId !== req.user!._id && req.user?.role !== 'admin') {
        return sendError(res, 'Not authorized', 403);
      }
      if (['completed', 'suspended'].includes(campaign.status) && req.user?.role !== 'admin') {
        return sendError(res, 'Cannot update a completed or suspended campaign', 400);
      }

      const updates = ['title', 'story', 'reward', 'image'];
      updates.forEach((field) => {
        if (req.body[field] !== undefined) (campaign as any)[field] = req.body[field];
      });

      if (req.user?.role !== 'admin') {
        campaign.status = 'pending';
      }

      await campaign.save();
      sendSuccess(res, campaign, 'Campaign updated');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const campaign = await Campaign.findById(req.params.id);
      if (!campaign) return sendError(res, 'Campaign not found', 404);
      if (campaign.creatorId !== req.user!._id && req.user?.role !== 'admin') {
        return sendError(res, 'Not authorized', 403);
      }

      const approvedContributions = await Contribution.find({ campaignId: campaign._id.toString(), status: 'approved' });

      for (const contrib of approvedContributions) {
        const supporter = await User.findById(contrib.supporterId);
        if (supporter) {
          supporter.credits += contrib.amount;
          await supporter.save();

          await CreditTransaction.create({
            userId: supporter._id.toString(),
            email: supporter.email,
            type: 'refund',
            credits: contrib.amount,
            balanceBefore: supporter.credits - contrib.amount,
            balanceAfter: supporter.credits,
            referenceId: campaign._id.toString(),
            description: `Refund for deleted campaign: ${campaign.title}`,
          });

          await createNotification({
            title: 'Campaign Deleted - Credits Refunded',
            message: `Campaign "${campaign.title}" has been deleted. ${contrib.amount} credits have been refunded.`,
            type: 'warning',
            toEmail: supporter.email,
            fromEmail: config.adminEmail,
          });
        }
      }

      await Contribution.deleteMany({ campaignId: campaign._id.toString() });
      await Wishlist.deleteMany({ campaignId: campaign._id.toString() });
      await Campaign.findByIdAndDelete(req.params.id);

      sendSuccess(res, null, 'Campaign deleted. All supporters have been refunded.');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getFeatured(req: AuthRequest, res: Response) {
    try {
      const campaigns = await Campaign.find({ status: 'approved', deadline: { $gt: new Date() } })
        .sort({ raisedAmount: -1, totalSupporters: -1 })
        .limit(6)
        .lean();
      sendSuccess(res, campaigns);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCategories(_req: AuthRequest, res: Response) {
    try {
      const categories = await Campaign.distinct('category', { status: 'approved' });
      sendSuccess(res, categories);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
