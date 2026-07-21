import { Response } from 'express';

export const sendSuccess = (res: Response, data: any = null, message: string = 'Success', statusCode: number = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res: Response, message: string = 'Internal Server Error', statusCode: number = 500, errors: any[] = []) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export const sendPaginated = (res: Response, data: any[], total: number, page: number, limit: number) => {
  return res.status(200).json({
    success: true,
    message: 'Success',
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrevious: page > 1,
  });
};
