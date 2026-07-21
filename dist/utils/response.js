"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPaginated = exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message = 'Internal Server Error', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.sendError = sendError;
const sendPaginated = (res, data, total, page, limit) => {
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
exports.sendPaginated = sendPaginated;
//# sourceMappingURL=response.js.map