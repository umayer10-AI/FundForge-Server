import mongoose, { Document } from 'mongoose';
import { IReport } from '../types';
export interface ReportDocument extends Omit<IReport, '_id'>, Document {
}
export declare const Report: mongoose.Model<ReportDocument, {}, {}, {}, mongoose.Document<unknown, {}, ReportDocument, {}, {}> & ReportDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Report.d.ts.map