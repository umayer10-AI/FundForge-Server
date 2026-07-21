import { Response } from 'express';
import { Campaign, Contribution, User, CreditTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

export const contributionController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { campaignId, amount, message } = req.body;

      if (req.user!.role !== 'supporter') {
        return sendError(res, 'Only supporters can contribute', 403);
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return sendError(res, 'Campaign not found', 404);
      if (campaign.status !== 'approved') return sendError(res, 'Campaign is not accepting contributions', 400);
      if (new Date(campaign.deadline) < new Date()) return sendError(res, 'Campaign deadline has passed', 400);
      if (amount < campaign.minimumContribution) {
        return sendError(res, `Minimum contribution is ${campaign.minimumContribution} credits`, 400);
      }
      if (req.user!.credits < amount) {
        return sendError(res, 'Insufficient credits', 400);
      }

      const user = await User.findById(req.user!._id);
      if (!user) return sendError(res, 'User not found', 404);

      user.credits -= amount;
      await user.save();

      await CreditTransaction.create({
        userId: user._id.toString(),
        email: user.email,
        type: 'contribution',
        credits: amount,
        balanceBefore: user.credits + amount,
        balanceAfter: user.credits,
        referenceId: campaignId,
        description: `Contribution to "${campaign.title}"`,
      });

      const contribution = await Contribution.create({
        campaignId,
        campaignTitle: campaign.title,
        supporterId: req.user!._id,
        supporterName: req.user!.name,
        supporterEmail: req.user!.email,
        creatorId: campaign.creatorId,
        creatorEmail: campaign.creatorEmail,
        amount,
        message,
        status: 'pending',
      });

      await createNotification({
        title: 'New Contribution',
        message: `${req.user!.name} contributed ${amount} credits to "${campaign.title}"`,
        type: 'contribution',
        toEmail: campaign.creatorEmail,
        fromEmail: req.user!.email,
        actionRoute: '/dashboard/creator/contributions',
      });

      await emailService.sendNewContribution(campaign.creatorEmail, campaign.title, amount, req.user!.name);

      sendSuccess(res, contribution, 'Contribution submitted. Awaiting creator approval.', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async approve(req: AuthRequest, res: Response) {
    try {
      const contribution = await Contribution.findById(req.params.id);
      if (!contribution) return sendError(res, 'Contribution not found', 404);
      if (contribution.creatorId !== req.user!._id && req.user?.role !== 'admin') {
        return sendError(res, 'Not authorized', 403);
      }
      if (contribution.status !== 'pending') return sendError(res, 'Contribution already processed', 400);

      contribution.status = 'approved';
      await contribution.save();

      await Campaign.findByIdAndUpdate(contribution.campaignId, {
        $inc: { raisedAmount: contribution.amount, totalSupporters: 1 },
      });

      await createNotification({
        title: 'Contribution Approved',
        message: `Your contribution of ${contribution.amount} credits to "${contribution.campaignTitle}" has been approved.`,
        type: 'success',
        toEmail: contribution.supporterEmail,
        fromEmail: req.user!.email,
        actionRoute: '/dashboard/supporter/contributions',
      });

      await emailService.sendContributionApproved(contribution.supporterEmail, contribution.campaignTitle, contribution.amount);

      sendSuccess(res, contribution, 'Contribution approved');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async reject(req: AuthRequest, res: Response) {
    try {
      const contribution = await Contribution.findById(req.params.id);
      if (!contribution) return sendError(res, 'Contribution not found', 404);
      if (contribution.creatorId !== req.user!._id && req.user?.role !== 'admin') {
        return sendError(res, 'Not authorized', 403);
      }
      if (contribution.status !== 'pending') return sendError(res, 'Contribution already processed', 400);

      contribution.status = 'rejected';
      await contribution.save();

      const supporter = await User.findById(contribution.supporterId);
      if (supporter) {
        supporter.credits += contribution.amount;
        await supporter.save();

        await CreditTransaction.create({
          userId: supporter._id.toString(),
          email: supporter.email,
          type: 'refund',
          credits: contribution.amount,
          balanceBefore: supporter.credits - contribution.amount,
          balanceAfter: supporter.credits,
          referenceId: contribution.campaignId,
          description: `Refund for rejected contribution to "${contribution.campaignTitle}"`,
        });
      }

      await createNotification({
        title: 'Contribution Rejected',
        message: `Your contribution of ${contribution.amount} credits to "${contribution.campaignTitle}" has been rejected. Credits refunded.`,
        type: 'warning',
        toEmail: contribution.supporterEmail,
        fromEmail: req.user!.email,
      });

      await emailService.sendContributionRejected(contribution.supporterEmail, contribution.campaignTitle);

      sendSuccess(res, contribution, 'Contribution rejected. Credits refunded.');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getMyContributions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = { supporterId: req.user!._id };
      if (req.query.status) filter.status = req.query.status;
      if (req.query.search) {
        filter.$or = [
          { campaignTitle: { $regex: req.query.search, $options: 'i' } },
          { supporterName: { $regex: req.query.search, $options: 'i' } },
        ];
      }

      let sort: any = { createdAt: -1 };
      if (req.query.sort === 'oldest') sort = { createdAt: 1 };

      const [contributions, total] = await Promise.all([
        Contribution.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Contribution.countDocuments(filter),
      ]);

      sendPaginated(res, contributions, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCampaignContributions(req: AuthRequest, res: Response) {
    try {
      const { campaignId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return sendError(res, 'Campaign not found', 404);
      if (campaign.creatorId !== req.user!._id && req.user?.role !== 'admin') {
        return sendError(res, 'Not authorized', 403);
      }

      const filter: any = { campaignId };
      if (req.query.status) filter.status = req.query.status;

      const [contributions, total] = await Promise.all([
        Contribution.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Contribution.countDocuments(filter),
      ]);

      sendPaginated(res, contributions, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCreatorContributions(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const skip = (page - 1) * limit;

      const filter: any = { creatorId: req.user!._id };
      if (req.query.status) filter.status = req.query.status;
      if (req.query.campaignId) filter.campaignId = req.query.campaignId;

      let sort: any = { createdAt: -1 };
      if (req.query.sort === 'oldest') sort = { createdAt: 1 };

      const [contributions, total] = await Promise.all([
        Contribution.find(filter).sort(sort).skip(skip).limit(limit).lean(),
        Contribution.countDocuments(filter),
      ]);

      sendPaginated(res, contributions, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
