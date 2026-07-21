"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const config_1 = require("../config");
exports.adminController = {
    async getDashboardStats(_req, res) {
        try {
            const [totalUsers, totalSupporters, totalCreators, totalAdmins, totalCampaigns, approvedCampaigns, pendingCampaigns, rejectedCampaigns, suspendedCampaigns, totalContributions, totalPayments, totalWithdrawals, pendingWithdrawals, pendingReports, totalRaised] = await Promise.all([
                models_1.User.countDocuments(),
                models_1.User.countDocuments({ role: 'supporter' }),
                models_1.User.countDocuments({ role: 'creator' }),
                models_1.User.countDocuments({ role: 'admin' }),
                models_1.Campaign.countDocuments(),
                models_1.Campaign.countDocuments({ status: 'approved' }),
                models_1.Campaign.countDocuments({ status: 'pending' }),
                models_1.Campaign.countDocuments({ status: 'rejected' }),
                models_1.Campaign.countDocuments({ status: 'suspended' }),
                models_1.Contribution.countDocuments(),
                models_1.Payment.countDocuments({ status: 'succeeded' }),
                models_1.Withdrawal.countDocuments(),
                models_1.Withdrawal.countDocuments({ status: 'pending' }),
                models_1.Report.countDocuments({ status: 'pending' }),
                models_1.Campaign.aggregate([{ $group: { _id: null, total: { $sum: '$raisedAmount' } } }]),
            ]);
            (0, response_1.sendSuccess)(res, {
                users: { total: totalUsers, supporters: totalSupporters, creators: totalCreators, admins: totalAdmins },
                campaigns: { total: totalCampaigns, approved: approvedCampaigns, pending: pendingCampaigns, rejected: rejectedCampaigns, suspended: suspendedCampaigns },
                contributions: totalContributions,
                payments: totalPayments,
                withdrawals: { total: totalWithdrawals, pending: pendingWithdrawals },
                reports: { pending: pendingReports },
                totalRaised: totalRaised[0]?.total || 0,
            });
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getUsers(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const filter = {};
            if (req.query.role)
                filter.role = req.query.role;
            if (req.query.search) {
                filter.$or = [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { email: { $regex: req.query.search, $options: 'i' } },
                ];
            }
            let sort = { createdAt: -1 };
            if (req.query.sort === 'oldest')
                sort = { createdAt: 1 };
            if (req.query.sort === 'highest_credits')
                sort = { credits: -1 };
            const [users, total] = await Promise.all([
                models_1.User.find(filter).select('-password').sort(sort).skip(skip).limit(limit).lean(),
                models_1.User.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, users, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async updateUserRole(req, res) {
        try {
            const { role } = req.body;
            if (!['supporter', 'creator', 'admin'].includes(role)) {
                return (0, response_1.sendError)(res, 'Invalid role', 400);
            }
            const user = await models_1.User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            await (0, notification_service_1.createNotification)({
                title: 'Role Updated',
                message: `Your role has been updated to ${role}.`,
                type: 'info',
                toEmail: user.email,
                fromEmail: config_1.config.adminEmail,
            });
            (0, response_1.sendSuccess)(res, user, 'User role updated');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async toggleUserStatus(req, res) {
        try {
            const { action } = req.body; // block, unblock, suspend, activate
            const user = await models_1.User.findById(req.params.id);
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            if (user.role === 'admin' && req.user._id !== user._id.toString()) {
                return (0, response_1.sendError)(res, 'Cannot modify another admin', 403);
            }
            switch (action) {
                case 'block':
                    user.isBlocked = true;
                    break;
                case 'unblock':
                    user.isBlocked = false;
                    break;
                default:
                    return (0, response_1.sendError)(res, 'Invalid action', 400);
            }
            await user.save();
            await (0, notification_service_1.createNotification)({
                title: `Account ${action === 'block' ? 'Blocked' : 'Activated'}`,
                message: `Your account has been ${action === 'block' ? 'blocked' : 'activated'}.`,
                type: action === 'block' ? 'error' : 'success',
                toEmail: user.email,
                fromEmail: config_1.config.adminEmail,
            });
            (0, response_1.sendSuccess)(res, user, `User ${action === 'block' ? 'blocked' : 'activated'} successfully`);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async deleteUser(req, res) {
        try {
            const user = await models_1.User.findById(req.params.id);
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            if (user.role === 'admin') {
                const adminCount = await models_1.User.countDocuments({ role: 'admin' });
                if (adminCount <= 1)
                    return (0, response_1.sendError)(res, 'Cannot delete the last admin', 400);
            }
            await models_1.User.findByIdAndDelete(req.params.id);
            await models_1.Notification.deleteMany({ toEmail: user.email });
            (0, response_1.sendSuccess)(res, null, 'User deleted');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getAllCampaigns(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const filter = {};
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.search) {
                filter.$or = [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { creatorName: { $regex: req.query.search, $options: 'i' } },
                ];
            }
            let sort = { createdAt: -1 };
            if (req.query.sort === 'oldest')
                sort = { createdAt: 1 };
            if (req.query.sort === 'most_raised')
                sort = { raisedAmount: -1 };
            const [campaigns, total] = await Promise.all([
                models_1.Campaign.find(filter).sort(sort).skip(skip).limit(limit).lean(),
                models_1.Campaign.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, campaigns, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async approveCampaign(req, res) {
        try {
            const campaign = await models_1.Campaign.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            await (0, notification_service_1.createNotification)({
                title: 'Campaign Approved',
                message: `Your campaign "${campaign.title}" has been approved and is now visible to supporters!`,
                type: 'success',
                toEmail: campaign.creatorEmail,
                fromEmail: config_1.config.adminEmail,
                actionRoute: '/dashboard/creator/my-campaigns',
            });
            await email_service_1.emailService.sendCampaignApproved(campaign.creatorEmail, campaign.title);
            (0, response_1.sendSuccess)(res, campaign, 'Campaign approved');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async rejectCampaign(req, res) {
        try {
            const { reason } = req.body;
            const campaign = await models_1.Campaign.findByIdAndUpdate(req.params.id, { status: 'rejected', rejectionReason: reason || 'No reason provided' }, { new: true });
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            await (0, notification_service_1.createNotification)({
                title: 'Campaign Rejected',
                message: `Your campaign "${campaign.title}" has been rejected. Reason: ${reason || 'N/A'}`,
                type: 'error',
                toEmail: campaign.creatorEmail,
                fromEmail: config_1.config.adminEmail,
            });
            await email_service_1.emailService.sendCampaignRejected(campaign.creatorEmail, campaign.title, reason || 'No reason provided');
            (0, response_1.sendSuccess)(res, campaign, 'Campaign rejected');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getPayments(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const filter = {};
            if (req.query.status)
                filter.status = req.query.status;
            const [payments, total] = await Promise.all([
                models_1.Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Payment.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, payments, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getAnalytics(_req, res) {
        try {
            const [userGrowth, campaignGrowth, categoryStats, monthlyRevenue] = await Promise.all([
                models_1.User.aggregate([
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
                models_1.Campaign.aggregate([
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
                models_1.Campaign.aggregate([
                    { $group: { _id: '$category', count: { $sum: 1 }, totalRaised: { $sum: '$raisedAmount' } } },
                    { $sort: { count: -1 } },
                ]),
                models_1.Payment.aggregate([
                    { $match: { status: 'succeeded' } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$price' } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
            ]);
            (0, response_1.sendSuccess)(res, { userGrowth, campaignGrowth, categoryStats, monthlyRevenue });
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=admin.controller.js.map