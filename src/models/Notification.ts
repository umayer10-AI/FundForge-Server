import mongoose, { Schema, Document } from 'mongoose';
import { INotification } from '../types';

export interface NotificationDocument extends Omit<INotification, '_id'>, Document {}

const notificationSchema = new Schema<NotificationDocument>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['success', 'info', 'warning', 'error', 'campaign', 'contribution', 'payment', 'withdrawal', 'report', 'system'], default: 'info' },
    icon: { type: String, default: 'bell' },
    toEmail: { type: String, required: true },
    fromEmail: { type: String, required: true },
    actionRoute: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

notificationSchema.index({ toEmail: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model<NotificationDocument>('Notification', notificationSchema);
