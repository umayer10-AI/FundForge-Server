"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = void 0;
const models_1 = require("../models");
const response_1 = require("../utils/response");
const stripe_service_1 = require("../services/stripe.service");
const notification_service_1 = require("../services/notification.service");
const email_service_1 = require("../services/email.service");
const config_1 = require("../config");
exports.paymentController = {
    async createCheckoutSession(req, res) {
        try {
            const { packageId } = req.body;
            const pkg = stripe_service_1.CREDIT_PACKAGES.find(p => p.id === packageId);
            if (!pkg)
                return (0, response_1.sendError)(res, 'Invalid package selected', 400);
            const session = await stripe_service_1.stripeService.createCheckoutSession(req.user._id, req.user.email, packageId);
            await models_1.Payment.create({
                userId: req.user._id,
                email: req.user.email,
                packageName: pkg.name,
                credits: pkg.credits,
                price: pkg.price,
                checkoutSessionId: session.id,
                status: 'pending',
            });
            (0, response_1.sendSuccess)(res, { url: session.url, sessionId: session.id }, 'Checkout session created');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async handleWebhook(req, res) {
        try {
            const sig = req.headers['stripe-signature'];
            const event = stripe_service_1.stripeService.constructWebhookEvent(req.body, sig);
            if (event.type === 'checkout.session.completed') {
                const session = event.data.object;
                const { userId, credits, packageName } = session.metadata;
                const payment = await models_1.Payment.findOne({ checkoutSessionId: session.id });
                if (payment && payment.status === 'succeeded') {
                    return (0, response_1.sendSuccess)(res, null, 'Already processed');
                }
                const user = await models_1.User.findById(userId);
                if (!user)
                    return (0, response_1.sendError)(res, 'User not found', 404);
                const creditAmount = parseInt(credits);
                user.credits += creditAmount;
                await user.save();
                await models_1.CreditTransaction.create({
                    userId: user._id.toString(),
                    email: user.email,
                    type: 'purchase',
                    credits: creditAmount,
                    balanceBefore: user.credits - creditAmount,
                    balanceAfter: user.credits,
                    referenceId: session.id,
                    description: `Purchased ${packageName} (${creditAmount} credits)`,
                });
                if (payment) {
                    payment.status = 'succeeded';
                    payment.paymentIntentId = session.payment_intent;
                    payment.paymentMethod = session.payment_method_types?.[0] || 'card';
                    await payment.save();
                }
                await (0, notification_service_1.createNotification)({
                    title: 'Credits Purchased',
                    message: `You purchased ${creditAmount} credits (${packageName})!`,
                    type: 'payment',
                    toEmail: user.email,
                    fromEmail: config_1.config.adminEmail,
                    actionRoute: '/dashboard/supporter/purchase-credit',
                });
                await email_service_1.emailService.sendCreditsPurchased(user.email, creditAmount, payment?.price || 0);
            }
            if (event.type === 'payment_intent.payment_failed') {
                const paymentIntent = event.data.object;
                const payment = await models_1.Payment.findOne({ paymentIntentId: paymentIntent.id });
                if (payment) {
                    payment.status = 'failed';
                    await payment.save();
                }
            }
            (0, response_1.sendSuccess)(res, null, 'Webhook processed');
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async verifySession(req, res) {
        try {
            const { session_id } = req.query;
            if (!session_id)
                return (0, response_1.sendError)(res, 'Session ID required', 400);
            const session = await stripe_service_1.stripeService.retrieveCheckoutSession(session_id);
            const payment = await models_1.Payment.findOne({ checkoutSessionId: session_id });
            (0, response_1.sendSuccess)(res, {
                sessionStatus: session.payment_status,
                paymentStatus: payment?.status || 'pending',
                payment,
            });
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getPaymentHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;
            const filter = { userId: req.user._id };
            const [payments, total] = await Promise.all([
                models_1.Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
                models_1.Payment.countDocuments(filter),
            ]);
            (0, response_1.sendPaginated)(res, payments, total, page, limit);
        }
        catch (error) {
            (0, response_1.sendError)(res, error.message);
        }
    },
    async getCreditPackages(_req, res) {
        (0, response_1.sendSuccess)(res, stripe_service_1.CREDIT_PACKAGES);
    },
};
//# sourceMappingURL=payment.controller.js.map