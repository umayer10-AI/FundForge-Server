import mongoose, { Schema, Document } from 'mongoose';
import { IWithdrawal } from '../types';

export interface WithdrawalDocument extends Omit<IWithdrawal, '_id'>, Document {}

const withdrawalSchema = new Schema<WithdrawalDocument>(
  {
    creatorId: { type: String, required: true },
    creatorEmail: { type: String, required: true },
    credits: { type: Number, required: true, min: 1 },
    amount: { type: Number, required: true, min: 0.01 },
    paymentMethod: { type: String, required: true },
    accountNumber: { type: String, required: true },
    remarks: { type: String },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    rejectionReason: { type: String },
    requestedAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

withdrawalSchema.index({ creatorId: 1 });
withdrawalSchema.index({ status: 1 });

export const Withdrawal = mongoose.model<WithdrawalDocument>('Withdrawal', withdrawalSchema);
