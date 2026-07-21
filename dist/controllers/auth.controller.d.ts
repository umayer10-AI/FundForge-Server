import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const authController: {
    register(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    login(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    googleAuth(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMe(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateProfile(req: AuthRequest, res: Response): Promise<void>;
    changePassword(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=auth.controller.d.ts.map