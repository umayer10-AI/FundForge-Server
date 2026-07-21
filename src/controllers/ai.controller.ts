import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';
import { aiService } from '../services/ai.service';

export const aiController = {
  async chat(req: AuthRequest, res: Response) {
    try {
      const { message, type, campaignData } = req.body;

      let result;

      switch (type) {
        case 'title':
          result = await aiService.generateCampaignTitles(campaignData?.story || message);
          break;
        case 'improve':
          result = await aiService.improveStory(campaignData?.story || message);
          break;
        case 'summary':
          result = await aiService.generateSummary(campaignData?.story || message);
          break;
        case 'rewards':
          result = await aiService.suggestRewards(campaignData?.category || message);
          break;
        case 'goal':
          result = await aiService.suggestFundingGoal(
            campaignData?.category || '',
            campaignData?.story || message
          );
          break;
        case 'faq':
          result = await aiService.generateFAQ(
            campaignData?.title || 'Campaign',
            campaignData?.category || '',
            campaignData?.story || message
          );
          break;
        case 'marketing':
          result = await aiService.getMarketingTips();
          break;
        case 'analyze':
          result = await aiService.analyzeCampaign({
            title: campaignData?.title || '',
            story: campaignData?.story || message,
            category: campaignData?.category || '',
            goal: campaignData?.goal || 0,
          });
          break;
        case 'grammar':
          result = await aiService.improveStory(campaignData?.story || message);
          break;
        default:
          result = await aiService.answerQuestion(message);
      }

      if (!result.success) {
        return sendError(res, result.message || 'AI request failed', 500);
      }

      sendSuccess(res, { response: result.data, type }, 'Success');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },
};
