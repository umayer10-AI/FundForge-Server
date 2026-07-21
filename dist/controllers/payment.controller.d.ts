import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const paymentController: {
    createCheckoutSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    handleWebhook(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    verifySession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getPaymentHistory(req: AuthRequest, res: Response): Promise<void>;
    getCreditPackages(_req: AuthRequest, res: Response): Promise<void>;
};
//# sourceMappingURL=payment.controller.d.ts.map