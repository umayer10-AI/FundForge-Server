"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
exports.dashboardController = {
    async getSupporterStats(req, res) {
        try {
            const [totalContributions, approvedContributions, pendingContributions, rejectedContributions, totalPayments] = await Promise.all([
                models_1.Contribution.countDocuments({ supporterId: req.user._id }),
                models_1.Contribution.countDocuments({ supporterId: req.user._id, status: 'approved' }),
                models_1.Contribution.countDocuments({ supporterId: req.user._id, status: 'pending' }),
                models_1.Contribution.countDocuments({ supporterId: req.user._id, status: 'rejected' }),
                models_1.Payment.aggregate([
                    { $match: { userId: req.user._id, status: 'succeeded' } },
                    { $group: { _id: null, total: { $sum: '$price' } } },
                ]),
            ]);
            const totalSpent = totalPayments[0]?.total || 0;
            const user = await models_1.User.findById(req.user._id).select('credits');
            (0, response_1.sendSuccess)(res, {
                credits: user?.credits || 0,
                contributions: {
                    total: totalContributions,
                    approved: approvedContributions,
                    pending: pendingContributions,
                    rejected: rejectedContributions,
                },
                totalSpent,
            });
        }
        catch (error) {
            sendError(res, error.message);
        }
    },
    async getCreatorStats(req, res) {
        try {
            const [totalCampaigns, activeCampaigns, pendingCampaigns, completedCampaigns, totalContributions, pendingContributions, totalWithdrawals] = await Promise.all([
                models_1.Campaign.countDocuments({ creatorId: req.user._id }),
                models_1.Campaign.countDocuments({ creatorId: req.user._id, status: 'approved', deadline: { $gt: new Date() } }),
                models_1.Campaign.countDocuments({ creatorId: req.user._id, status: 'pending' }),
                models_1.Campaign.countDocuments({ creatorId: req.user._id, status: 'completed' }),
                models_1.Contribution.countDocuments({ creatorId: req.user._id }),
                models_1.Contribution.countDocuments({ creatorId: req.user._id, status: 'pending' }),
                models_1.Withdrawal.aggregate([
                    { $match: { creatorId: req.user._id, status: 'approved' } },
                    { $group: { _id: null, total: { $sum: '$credits' } } },
                ]),
            ]);
            const campaigns = await models_1.Campaign.find({ creatorId: req.user._id, status: 'approved' });
            const totalRaised = campaigns.reduce((sum, c) => sum + c.raisedAmount, 0);
            const totalSupporters = campaigns.reduce((sum, c) => sum + c.totalSupporters, 0);
            const withdrawnCredits = totalWithdrawals[0]?.total || 0;
            const availableWithdrawal = totalRaised - withdrawnCredits;
            (0, response_1.sendSuccess)(res, {
                campaigns: { total: totalCampaigns, active: activeCampaigns, pending: pendingCampaigns, completed: completedCampaigns },
                totalRaised,
                totalSupporters,
                contributions: { total: totalContributions, pending: pendingContributions },
                availableWithdrawal: Math.max(0, availableWithdrawal),
            });
        }
        catch (error) {
            sendError(res, error.message);
        }
    },
    async getCreatorAnalytics(req, res) {
        try {
            const [monthlyRaised, campaignGrowth, contributionTrend, categoryDistribution] = await Promise.all([
                models_1.Contribution.aggregate([
                    { $match: { creatorId: req.user._id, status: 'approved' } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
                models_1.Campaign.aggregate([
                    { $match: { creatorId: req.user._id } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
                models_1.Contribution.aggregate([
                    { $match: { creatorId: req.user._id } },
                    { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } },
                    { $limit: 12 },
                ]),
                models_1.Campaign.aggregate([
                    { $match: { creatorId: req.user._id } },
                    { $group: { _id: '$category', count: { $sum: 1 }, totalRaised: { $sum: '$raisedAmount' } } },
                ]),
            ]);
            (0, response_1.sendSuccess)(res, { monthlyRaised, campaignGrowth, contributionTrend, categoryDistribution });
        }
        catch (error) {
            sendError(res, error.message);
        }
    },
};
function sendError(res, message, statusCode = 500) {
    return res.status(statusCode).json({ success: false, message, errors: [] });
}
//# sourceMappingURL=dashboard.controller.js.map