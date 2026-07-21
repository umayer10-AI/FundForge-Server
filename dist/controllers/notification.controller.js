"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const notification_service_1 = require("../services/notification.service");
exports.notificationController = {
    async getAll(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;
            const filter = { toEmail: req.user.email };
            if (req.query.type)
                filter.type = req.query.type;
            if (req.query.isRead !== undefined)
                filter.isRead = req.query.isRead === 'true';
            const [notifications, total] = await Promise.all([
                models_1.Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Notification.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, notifications, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getUnreadCount(req, res) {
        try {
            const count = await (0, notification_service_1.getUnreadCount)(req.user.email);
            (0, response_1.sendSuccess)(res, { count });
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async read(req, res) {
        try {
            const notification = await (0, notification_service_1.markAsRead)(req.params.id, req.user.email);
            if (!notification)
                return (0, response_1.sendError)(res, 'Notification not found', 404);
            (0, response_1.sendSuccess)(res, notification, 'Marked as read');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async readAll(req, res) {
        try {
            await (0, notification_service_1.markAllAsRead)(req.user.email);
            (0, response_1.sendSuccess)(res, null, 'All notifications marked as read');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async remove(req, res) {
        try {
            const result = await (0, notification_service_1.deleteNotification)(req.params.id, req.user.email);
            if (!result)
                return (0, response_1.sendError)(res, 'Notification not found', 404);
            (0, response_1.sendSuccess)(res, null, 'Notification deleted');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async clearAll(req, res) {
        try {
            await (0, notification_service_1.clearAllNotifications)(req.user.email);
            (0, response_1.sendSuccess)(res, null, 'All notifications cleared');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=notification.controller.js.map