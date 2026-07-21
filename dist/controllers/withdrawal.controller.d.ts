import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const withdrawalController: {
    request(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approve(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    reject(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyWithdrawals(req: AuthRequest, res: Response): Promise<void>;
    getPending(req: AuthRequest, res: Response): Promise<void>;
    getAll(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=withdrawal.controller.d.ts.map