import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const contributionController: {
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approve(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    reject(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyContributions(req: AuthRequest, res: Response): Promise<void>;
    getCampaignContributions(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getCreatorContributions(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=contribution.controller.d.ts.map