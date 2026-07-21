import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface UserDocument extends Omit<IUser, '_id'>, Document {}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    photo: { type: String, default: '' },
    role: { type: String, enum: ['supporter', 'creator', 'admin'], default: 'supporter' },
    credits: { type: Number, default: 0 },
    provider: { type: String, enum: ['email', 'google'], default: 'email' },
    emailVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

export const User = mongoose.model<UserDocument>('User', userSchema);
