"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUnreadCount = exports.clearAllNotifications = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.createNotification = void 0;
const models_1 = require("../models");
const createNotification = async (params) => {
    try {
        const notification = await models_1.Notification.create({
            title: params.title,
            message: params.message,
            type: params.type,
            icon: params.icon || getIconForType(params.type),
            toEmail: params.toEmail,
            fromEmail: params.fromEmail,
            actionRoute: params.actionRoute,
        });
        return notification;
    }
    catch (error) {
        console.error('Failed to create notification:', error);
        return null;
    }
};
exports.createNotification = createNotification;
const getIconForType = (type) => {
    const icons = {
        success: 'check-circle',
        info: 'info',
        warning: 'alert-triangle',
        error: 'alert-circle',
        campaign: 'rocket',
        contribution: 'heart',
        payment: 'credit-card',
        withdrawal: 'wallet',
        report: 'flag',
        system: 'settings',
    };
    return icons[type] || 'bell';
};
const markAsRead = async (notificationId, email) => {
    return models_1.Notification.findOneAndUpdate({ _id: notificationId, toEmail: email }, { isRead: true }, { new: true });
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (email) => {
    return models_1.Notification.updateMany({ toEmail: email, isRead: false }, { isRead: true });
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (notificationId, email) => {
    return models_1.Notification.findOneAndDelete({ _id: notificationId, toEmail: email });
};
exports.deleteNotification = deleteNotification;
const clearAllNotifications = async (email) => {
    return models_1.Notification.deleteMany({ toEmail: email });
};
exports.clearAllNotifications = clearAllNotifications;
const getUnreadCount = async (email) => {
    return models_1.Notification.countDocuments({ toEmail: email, isRead: false });
};
exports.getUnreadCount = getUnreadCount;
//# sourceMappingURL=notification.service.js.map