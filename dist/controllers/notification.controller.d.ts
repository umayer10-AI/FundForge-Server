import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const notificationController: {
    getAll(req: AuthRequest, res: Response): Promise<void>;
    getUnreadCount(req: AuthRequest, res: Response): Promise<void>;
    read(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    readAll(req: AuthRequest, res: Response): Promise<void>;
    remove(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    clearAll(req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=notification.controller.d.ts.map