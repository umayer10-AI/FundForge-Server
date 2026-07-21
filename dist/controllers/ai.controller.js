"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiController = void 0;
const response_1 = require("../utils/response");
const ai_service_1 = require("../services/ai.service");
exports.aiController = {
    async chat(req, res) {
        try {
            const { message, type, campaignData } = req.body;
            let result;
            switch (type) {
                case 'title':
                    result = await ai_service_1.aiService.generateCampaignTitles(campaignData?.story || message);
                    break;
                case 'improve':
                    result = await ai_service_1.aiService.improveStory(campaignData?.story || message);
                    break;
                case 'summary':
                    result = await ai_service_1.aiService.generateSummary(campaignData?.story || message);
                    break;
                case 'rewards':
                    result = await ai_service_1.aiService.suggestRewards(campaignData?.category || message);
                    break;
                case 'goal':
                    result = await ai_service_1.aiService.suggestFundingGoal(campaignData?.category || '', campaignData?.story || message);
                    break;
                case 'faq':
                    result = await ai_service_1.aiService.generateFAQ(campaignData?.title || 'Campaign', campaignData?.category || '', campaignData?.story || message);
                    break;
                case 'marketing':
                    result = await ai_service_1.aiService.getMarketingTips();
                    break;
                case 'analyze':
                    result = await ai_service_1.aiService.analyzeCampaign({
                        title: campaignData?.title || '',
                        story: campaignData?.story || message,
                        category: campaignData?.category || '',
                        goal: campaignData?.goal || 0,
                    });
                    break;
                case 'grammar':
                    result = await ai_service_1.aiService.improveStory(campaignData?.story || message);
                    break;
                default:
                    result = await ai_service_1.aiService.answerQuestion(message);
            }
            if (!result.success) {
                return (0, response_1.sendError)(res, result.message || 'AI request failed', 500);
            }
            (0, response_1.sendSuccess)(res, { response: result.data, type }, 'Success');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=ai.controller.js.map