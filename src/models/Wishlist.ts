import mongoose, { Schema, Document } from 'mongoose';
import { IWishlist } from '../types';

export interface WishlistDocument extends Omit<IWishlist, '_id'>, Document {}

const wishlistSchema = new Schema<WishlistDocument>(
  {
    userId: { type: String, required: true },
    campaignId: { type: String, required: true },
  },
  { timestamps: true }
);

wishlistSchema.index({ userId: 1, campaignId: 1 }, { unique: true });

export const Wishlist = mongoose.model<WishlistDocument>('Wishlist', wishlistSchema);
