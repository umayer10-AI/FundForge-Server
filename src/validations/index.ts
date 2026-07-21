import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name must be at most 50 characters'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[a-z]/, 'Password must contain a lowercase letter')
      .regex(/[0-9]/, 'Password must contain a number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain a special character'),
    role: z.enum(['supporter', 'creator']),
    photo: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const campaignSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    story: z.string().min(200, 'Story must be at least 200 characters'),
    category: z.string().min(1, 'Category is required'),
    goal: z.coerce.number().positive('Goal must be positive'),
    minimumContribution: z.coerce.number().positive('Minimum contribution must be positive'),
    deadline: z.string().refine((val) => new Date(val) > new Date(), 'Deadline must be in the future'),
    reward: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const campaignUpdateSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    story: z.string().min(200).optional(),
    reward: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const contributionSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1, 'Campaign ID is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    message: z.string().max(500).optional(),
  }),
});

export const withdrawalSchema = z.object({
  body: z.object({
    credits: z.coerce.number().positive('Credits must be positive'),
    paymentMethod: z.string().min(1, 'Payment method is required'),
    accountNumber: z.string().min(1, 'Account number is required'),
    remarks: z.string().optional(),
  }),
});

export const reportSchema = z.object({
  body: z.object({
    campaignId: z.string().min(1, 'Campaign ID is required'),
    reason: z.string().min(1, 'Reason is required'),
    description: z.string().max(500).optional(),
  }),
});

export const aiChatSchema = z.object({
  body: z.object({
    message: z.string().min(1, 'Message is required').max(2000, 'Message too long'),
    type: z.enum(['chat', 'title', 'improve', 'summary', 'rewards', 'goal', 'faq', 'marketing', 'analyze', 'grammar']).default('chat'),
    campaignData: z.any().optional(),
  }),
});
