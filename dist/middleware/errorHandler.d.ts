import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    errors: any[];
    constructor(message: string, statusCode?: number, errors?: any[]);
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
//# sourceMappingURL=errorHandler.d.ts.map