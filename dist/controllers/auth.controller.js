"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const config_1 = require("../config");
const response_1 = require("../utils/response");
const email_service_1 = require("../services/email.service");
const notification_service_1 = require("../services/notification.service");
const generateToken = (user) => {
    return jsonwebtoken_1.default.sign({ id: user._id, email: user.email, role: user.role }, config_1.config.betterAuth.secret, { expiresIn: '7d' });
};
exports.authController = {
    async register(req, res) {
        try {
            const { name, email, password, role, photo } = req.body;
            const existing = await models_1.User.findOne({ email: email.toLowerCase() });
            if (existing) {
                return (0, response_1.sendError)(res, 'Email already registered', 409);
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const credits = role === 'creator' ? 20 : 50;
            const user = await models_1.User.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
                credits,
                photo: photo || '',
                provider: 'email',
                emailVerified: false,
            });
            const token = generateToken(user);
            await (0, notification_service_1.createNotification)({
                title: 'Welcome to FundForge AI!',
                message: `Welcome ${name}! You've received ${credits} credits to get started.`,
                type: 'success',
                toEmail: user.email,
                fromEmail: config_1.config.adminEmail,
                actionRoute: `/dashboard/${role}`,
            });
            await email_service_1.emailService.sendWelcome(user.email, user.name, user.role, credits);
            (0, response_1.sendSuccess)(res, {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    photo: user.photo,
                },
            }, 'Registration successful', 201);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await models_1.User.findOne({ email: email.toLowerCase() });
            if (!user) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 401);
            }
            if (user.provider === 'google') {
                return (0, response_1.sendError)(res, 'This email uses Google login. Please sign in with Google.', 401);
            }
            if (user.isBlocked) {
                return (0, response_1.sendError)(res, 'Account is blocked. Contact support.', 403);
            }
            const isMatch = await bcryptjs_1.default.compare(password, user.password || '');
            if (!isMatch) {
                return (0, response_1.sendError)(res, 'Invalid email or password', 401);
            }
            user.lastLogin = new Date();
            await user.save();
            const token = generateToken(user);
            (0, response_1.sendSuccess)(res, {
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    credits: user.credits,
                    photo: user.photo,
                    provider: user.provider,
                },
            }, 'Login successful');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async googleAuth(req, res) {
        try {
            const { email, name, photo } = req.body;
            if (!email) {
                return (0, response_1.sendError)(res, 'Email is required', 400);
            }
            let user = await models_1.User.findOne({ email: email.toLowerCase() });
            if (user) {
                if (user.provider !== 'google') {
                    return (0, response_1.sendError)(res, 'This email is registered with email/password. Please login with your password.', 401);
                }
                user.lastLogin = new Date();
                await user.save();
                const token = generateToken(user);
                return (0, response_1.sendSuccess)(res, { token, user: { ...user.toObject(), password: undefined } }, 'Login successful');
            }
            const { role } = req.body;
            if (!role || !['supporter', 'creator'].includes(role)) {
                return (0, response_1.sendError)(res, 'Please select a role: supporter or creator', 400);
            }
            const credits = role === 'creator' ? 20 : 50;
            user = await models_1.User.create({
                name,
                email: email.toLowerCase(),
                photo: photo || '',
                role,
                credits,
                provider: 'google',
                emailVerified: true,
            });
            const token = generateToken(user);
            await (0, notification_service_1.createNotification)({
                title: 'Welcome to FundForge AI!',
                message: `Welcome ${name}! You've received ${credits} credits to get started.`,
                type: 'success',
                toEmail: user.email,
                fromEmail: config_1.config.adminEmail,
                actionRoute: `/dashboard/${role}`,
            });
            await email_service_1.emailService.sendWelcome(user.email, user.name, user.role, credits);
            (0, response_1.sendSuccess)(res, { token, user: { ...user.toObject(), password: undefined } }, 'Registration successful', 201);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getMe(req, res) {
        try {
            const user = await models_1.User.findById(req.user?._id).select('-password');
            if (!user) {
                return (0, response_1.sendError)(res, 'User not found', 404);
            }
            (0, response_1.sendSuccess)(res, user);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async updateProfile(req, res) {
        try {
            const { name, photo } = req.body;
            const updateData = {};
            if (name)
                updateData.name = name;
            if (photo)
                updateData.photo = photo;
            const user = await models_1.User.findByIdAndUpdate(req.user?._id, updateData, { new: true }).select('-password');
            (0, response_1.sendSuccess)(res, user, 'Profile updated');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const user = await models_1.User.findById(req.user?._id);
            if (!user)
                return (0, response_1.sendError)(res, 'User not found', 404);
            if (user.provider === 'google') {
                return (0, response_1.sendError)(res, 'Google accounts cannot change password here', 400);
            }
            const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password || '');
            if (!isMatch)
                return (0, response_1.sendError)(res, 'Current password is incorrect', 400);
            const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
            user.password = hashedPassword;
            await user.save();
            (0, response_1.sendSuccess)(res, null, 'Password changed successfully');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
};
//# sourceMappingURL=auth.controller.js.map