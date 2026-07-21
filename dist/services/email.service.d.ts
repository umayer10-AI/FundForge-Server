export declare const emailService: {
    sendWelcome: (to: string, name: string, role: string, credits: number) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendVerification: (to: string, token: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendPasswordReset: (to: string, token: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendCampaignApproved: (to: string, campaignTitle: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendCampaignRejected: (to: string, campaignTitle: string, reason: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendContributionApproved: (to: string, campaignTitle: string, amount: number) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendContributionRejected: (to: string, campaignTitle: string, reason?: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendNewContribution: (to: string, campaignTitle: string, amount: number, supporterName: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendWithdrawalApproved: (to: string, amount: number, method: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendWithdrawalRejected: (to: string, reason: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendCreditsPurchased: (to: string, credits: number, price: number) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendReportReceived: (to: string, campaignTitle: string, reason: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
    sendCampaignSuspended: (to: string, campaignTitle: string, reason: string) => Promise<{
        success: boolean;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
    }>;
};
//# sourceMappingURL=email.service.d.ts.map