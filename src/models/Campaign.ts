import mongoose, { Schema, Document } from 'mongoose';
import { ICampaign } from '../types';

export interface CampaignDocument extends Omit<ICampaign, '_id'>, Document {}

const campaignSchema = new Schema<CampaignDocument>(
  {
    title: { type: String, required: true, trim: true },
    story: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    goal: { type: Number, required: true, min: 1 },
    minimumContribution: { type: Number, required: true, min: 1 },
    deadline: { type: Date, required: true },
    reward: { type: String },
    image: { type: String },
    creatorId: { type: String, required: true },
    creatorName: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    raisedAmount: { type: Number, default: 0 },
    totalSupporters: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'suspended', 'completed'], default: 'pending' },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ deadline: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ raisedAmount: -1 });
campaignSchema.index({ creatorId: 1 });
campaignSchema.index({ title: 'text', story: 'text' });

export const Campaign = mongoose.model<CampaignDocument>('Campaign', campaignSchema);
