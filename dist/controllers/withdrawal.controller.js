"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const config_1 = require("../config");
const WITHDRAWAL_RATE = 20;
const MIN_WITHDRAWAL = 200;
exports.withdrawalController = {
    async request(req, res) {
        try {
            const { credits, paymentMethod, accountNumber, remarks } = req.body;
            if (req.user.role !== 'creator') {
                return (0, response_1.sendError)(res, 'Only creators can withdraw', 403);
            }
            if (credits < MIN_WITHDRAWAL) {
                return (0, response_1.sendError)(res, `Minimum withdrawal is ${MIN_WITHDRAWAL} credits`, 400);
            }
            const campaigns = await models_1.Campaign.find({ creatorId: req.user._id, status: 'approved' });
            const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
            const existingWithdrawals = await models_1.Withdrawal.find({
                creatorId: req.user._id,
                status: { $in: ['pending', 'approved'] },
            });
            const withdrawnCredits = existingWithdrawals.reduce((sum, w) => sum + w.credits, 0);
            const available = totalRaised - withdrawnCredits;
            if (credits > available) {
                return (0, response_1.sendError)(res, `You can withdraw a maximum of ${available} credits`, 400);
            }
            const amount = credits / WITHDRAWAL_RATE;
            const withdrawal = await models_1.Withdrawal.create({
                creatorId: req.user._id,
                creatorEmail: req.user.email,
                credits,
                amount,
                paymentMethod,
                accountNumber,
                remarks,
                status: 'pending',
                requestedAt: new Date(),
            });
            const admins = await models_1.User.find({ role: 'admin' });
            for (const admin of admins) {
                await (0, notification_service_1.createNotification)({
                    title: 'Withdrawal Request',
                    message: `${req.user.name} requested a withdrawal of $${amount} (${credits} credits) via ${paymentMethod}.`,
                    type: 'withdrawal',
                    toEmail: admin.email,
                    fromEmail: req.user.email,
                    actionRoute: '/dashboard/admin/withdrawals',
                });
            }
            await (0, notification_service_1.createNotification)({
                title: 'Withdrawal Requested',
                message: `Your withdrawal request for $${amount} (${credits} credits) has been submitted. Awaiting admin approval.`,
                type: 'withdrawal',
                toEmail: req.user.email,
                fromEmail: config_1.config.adminEmail,
            });
            (0, response_1.sendSuccess)(res, withdrawal, 'Withdrawal request submitted', 201);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async approve(req, res) {
        try {
            const withdrawal = await models_1.Withdrawal.findById(req.params.id);
            if (!withdrawal)
                return (0, response_1.sendError)(res, 'Withdrawal not found', 404);
            if (withdrawal.status !== 'pending')
                return (0, response_1.sendError)(res, 'Withdrawal already processed', 400);
            withdrawal.status = 'approved';
            withdrawal.approvedAt = new Date();
            await withdrawal.save();
            await models_1.CreditTransaction.create({
                userId: withdrawal.creatorId,
                email: withdrawal.creatorEmail,
                type: 'withdrawal',
                credits: -withdrawal.credits,
                balanceBefore: 0,
                balanceAfter: 0,
                referenceId: withdrawal._id.toString(),
                description: `Withdrawal of ${withdrawal.credits} credits approved`,
            });
            await (0, notification_service_1.createNotification)({
                title: 'Withdrawal Approved',
                message: `Your withdrawal of $${withdrawal.amount} via ${withdrawal.paymentMethod} has been approved.`,
                type: 'success',
                toEmail: withdrawal.creatorEmail,
                fromEmail: config_1.config.adminEmail,
            });
            await email_service_1.emailService.sendWithdrawalApproved(withdrawal.creatorEmail, withdrawal.amount, withdrawal.paymentMethod);
            (0, response_1.sendSuccess)(res, withdrawal, 'Withdrawal approved');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async reject(req, res) {
        try {
            const { reason } = req.body;
            const withdrawal = await models_1.Withdrawal.findById(req.params.id);
            if (!withdrawal)
                return (0, response_1.sendError)(res, 'Withdrawal not found', 404);
            if (withdrawal.status !== 'pending')
                return (0, response_1.sendError)(res, 'Withdrawal already processed', 400);
            withdrawal.status = 'rejected';
            withdrawal.rejectionReason = reason || 'No reason provided';
            await withdrawal.save();
            await (0, notification_service_1.createNotification)({
                title: 'Withdrawal Rejected',
                message: `Your withdrawal of $${withdrawal.amount} has been rejected. Reason: ${reason || 'N/A'}`,
                type: 'error',
                toEmail: withdrawal.creatorEmail,
                fromEmail: config_1.config.adminEmail,
            });
            await email_service_1.emailService.sendWithdrawalRejected(withdrawal.creatorEmail, reason || 'No reason provided');
            (0, response_1.sendSuccess)(res, withdrawal, 'Withdrawal rejected');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getMyWithdrawals(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = { creatorId: req.user._id };
            if (req.query.status)
                filter.status = req.query.status;
            const [withdrawals, total] = await Promise.all([
                models_1.Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Withdrawal.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, withdrawals, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getPending(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = { status: 'pending' };
            const [withdrawals, total] = await Promise.all([
                models_1.Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Withdrawal.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, withdrawals, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = {};
            if (req.query.status)
                filter.status = req.query.status;
            const [withdrawals, total] = await Promise.all([
                models_1.Withdrawal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Withdrawal.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, withdrawals, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=withdrawal.controller.js.map