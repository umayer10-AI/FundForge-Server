import mongoose, { Schema, Document } from 'mongoose';
import { ICreditTransaction } from '../types';

export interface CreditTransactionDocument extends Omit<ICreditTransaction, '_id'>, Document {}

const creditTransactionSchema = new Schema<CreditTransactionDocument>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, enum: ['purchase', 'contribution', 'refund', 'withdrawal', 'adjustment'], required: true },
    credits: { type: Number, required: true },
    balanceBefore: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceId: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

creditTransactionSchema.index({ userId: 1 });
creditTransactionSchema.index({ createdAt: -1 });

export const CreditTransaction = mongoose.model<CreditTransactionDocument>('CreditTransaction', creditTransactionSchema);
