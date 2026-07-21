import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const campaignController: {
    create(req: AuthRequest, res: Response): Promise<void>;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyCampaigns(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    delete(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getFeatured(req: AuthRequest, res: Response): Promise<void>;
    getCategories(_req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=campaign.controller.d.ts.map