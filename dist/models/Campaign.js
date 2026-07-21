"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Campaign = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const campaignSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
campaignSchema.index({ status: 1 });
campaignSchema.index({ category: 1 });
campaignSchema.index({ deadline: 1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ raisedAmount: -1 });
campaignSchema.index({ creatorId: 1 });
campaignSchema.index({ title: 'text', story: 'text' });
exports.Campaign = mongoose_1.default.model('Campaign', campaignSchema);
//# sourceMappingURL=Campaign.js.map