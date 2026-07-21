import { Response } from 'express';
import { Withdrawal, User, Campaign, CreditTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

const WITHDRAWAL_RATE = 20;
const MIN_WITHDRAWAL = 200;

export const withdrawalController = {
  async request(req: AuthRequest, res: Response) {
    try {
      const { credits, paymentMethod, accountNumber, remarks } = req.body;

      if (req.user!.role !== 'creator') {
        return sendError(res, 'Only creators can withdraw', 403);
      }

      if (credits < MIN_WITHDRAWAL) {
        return sendError(res, `Minimum withdrawal is ${MIN_WITHDRAWAL} credits`, 400);
      }

      const campaigns = await Campaign.find({ creatorId: req.user!._id, status: 'approved' });
      const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);

      const existingWithdrawals = await Withdrawal.find({
        creatorId: req.user!._id,
        status: { $in: ['pending', 'approved'] },
      });
      const withdrawnCredits = existingWithdrawals.reduce((sum, w) => sum + w.credits, 0);

      const available = totalRaised - withdrawnCredits;
      if (credits > available) {
        return sendError(res, `You can withdraw a maximum of ${available} credits`, 400);
      }

      const amount = credits / WITHDRAWAL_RATE;

      const withdrawal = await Withdrawal.create({
        creatorId: req.user!._id,
        creatorEmail: req.user!.email,
        credits,
        amount,
        paymentMethod,
        accountNumber,
        remarks,
        status: 'pending',
        requestedAt: new Date(),
      });

      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification({
          title: 'Withdrawal Request',
          message: `${req.user!.name} requested a withdrawal of $${amount} (${credits} credits) via ${paymentMethod}.`,
          type: 'withdrawal',
          toEmail: admin.email,
          fromEmail: req.user!.email,
          actionRoute: '/dashboard/admin/withdrawals',
        });
      }

      await createNotification({
        title: 'Withdrawal Requested',
        message: `Your withdrawal request for $${amount} (${credits} credits) has been submitted. Awaiting admin approval.`,
        type: 'withdrawal',
        toEmail: req.user!.email,
        fromEmail: config.adminEmail,
      });

      sendSuccess(res, withdrawal, 'Withdrawal request submitted', 201);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async approve(req: AuthRequest, res: Response) {
    try {
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal) return sendError(res, 'Withdrawal not found', 404);
      if (withdrawal.status !== 'pending') return sendError(res, 'Withdrawal already processed', 400);

      withdrawal.status = 'approved';
      withdrawal.approvedAt = new Date();
      await withdrawal.save();

      await CreditTransaction.create({
        userId: withdrawal.creatorId,
        email: withdrawal.creatorEmail,
        type: 'withdrawal',
        credits: -withdrawal.credits,
        balanceBefore: 0,
        balanceAfter: 0,
        referenceId: withdrawal._id.toString(),
        description: `Withdrawal of ${withdrawal.credits} credits approved`,
      });

      await createNotification({
        title: 'Withdrawal Approved',
        message: `Your withdrawal of $${withdrawal.amount} via ${withdrawal.paymentMethod} has been approved.`,
        type: 'success',
        toEmail: withdrawal.creatorEmail,
        fromEmail: config.adminEmail,
      });

      await emailService.sendWithdrawalApproved(withdrawal.creatorEmail, withdrawal.amount, withdrawal.paymentMethod);

      sendSuccess(res, withdrawal, 'Withdrawal approved');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async reject(req: AuthRequest, res: Response) {
    try {
      const { reason } = req.body;
      const withdrawal = await Withdrawal.findById(req.params.id);
      if (!withdrawal) return sendError(res, 'Withdrawal not found', 404);
      if (withdrawal.status !== 'pending') return sendError(res, 'Withdrawal already processed', 400);

      withdrawal.status = 'rejected';
      withdrawal.rejectionReason = reason || 'No reason provided';
      await withdrawal.save();

      await createNotification({
        title: 'Withdrawal Rejected',
        message: `Your withdrawal of $${withdrawal.amount} has been rejected. Reason: ${reason || 'N/A'}`,
        type: 'error',
        toEmail: withdrawal.creatorEmail,
        fromEmail: config.adminEmail,
      });

      await emailService.sendWithdrawalRejected(withdrawal.creatorEmail, reason || 'No reason provided');

      sendSuccess(res, withdrawal, 'Withdrawal rejected');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getMyWithdrawals(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = { creatorId: req.user!._id };
      if (req.query.status) filter.status = req.query.status;

      const [withdrawals, total] = await Promise.all([
        Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Withdrawal.countDocuments(filter),
      ]);

      sendPaginated(res, withdrawals, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getPending(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = { status: 'pending' };
      const [withdrawals, total] = await Promise.all([
        Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Withdrawal.countDocuments(filter),
      ]);

      sendPaginated(res, withdrawals, total, page, limit);
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

      const [withdrawals, total] = await Promise.all([
        Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Withdrawal.countDocuments(filter),
      ]);

      sendPaginated(res, withdrawals, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
