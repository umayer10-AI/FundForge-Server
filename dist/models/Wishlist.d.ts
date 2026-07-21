import mongoose, { Document } from 'mongoose';
import { IWishlist } from '../types';
export interface WishlistDocument extends Omit<IWishlist, '_id'>, Document {
}
export declare const Wishlist: mongoose.Model<WishlistDocument, {}, {}, {}, mongoose.Document<unknown, {}, WishlistDocument, {}, {}> & WishlistDocument & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Wishlist.d.ts.map