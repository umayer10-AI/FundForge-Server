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
export declare const createNotification: (params: CreateNotificationParams) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification").NotificationDocument, {}, {}> & import("../models/Notification").NotificationDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const markAsRead: (notificationId: string, email: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification").NotificationDocument, {}, {}> & import("../models/Notification").NotificationDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const markAllAsRead: (email: string) => Promise<import("mongoose").UpdateWriteOpResult>;
export declare const deleteNotification: (notificationId: string, email: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Notification").NotificationDocument, {}, {}> & import("../models/Notification").NotificationDocument & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const clearAllNotifications: (email: string) => Promise<import("mongodb").DeleteResult>;
export declare const getUnreadCount: (email: string) => Promise<number>;
export {};
//# sourceMappingURL=notification.service.d.ts.map