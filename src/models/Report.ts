import mongoose, { Schema, Document } from 'mongoose';
import { IReport } from '../types';

export interface ReportDocument extends Omit<IReport, '_id'>, Document {}

const reportSchema = new Schema<ReportDocument>(
  {
    campaignId: { type: String, required: true },
    campaignTitle: { type: String, required: true },
    reportedBy: { type: String, required: true },
    reporterEmail: { type: String, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['pending', 'reviewed', 'resolved', 'dismissed'], default: 'pending' },
  },
  { timestamps: true }
);

reportSchema.index({ campaignId: 1 });
reportSchema.index({ status: 1 });

export const Report = mongoose.model<ReportDocument>('Report', reportSchema);
