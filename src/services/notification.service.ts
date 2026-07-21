import { Notification } from '../models';
import { NotificationType } from '../types';

interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  icon?: string;
  toEmail: string;
  fromEmail: string;
  actionRoute?: string;
}

export const createNotification = async (params: CreateNotificationParams) => {
  try {
    const notification = await Notification.create({
      title: params.title,
      message: params.message,
      type: params.type,
      icon: params.icon || getIconForType(params.type),
      toEmail: params.toEmail,
      fromEmail: params.fromEmail,
      actionRoute: params.actionRoute,
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
};

const getIconForType = (type: NotificationType): string => {
  const icons: Record<string, string> = {
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

export const markAsRead = async (notificationId: string, email: string) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, toEmail: email },
    { isRead: true },
    { new: true }
  );
};

export const markAllAsRead = async (email: string) => {
  return Notification.updateMany(
    { toEmail: email, isRead: false },
    { isRead: true }
  );
};

export const deleteNotification = async (notificationId: string, email: string) => {
  return Notification.findOneAndDelete({ _id: notificationId, toEmail: email });
};

export const clearAllNotifications = async (email: string) => {
  return Notification.deleteMany({ toEmail: email });
};

export const getUnreadCount = async (email: string) => {
  return Notification.countDocuments({ toEmail: email, isRead: false });
};
