"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const config_1 = require("../config");
exports.reportController = {
    async create(req, res) {
        try {
            const { campaignId, reason, description } = req.body;
            if (req.user.role !== 'supporter') {
                return (0, response_1.sendError)(res, 'Only supporters can report campaigns', 403);
            }
            const campaign = await models_1.Campaign.findById(campaignId);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            const existing = await models_1.Report.findOne({ campaignId, reportedBy: req.user._id });
            if (existing)
                return (0, response_1.sendError)(res, 'You have already reported this campaign', 400);
            const report = await models_1.Report.create({
                campaignId,
                campaignTitle: campaign.title,
                reportedBy: req.user._id,
                reporterEmail: req.user.email,
                reason,
                description,
                status: 'pending',
            });
            const admins = await models_1.User.find({ role: 'admin' });
            for (const admin of admins) {
                await (0, notification_service_1.createNotification)({
                    title: 'New Report',
                    message: `Campaign "${campaign.title}" has been reported for: ${reason}`,
                    type: 'report',
                    toEmail: admin.email,
                    fromEmail: req.user.email,
                    actionRoute: '/dashboard/admin/reports',
                });
            }
            await email_service_1.emailService.sendReportReceived(config_1.config.adminEmail, campaign.title, reason);
            (0, response_1.sendSuccess)(res, report, 'Report submitted successfully', 201);
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
            const [reports, total] = await Promise.all([
                models_1.Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Report.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, reports, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async review(req, res) {
        try {
            const report = await models_1.Report.findByIdAndUpdate(req.params.id, { status: 'reviewed' }, { new: true });
            if (!report)
                return (0, response_1.sendError)(res, 'Report not found', 404);
            (0, response_1.sendSuccess)(res, report, 'Report marked as reviewed');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async dismiss(req, res) {
        try {
            const report = await models_1.Report.findByIdAndUpdate(req.params.id, { status: 'dismissed' }, { new: true });
            if (!report)
                return (0, response_1.sendError)(res, 'Report not found', 404);
            (0, response_1.sendSuccess)(res, report, 'Report dismissed');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async resolve(req, res) {
        try {
            const report = await models_1.Report.findByIdAndUpdate(req.params.id, { status: 'resolved' }, { new: true });
            if (!report)
                return (0, response_1.sendError)(res, 'Report not found', 404);
            (0, response_1.sendSuccess)(res, report, 'Report resolved');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async suspendCampaign(req, res) {
        try {
            const { reason } = req.body;
            const report = await models_1.Report.findById(req.params.id);
            if (!report)
                return (0, response_1.sendError)(res, 'Report not found', 404);
            const campaign = await models_1.Campaign.findById(report.campaignId);
            if (!campaign)
                return (0, response_1.sendError)(res, 'Campaign not found', 404);
            campaign.status = 'suspended';
            await campaign.save();
            report.status = 'resolved';
            await report.save();
            await (0, notification_service_1.createNotification)({
                title: 'Campaign Suspended',
                message: `Your campaign "${campaign.title}" has been suspended. Reason: ${reason || 'Policy violation'}`,
                type: 'error',
                toEmail: campaign.creatorEmail,
                fromEmail: config_1.config.adminEmail,
            });
            await email_service_1.emailService.sendCampaignSuspended(campaign.creatorEmail, campaign.title, reason || 'Policy violation');
            (0, response_1.sendSuccess)(res, { report, campaign }, 'Campaign suspended');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=report.controller.js.map