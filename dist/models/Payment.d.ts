import mongoose, { Document } from 'mongoose';
import { IPayment } from '../types';
export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {
}
export declare const Payment: mongoose.Model<PaymentDocument, {}, {}, {}, mongoose.Document<unknown, {}, PaymentDocument, {}, {}> & PaymentDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Payment.d.ts.map