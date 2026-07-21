import mongoose, { Document } from 'mongoose';
import { IContribution } from '../types';
export interface ContributionDocument extends Omit<IContribution, '_id'>, Document {
}
export declare const Contribution: mongoose.Model<ContributionDocument, {}, {}, {}, mongoose.Document<unknown, {}, ContributionDocument, {}, {}> & ContributionDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Contribution.d.ts.map