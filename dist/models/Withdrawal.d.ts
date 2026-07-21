import mongoose, { Document } from 'mongoose';
import { IWithdrawal } from '../types';
export interface WithdrawalDocument extends Omit<IWithdrawal, '_id'>, Document {
}
export declare const Withdrawal: mongoose.Model<WithdrawalDocument, {}, {}, {}, mongoose.Document<unknown, {}, WithdrawalDocument, {}, {}> & WithdrawalDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Withdrawal.d.ts.map