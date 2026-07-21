import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const adminController: {
    getDashboardStats(_req: AuthRequest, res: Response): Promise<void>;
    getUsers(req: AuthRequest, res: Response): Promise<void>;
    updateUserRole(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleUserStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteUser(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getAllCampaigns(req: AuthRequest, res: Response): Promise<void>;
    approveCampaign(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    rejectCampaign(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPayments(req: AuthRequest, res: Response): Promise<void>;
    getAnalytics(_req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=admin.controller.d.ts.map