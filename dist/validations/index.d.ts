import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        role: z.ZodEnum<["supporter", "creator"]>;
        photo: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        name: string;
        password: string;
        role: "supporter" | "creator";
        photo?: string | undefined;
    }, {
        email: string;
        name: string;
        password: string;
        role: "supporter" | "creator";
        photo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        name: string;
        password: string;
        role: "supporter" | "creator";
        photo?: string | undefined;
    };
}, {
    body: {
        email: string;
        name: string;
        password: string;
        role: "supporter" | "creator";
        photo?: string | undefined;
    };
}>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email: string;
        password: string;
    };
}, {
    body: {
        email: string;
        password: string;
    };
}>;
export declare const campaignSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        story: z.ZodString;
        category: z.ZodString;
        goal: z.ZodNumber;
        minimumContribution: z.ZodNumber;
        deadline: z.ZodEffects<z.ZodString, string, string>;
        reward: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        story: string;
        category: string;
        goal: number;
        minimumContribution: number;
        deadline: string;
        reward?: string | undefined;
        image?: string | undefined;
    }, {
        title: string;
        story: string;
        category: string;
        goal: number;
        minimumContribution: number;
        deadline: string;
        reward?: string | undefined;
        image?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        story: string;
        category: string;
        goal: number;
        minimumContribution: number;
        deadline: string;
        reward?: string | undefined;
        image?: string | undefined;
    };
}, {
    body: {
        title: string;
        story: string;
        category: string;
        goal: number;
        minimumContribution: number;
        deadline: string;
        reward?: string | undefined;
        image?: string | undefined;
    };
}>;
export declare const campaignUpdateSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        story: z.ZodOptional<z.ZodString>;
        reward: z.ZodOptional<z.ZodString>;
        image: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        story?: string | undefined;
        reward?: string | undefined;
        image?: string | undefined;
    }, {
        title?: string | undefined;
        story?: string | undefined;
        reward?: string | undefined;
        image?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title?: string | undefined;
        story?: string | undefined;
        reward?: string | undefined;
        image?: string | undefined;
    };
}, {
    body: {
        title?: string | undefined;
        story?: string | undefined;
        reward?: string | undefined;
        image?: string | undefined;
    };
}>;
export declare const contributionSchema: z.ZodObject<{
    body: z.ZodObject<{
        campaignId: z.ZodString;
        amount: z.ZodNumber;
        message: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        campaignId: string;
        amount: number;
        message?: string | undefined;
    }, {
        campaignId: string;
        amount: number;
        message?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        campaignId: string;
        amount: number;
        message?: string | undefined;
    };
}, {
    body: {
        campaignId: string;
        amount: number;
        message?: string | undefined;
    };
}>;
export declare const withdrawalSchema: z.ZodObject<{
    body: z.ZodObject<{
        credits: z.ZodNumber;
        paymentMethod: z.ZodString;
        accountNumber: z.ZodString;
        remarks: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        credits: number;
        paymentMethod: string;
        accountNumber: string;
        remarks?: string | undefined;
    }, {
        credits: number;
        paymentMethod: string;
        accountNumber: string;
        remarks?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        credits: number;
        paymentMethod: string;
        accountNumber: string;
        remarks?: string | undefined;
    };
}, {
    body: {
        credits: number;
        paymentMethod: string;
        accountNumber: string;
        remarks?: string | undefined;
    };
}>;
export declare const reportSchema: z.ZodObject<{
    body: z.ZodObject<{
        campaignId: z.ZodString;
        reason: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        campaignId: string;
        reason: string;
        description?: string | undefined;
    }, {
        campaignId: string;
        reason: string;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        campaignId: string;
        reason: string;
        description?: string | undefined;
    };
}, {
    body: {
        campaignId: string;
        reason: string;
        description?: string | undefined;
    };
}>;
export declare const aiChatSchema: z.ZodObject<{
    body: z.ZodObject<{
        message: z.ZodString;
        type: z.ZodDefault<z.ZodEnum<["chat", "title", "improve", "summary", "rewards", "goal", "faq", "marketing", "analyze", "grammar"]>>;
        campaignData: z.ZodOptional<z.ZodAny>;
    }, "strip", z.ZodTypeAny, {
        type: "title" | "goal" | "chat" | "improve" | "summary" | "rewards" | "faq" | "marketing" | "analyze" | "grammar";
        message: string;
        campaignData?: any;
    }, {
        message: string;
        type?: "title" | "goal" | "chat" | "improve" | "summary" | "rewards" | "faq" | "marketing" | "analyze" | "grammar" | undefined;
        campaignData?: any;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        type: "title" | "goal" | "chat" | "improve" | "summary" | "rewards" | "faq" | "marketing" | "analyze" | "grammar";
        message: string;
        campaignData?: any;
    };
}, {
    body: {
        message: string;
        type?: "title" | "goal" | "chat" | "improve" | "summary" | "rewards" | "faq" | "marketing" | "analyze" | "grammar" | undefined;
        campaignData?: any;
    };
}>;
//# sourceMappingURL=index.d.ts.map