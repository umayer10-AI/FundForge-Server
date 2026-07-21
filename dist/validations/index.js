"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiChatSchema = exports.reportSchema = exports.withdrawalSchema = exports.contributionSchema = exports.campaignUpdateSchema = exports.campaignSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/[A-Z]/, 'Password must contain an uppercase letter')
            .regex(/[a-z]/, 'Password must contain a lowercase letter')
            .regex(/[0-9]/, 'Password must contain a number')
            .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
        role: zod_1.z.enum(['supporter', 'creator']),
        photo: zod_1.z.string().optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.campaignSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
        story: zod_1.z.string().min(200, 'Story must be at least 200 characters'),
        category: zod_1.z.string().min(1, 'Category is required'),
        goal: zod_1.z.coerce.number().positive('Goal must be positive'),
        minimumContribution: zod_1.z.coerce.number().positive('Minimum contribution must be positive'),
        deadline: zod_1.z.string().refine((val) => new Date(val) > new Date(), 'Deadline must be in the future'),
        reward: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.campaignUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).max(200).optional(),
        story: zod_1.z.string().min(200).optional(),
        reward: zod_1.z.string().optional(),
        image: zod_1.z.string().optional(),
    }),
});
exports.contributionSchema = zod_1.z.object({
    body: zod_1.z.object({
        campaignId: zod_1.z.string().min(1, 'Campaign ID is required'),
        amount: zod_1.z.coerce.number().positive('Amount must be positive'),
        message: zod_1.z.string().max(500).optional(),
    }),
});
exports.withdrawalSchema = zod_1.z.object({
    body: zod_1.z.object({
        credits: zod_1.z.coerce.number().positive('Credits must be positive'),
        paymentMethod: zod_1.z.string().min(1, 'Payment method is required'),
        accountNumber: zod_1.z.string().min(1, 'Account number is required'),
        remarks: zod_1.z.string().optional(),
    }),
});
exports.reportSchema = zod_1.z.object({
    body: zod_1.z.object({
        campaignId: zod_1.z.string().min(1, 'Campaign ID is required'),
        reason: zod_1.z.string().min(1, 'Reason is required'),
        description: zod_1.z.string().max(500).optional(),
    }),
});
exports.aiChatSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1, 'Message is required').max(2000, 'Message too long'),
        type: zod_1.z.enum(['chat', 'title', 'improve', 'summary', 'rewards', 'goal', 'faq', 'marketing', 'analyze', 'grammar']).default('chat'),
        campaignData: zod_1.z.any().optional(),
    }),
});
//# sourceMappingURL=index.js.map