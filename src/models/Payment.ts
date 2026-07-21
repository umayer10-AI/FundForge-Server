import mongoose, { Schema, Document } from 'mongoose';
import { IPayment } from '../types';

export interface PaymentDocument extends Omit<IPayment, '_id'>, Document {}

const paymentSchema = new Schema<PaymentDocument>(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
    packageName: { type: String, required: true },
    credits: { type: Number, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'usd' },
    paymentIntentId: { type: String },
    checkoutSessionId: { type: String },
    status: { type: String, enum: ['pending', 'succeeded', 'failed', 'refunded'], default: 'pending' },
    paymentMethod: { type: String },
  },
  { timestamps: true }
);

paymentSchema.index({ userId: 1 });
paymentSchema.index({ status: 1 });

export const Payment = mongoose.model<PaymentDocument>('Payment', paymentSchema);
