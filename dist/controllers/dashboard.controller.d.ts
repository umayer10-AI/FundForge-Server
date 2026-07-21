import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const dashboardController: {
    getSupporterStats(req: AuthRequest, res: Response): Promise<void>;
    getCreatorStats(req: AuthRequest, res: Response): Promise<void>;
    getCreatorAnalytics(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=dashboard.controller.d.ts.map