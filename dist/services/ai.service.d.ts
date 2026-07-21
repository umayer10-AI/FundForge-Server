interface AIRequestOptions {
    prompt?: string;
    systemPrompt?: string;
    temperature?: number;
    maxTokens?: number;
}
export declare const aiService: {
    generate(prompt: string, options?: AIRequestOptions): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    generateCampaignTitles(story: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    improveStory(story: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    generateSummary(story: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    suggestRewards(category: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    suggestFundingGoal(category: string, story: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    generateFAQ(campaignTitle: string, category: string, story: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getMarketingTips(): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    answerQuestion(question: string): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    analyzeCampaign(campaignData: {
        title: string;
        story: string;
        category: string;
        goal: number;
    }): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
};
export {};
//# sourceMappingURL=ai.service.d.ts.map