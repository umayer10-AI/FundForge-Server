import mongoose, { Document } from 'mongoose';
import { INotification } from '../types';
export interface NotificationDocument extends Omit<INotification, '_id'>, Document {
}
export declare const Notification: mongoose.Model<NotificationDocument, {}, {}, {}, mongoose.Document<unknown, {}, NotificationDocument, {}, {}> & NotificationDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Notification.d.ts.map