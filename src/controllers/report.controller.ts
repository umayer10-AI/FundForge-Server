import { Response } from 'express';
import { Report, Campaign, User } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

export const reportController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const { campaignId, reason, description } = req.body;

      if (req.user!.role !== 'supporter') {
        return sendError(res, 'Only supporters can report campaigns', 403);
      }

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) return sendError(res, 'Campaign not found', 404);

      const existing = await Report.findOne({ campaignId, reportedBy: req.user!._id });
      if (existing) return sendError(res, 'You have already reported this campaign', 400);

      const report = await Report.create({
        campaignId,
        campaignTitle: campaign.title,
        reportedBy: req.user!._id,
        reporterEmail: req.user!.email,
        reason,
        description,
        status: 'pending',
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          title: 'New Report',
          message: `Campaign "${campaign.title}" has been reported for: ${reason}`,
          type: 'report',
          toEmail: admin.email,
          fromEmail: req.user!.email,
          actionRoute: '/dashboard/admin/reports',
        });
      }

      await emailService.sendReportReceived(config.adminEmail, campaign.title, reason);

      sendSuccess(res, report, 'Report submitted successfully', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = {};
      if (req.query.status) filter.status = req.query.status;

      const [reports, total] = await Promise.all([
        Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Report.countDocuments(filter),
      ]);

      sendPaginated(res, reports, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async review(req: AuthRequest, res: Response) {
    try {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: 'reviewed' },
        { new: true }
      );
      if (!report) return sendError(res, 'Report not found', 404);
      sendSuccess(res, report, 'Report marked as reviewed');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async dismiss(req: AuthRequest, res: Response) {
    try {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: 'dismissed' },
        { new: true }
      );
      if (!report) return sendError(res, 'Report not found', 404);
      sendSuccess(res, report, 'Report dismissed');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async resolve(req: AuthRequest, res: Response) {
    try {
      const report = await Report.findByIdAndUpdate(
        req.params.id,
        { status: 'resolved' },
        { new: true }
      );
      if (!report) return sendError(res, 'Report not found', 404);
      sendSuccess(res, report, 'Report resolved');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async suspendCampaign(req: AuthRequest, res: Response) {
    try {
      const { reason } = req.body;
      const report = await Report.findById(req.params.id);
      if (!report) return sendError(res, 'Report not found', 404);

      const campaign = await Campaign.findById(report.campaignId);
      if (!campaign) return sendError(res, 'Campaign not found', 404);

      campaign.status = 'suspended';
      await campaign.save();

      report.status = 'resolved';
      await report.save();

      await createNotification({
        title: 'Campaign Suspended',
        message: `Your campaign "${campaign.title}" has been suspended. Reason: ${reason || 'Policy violation'}`,
        type: 'error',
        toEmail: campaign.creatorEmail,
        fromEmail: config.adminEmail,
      });

      await emailService.sendCampaignSuspended(campaign.creatorEmail, campaign.title, reason || 'Policy violation');

      sendSuccess(res, { report, campaign }, 'Campaign suspended');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
