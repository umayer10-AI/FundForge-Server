"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contributionController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
exports.contributionController = {
    async create(req, res) {
        try {
            const { campaignId, amount, message } = req.body;
            if (req.user.role !== 'supporter') {
                return (0, response_1.sendError)(res, 'Only supporters can contribute', 403);
            }
            const campaign = await models_1.Campaign.findById(campaignId);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            if (campaign.status !== 'approved')
                return (0, response_1.sendError)(res, 'Campaign is not accepting contributions', 400);
            if (new Date(campaign.deadline) < new Date())
                return (0, response_1.sendError)(res, 'Campaign deadline has passed', 400);
            if (amount < campaign.minimumContribution) {
                return (0, response_1.sendError)(res, `Minimum contribution is ${campaign.minimumContribution} credits`, 400);
            }
            if (req.user.credits < amount) {
                return (0, response_1.sendError)(res, 'Insufficient credits', 400);
            }
            const user = await models_1.User.findById(req.user._id);
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            user.credits -= amount;
            await user.save();
            await models_1.CreditTransaction.create({
                userId: user._id.toString(),
                email: user.email,
                type: 'contribution',
                credits: amount,
                balanceBefore: user.credits + amount,
                balanceAfter: user.credits,
                referenceId: campaignId,
                description: `Contribution to "${campaign.title}"`,
            });
            const contribution = await models_1.Contribution.create({
                campaignId,
                campaignTitle: campaign.title,
                supporterId: req.user._id,
                supporterName: req.user.name,
                supporterEmail: req.user.email,
                creatorId: campaign.creatorId,
                creatorEmail: campaign.creatorEmail,
                amount,
                message,
                status: 'pending',
            });
            await (0, notification_service_1.createNotification)({
                title: 'New Contribution',
                message: `${req.user.name} contributed ${amount} credits to "${campaign.title}"`,
                type: 'contribution',
                toEmail: campaign.creatorEmail,
                fromEmail: req.user.email,
                actionRoute: '/dashboard/creator/contributions',
            });
            await email_service_1.emailService.sendNewContribution(campaign.creatorEmail, campaign.title, amount, req.user.name);
            (0, response_1.sendSuccess)(res, contribution, 'Contribution submitted. Awaiting creator approval.', 201);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async approve(req, res) {
        try {
            const contribution = await models_1.Contribution.findById(req.params.id);
            if (!contribution)
                return (0, response_1.sendError)(res, 'Contribution not found', 404);
            if (contribution.creatorId !== req.user._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Not authorized', 403);
            }
            if (contribution.status !== 'pending')
                return (0, response_1.sendError)(res, 'Contribution already processed', 400);
            contribution.status = 'approved';
            await contribution.save();
            await models_1.Campaign.findByIdAndUpdate(contribution.campaignId, {
                $inc: { raisedAmount: contribution.amount, totalSupporters: 1 },
            });
            await (0, notification_service_1.createNotification)({
                title: 'Contribution Approved',
                message: `Your contribution of ${contribution.amount} credits to "${contribution.campaignTitle}" has been approved.`,
                type: 'success',
                toEmail: contribution.supporterEmail,
                fromEmail: req.user.email,
                actionRoute: '/dashboard/supporter/contributions',
            });
            await email_service_1.emailService.sendContributionApproved(contribution.supporterEmail, contribution.campaignTitle, contribution.amount);
            (0, response_1.sendSuccess)(res, contribution, 'Contribution approved');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async reject(req, res) {
        try {
            const contribution = await models_1.Contribution.findById(req.params.id);
            if (!contribution)
                return (0, response_1.sendError)(res, 'Contribution not found', 404);
            if (contribution.creatorId !== req.user._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Not authorized', 403);
            }
            if (contribution.status !== 'pending')
                return (0, response_1.sendError)(res, 'Contribution already processed', 400);
            contribution.status = 'rejected';
            await contribution.save();
            const supporter = await models_1.User.findById(contribution.supporterId);
            if (supporter) {
                supporter.credits += contribution.amount;
                await supporter.save();
                await models_1.CreditTransaction.create({
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
            await (0, notification_service_1.createNotification)({
                title: 'Contribution Rejected',
                message: `Your contribution of ${contribution.amount} credits to "${contribution.campaignTitle}" has been rejected. Credits refunded.`,
                type: 'warning',
                toEmail: contribution.supporterEmail,
                fromEmail: req.user.email,
            });
            await email_service_1.emailService.sendContributionRejected(contribution.supporterEmail, contribution.campaignTitle);
            (0, response_1.sendSuccess)(res, contribution, 'Contribution rejected. Credits refunded.');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getMyContributions(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = { supporterId: req.user._id };
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.search) {
                filter.$or = [
                    { campaignTitle: { $regex: req.query.search, $options: 'i' } },
                    { supporterName: { $regex: req.query.search, $options: 'i' } },
                ];
            }
            let sort = { createdAt: -1 };
            if (req.query.sort === 'oldest')
                sort = { createdAt: 1 };
            const [contributions, total] = await Promise.all([
                models_1.Contribution.find(filter).sort(sort).skip(skip).limit(limit).lean(),
                models_1.Contribution.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, contributions, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getCampaignContributions(req, res) {
        try {
            const { campaignId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const campaign = await models_1.Campaign.findById(campaignId);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            if (campaign.creatorId !== req.user._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Not authorized', 403);
            }
            const filter = { campaignId };
            if (req.query.status)
                filter.status = req.query.status;
            const [contributions, total] = await Promise.all([
                models_1.Contribution.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Contribution.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, contributions, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getCreatorContributions(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const filter = { creatorId: req.user._id };
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.campaignId)
                filter.campaignId = req.query.campaignId;
            let sort = { createdAt: -1 };
            if (req.query.sort === 'oldest')
                sort = { createdAt: 1 };
            const [contributions, total] = await Promise.all([
                models_1.Contribution.find(filter).sort(sort).skip(skip).limit(limit).lean(),
                models_1.Contribution.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, contributions, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=contribution.controller.js.map