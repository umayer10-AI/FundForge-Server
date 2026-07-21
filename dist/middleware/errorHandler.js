"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(message, statusCode = 500, errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    logger_1.logger.error('Error:', err);
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
        });
    }
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map((e) => e.message);
        return res.status(422).json({
            success: false,
            message: 'Validation Error',
            errors,
        });
    }
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate entry',
            errors: ['This record already exists'],
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({
            success: false,
            message: 'Invalid ID format',
            errors: [],
        });
    }
    return res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error',
        errors: [],
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map