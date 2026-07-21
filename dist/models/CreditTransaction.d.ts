import mongoose, { Document } from 'mongoose';
import { ICreditTransaction } from '../types';
export interface CreditTransactionDocument extends Omit<ICreditTransaction, '_id'>, Document {
}
export declare const CreditTransaction: mongoose.Model<CreditTransactionDocument, {}, {}, {}, mongoose.Document<unknown, {}, CreditTransactionDocument, {}, {}> & CreditTransactionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=CreditTransaction.d.ts.map