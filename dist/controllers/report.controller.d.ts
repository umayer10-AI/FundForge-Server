import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const reportController: {
    create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAll(req: AuthRequest, res: Response): Promise<void>;
    review(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    dismiss(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    resolve(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    suspendCampaign(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=report.controller.d.ts.map