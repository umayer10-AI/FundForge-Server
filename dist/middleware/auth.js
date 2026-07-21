"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const response_1 = require("../utils/response");
const config_1 = require("../config");
const authenticate = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        else if (req.cookies?.session_token) {
            token = req.cookies.session_token;
        }
        if (!token) {
            return (0, response_1.sendError)(res, 'Authentication required', 401);
        }
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.betterAuth.secret);
        const user = await models_1.User.findById(decoded.id).select('-password');
        if (!user) {
            return (0, response_1.sendError)(res, 'User not found', 401);
        }
        if (user.isBlocked) {
            return (0, response_1.sendError)(res, 'Account is blocked', 403);
        }
        req.user = {
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            credits: user.credits,
        };
        next();
    }
    catch (error) {
        return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return (0, response_1.sendError)(res, 'Authentication required', 401);
        }
        if (!roles.includes(req.user.role)) {
            return (0, response_1.sendError)(res, 'You do not have permission to access this resource', 403);
        }
        next();
    };
};
exports.authorize = authorize;
//# sourceMappingURL=auth.js.map