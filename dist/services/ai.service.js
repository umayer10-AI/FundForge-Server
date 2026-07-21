"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiService = void 0;
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const SYSTEM_PROMPTS = {
    'campaign-writer': `You are an expert crowdfunding campaign writer for FundForge AI. 
Help creators write compelling, emotional, and persuasive campaign stories.
Focus on clarity, emotional connection, and call-to-action.`,
    'marketing-expert': `You are a marketing expert for FundForge AI.
Provide actionable marketing tips, social media strategies, and promotional advice for crowdfunding campaigns.`,
    'funding-advisor': `You are a funding advisor for FundForge AI.
Analyze campaign goals, suggest optimal funding targets, and provide budget recommendations.`,
    'customer-support': `You are a helpful support assistant for FundForge AI.
Answer questions about how the platform works, including campaigns, contributions, withdrawals, and credits.`,
    'grammar-expert': `You are a grammar and writing expert for FundForge AI.
Fix grammar, spelling, punctuation, and improve readability while preserving the original meaning.`,
};
exports.aiService = {
    async generate(prompt, options = {}) {
        const fullPrompt = options.prompt || prompt;
        const systemPrompt = options.systemPrompt || SYSTEM_PROMPTS['campaign-writer'];
        const temperature = options.temperature ?? 0.7;
        const maxTokens = options.maxTokens ?? 1024;
        try {
            if (!config_1.config.grok.apiKey) {
                logger_1.logger.warn('Groq API key not configured');
                return { success: false, message: 'AI service not configured', data: null };
            }
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${config_1.config.grok.apiKey}`,
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: fullPrompt },
                    ],
                    temperature,
                    max_tokens: maxTokens,
                    stream: false,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                logger_1.logger.error('Groq API error:', { status: response.status, body: errorText });
                let message = 'AI request failed';
                try {
                    const errJson = JSON.parse(errorText);
                    message = errJson.error?.message || message;
                }
                catch { /* ignore */ }
                return { success: false, message, data: null };
            }
            const result = await response.json();
            return {
                success: true,
                message: 'Success',
                data: result.choices[0]?.message?.content || '',
            };
        }
        catch (error) {
            logger_1.logger.error('AI service error:', error);
            return { success: false, message: 'AI request failed', data: null };
        }
    },
    async generateCampaignTitles(story) {
        return this.generate(`Based on this campaign story, generate 5 creative, catchy, emotional, and SEO-friendly campaign titles:

Story: ${story}

Return only the titles, one per line, numbered 1-5.`, {
            systemPrompt: SYSTEM_PROMPTS['campaign-writer'],
        });
    },
    async improveStory(story) {
        return this.generate(`Improve the following campaign story. Enhance grammar, readability, emotional tone, persuasiveness, and make it more professional while keeping the original meaning:

${story}

Return the improved story.`, {
            systemPrompt: SYSTEM_PROMPTS['grammar-expert'],
            maxTokens: 2048,
        });
    },
    async generateSummary(story) {
        return this.generate(`Generate three versions of a summary for this campaign story:
1. Short summary (1 sentence)
2. Medium summary (2-3 sentences)
3. Long summary (1 paragraph)

Story: ${story}

Label each version clearly.`, {
            systemPrompt: SYSTEM_PROMPTS['campaign-writer'],
        });
    },
    async suggestRewards(category) {
        return this.generate(`For a ${category} crowdfunding campaign, suggest:
1. 3 Basic reward ideas
2. 3 Exclusive reward ideas
3. 3 Premium reward ideas
4. 3 Digital reward ideas

Make them specific to ${category} campaigns.`, {
            systemPrompt: SYSTEM_PROMPTS['campaign-writer'],
        });
    },
    async suggestFundingGoal(category, story) {
        return this.generate(`Analyze this crowdfunding campaign and suggest an appropriate funding goal:

Category: ${category}
Story: ${story}

Provide:
1. Suggested funding goal
2. Brief reasoning
3. Estimated budget breakdown
4. Recommendations`, {
            systemPrompt: SYSTEM_PROMPTS['funding-advisor'],
        });
    },
    async generateFAQ(campaignTitle, category, story) {
        return this.generate(`Generate 8 frequently asked questions and answers for this crowdfunding campaign:

Campaign: ${campaignTitle}
Category: ${category}
Story: ${story}

Return as numbered Q&A pairs.`, {
            systemPrompt: SYSTEM_PROMPTS['campaign-writer'],
            maxTokens: 2048,
        });
    },
    async getMarketingTips() {
        return this.generate(`Provide actionable marketing tips for a crowdfunding campaign creator. Include tips for social media, email marketing, community building, and promotional strategies.`, {
            systemPrompt: SYSTEM_PROMPTS['marketing-expert'],
            maxTokens: 2048,
        });
    },
    async answerQuestion(question) {
        return this.generate(`Answer this question about the FundForge AI crowdfunding platform:

Question: ${question}

Provide a clear, helpful, and accurate answer based on how crowdfunding platforms work.`, {
            systemPrompt: SYSTEM_PROMPTS['customer-support'],
        });
    },
    async analyzeCampaign(campaignData) {
        return this.generate(`Analyze this crowdfunding campaign and provide:
1. Campaign Score (0-100)
2. Strengths (3 points)
3. Weaknesses (3 points)
4. Missing Information
5. Improvement Suggestions

Campaign Title: ${campaignData.title}
Category: ${campaignData.category}
Goal: ${campaignData.goal} credits
Story: ${campaignData.story}`, {
            systemPrompt: SYSTEM_PROMPTS['campaign-writer'],
            maxTokens: 2048,
        });
    },
};
//# sourceMappingURL=ai.service.js.map