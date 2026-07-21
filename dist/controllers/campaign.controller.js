"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
const config_1 = require("../config");
exports.campaignController = {
    async create(req, res) {
        try {
            const { title, story, category, goal, minimumContribution, deadline, reward, image } = req.body;
            const campaign = await models_1.Campaign.create({
                title,
                story,
                category,
                goal,
                minimumContribution,
                deadline: new Date(deadline),
                reward,
                image,
                creatorId: req.user._id,
                creatorName: req.user.name,
                creatorEmail: req.user.email,
                status: 'pending',
            });
            await (0, notification_service_1.createNotification)({
                title: 'Campaign Submitted',
                message: `Your campaign "${title}" has been submitted for review.`,
                type: 'campaign',
                toEmail: req.user.email,
                fromEmail: config_1.config.adminEmail,
                actionRoute: '/dashboard/creator/my-campaigns',
            });
            const admins = await models_1.User.find({ role: 'admin' });
            for (const admin of admins) {
                await (0, notification_service_1.createNotification)({
                    title: 'New Campaign',
                    message: `${req.user.name} submitted a new campaign "${title}" for approval.`,
                    type: 'campaign',
                    toEmail: admin.email,
                    fromEmail: req.user.email,
                    actionRoute: '/dashboard/admin/campaign-approvals',
                });
            }
            (0, response_1.sendSuccess)(res, campaign, 'Campaign created successfully', 201);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            const filter = { status: 'approved', deadline: { $gt: new Date() } };
            if (req.query.category)
                filter.category = req.query.category;
            if (req.query.creatorId)
                filter.creatorId = req.query.creatorId;
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.search) {
                filter.$or = [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { story: { $regex: req.query.search, $options: 'i' } },
                    { creatorName: { $regex: req.query.search, $options: 'i' } },
                ];
            }
            if (req.query.minGoal)
                filter.goal = { $gte: parseInt(req.query.minGoal) };
            if (req.query.maxGoal)
                filter.goal = { ...filter.goal, $lte: parseInt(req.query.maxGoal) };
            let sort = { createdAt: -1 };
            if (req.query.sort === 'oldest')
                sort = { createdAt: 1 };
            if (req.query.sort === 'most_raised')
                sort = { raisedAmount: -1 };
            if (req.query.sort === 'least_raised')
                sort = { raisedAmount: 1 };
            if (req.query.sort === 'most_supporters')
                sort = { totalSupporters: -1 };
            if (req.query.sort === 'ending_soon')
                sort = { deadline: 1 };
            if (req.query.sort === 'highest_goal')
                sort = { goal: -1 };
            if (req.query.sort === 'lowest_goal')
                sort = { goal: 1 };
            if (req.query.sort === 'alphabetical')
                sort = { title: 1 };
            if (req.query.sort === 'trending')
                sort = { raisedAmount: -1, totalSupporters: -1 };
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
    async getById(req, res) {
        try {
            const campaign = await models_1.Campaign.findById(req.params.id).lean();
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            if (campaign.status !== 'approved' && campaign.creatorId !== req.user?._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            }
            (0, response_1.sendSuccess)(res, campaign);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getMyCampaigns(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 12;
            const skip = (page - 1) * limit;
            const filter = { creatorId: req.user._id };
            if (req.query.status)
                filter.status = req.query.status;
            if (req.query.search) {
                filter.$or = [
                    { title: { $regex: req.query.search, $options: 'i' } },
                    { category: { $regex: req.query.search, $options: 'i' } },
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
    async update(req, res) {
        try {
            const campaign = await models_1.Campaign.findById(req.params.id);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            if (campaign.creatorId !== req.user._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Not authorized', 403);
            }
            if (['completed', 'suspended'].includes(campaign.status) && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Cannot update a completed or suspended campaign', 400);
            }
            const updates = ['title', 'story', 'reward', 'image'];
            updates.forEach((field) => {
                if (req.body[field] !== undefined)
                    campaign[field] = req.body[field];
            });
            if (req.user?.role !== 'admin') {
                campaign.status = 'pending';
            }
            await campaign.save();
            (0, response_1.sendSuccess)(res, campaign, 'Campaign updated');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async delete(req, res) {
        try {
            const campaign = await models_1.Campaign.findById(req.params.id);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            if (campaign.creatorId !== req.user._id && req.user?.role !== 'admin') {
                return (0, response_1.sendError)(res, 'Not authorized', 403);
            }
            const approvedContributions = await models_1.Contribution.find({ campaignId: campaign._id.toString(), status: 'approved' });
            for (const contrib of approvedContributions) {
                const supporter = await models_1.User.findById(contrib.supporterId);
                if (supporter) {
                    supporter.credits += contrib.amount;
                    await supporter.save();
                    await models_1.CreditTransaction.create({
                        userId: supporter._id.toString(),
                        email: supporter.email,
                        type: 'refund',
                        credits: contrib.amount,
                        balanceBefore: supporter.credits - contrib.amount,
                        balanceAfter: supporter.credits,
                        referenceId: campaign._id.toString(),
                        description: `Refund for deleted campaign: ${campaign.title}`,
                    });
                    await (0, notification_service_1.createNotification)({
                        title: 'Campaign Deleted - Credits Refunded',
                        message: `Campaign "${campaign.title}" has been deleted. ${contrib.amount} credits have been refunded.`,
                        type: 'warning',
                        toEmail: supporter.email,
                        fromEmail: config_1.config.adminEmail,
                    });
                }
            }
            await models_1.Contribution.deleteMany({ campaignId: campaign._id.toString() });
            await models_1.Wishlist.deleteMany({ campaignId: campaign._id.toString() });
            await models_1.Campaign.findByIdAndDelete(req.params.id);
            (0, response_1.sendSuccess)(res, null, 'Campaign deleted. All supporters have been refunded.');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getFeatured(req, res) {
        try {
            const campaigns = await models_1.Campaign.find({ status: 'approved', deadline: { $gt: new Date() } })
                .sort({ raisedAmount: -1, totalSupporters: -1 })
                .limit(6)
                .lean();
            (0, response_1.sendSuccess)(res, campaigns);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getCategories(_req, res) {
        try {
            const categories = await models_1.Campaign.distinct('category', { status: 'approved' });
            (0, response_1.sendSuccess)(res, categories);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=campaign.controller.js.map