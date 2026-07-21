import mongoose, { Schema, Document } from 'mongoose';
import { IContribution } from '../types';

export interface ContributionDocument extends Omit<IContribution, '_id'>, Document {}

const contributionSchema = new Schema<ContributionDocument>(
  {
    campaignId: { type: String, required: true },
    campaignTitle: { type: String, required: true },
    supporterId: { type: String, required: true },
    supporterName: { type: String, required: true },
    supporterEmail: { type: String, required: true },
    creatorId: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    amount: { type: Number, required: true, min: 1 },
    message: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

contributionSchema.index({ campaignId: 1 });
contributionSchema.index({ supporterId: 1 });
contributionSchema.index({ creatorId: 1 });
contributionSchema.index({ status: 1 });

export const Contribution = mongoose.model<ContributionDocument>('Contribution', contributionSchema);
