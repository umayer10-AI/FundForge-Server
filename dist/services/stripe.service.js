"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.CREDIT_CONVERSION = exports.CREDIT_PACKAGES = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = require("../config");
const logger_1 = require("../utils/logger");
const stripe = new stripe_1.default(config_1.config.stripe.secretKey, {
    apiVersion: '2024-11-20.acacia',
});
exports.CREDIT_PACKAGES = [
    { id: 'credits_100', credits: 100, price: 10, name: 'Starter Pack' },
    { id: 'credits_300', credits: 300, price: 25, name: 'Popular Pack', popular: true },
    { id: 'credits_800', credits: 800, price: 60, name: 'Pro Pack', save: true },
    { id: 'credits_1500', credits: 1500, price: 110, name: 'Ultimate Pack', save: true },
];
exports.CREDIT_CONVERSION = {
    PURCHASE_RATE: 10, // 10 credits = $1
    WITHDRAWAL_RATE: 20, // 20 raised credits = $1
    MIN_WITHDRAWAL_CREDITS: 200,
};
exports.stripeService = {
    async createCheckoutSession(userId, email, packageId) {
        const pkg = exports.CREDIT_PACKAGES.find(p => p.id === packageId);
        if (!pkg)
            throw new Error('Invalid package');
        const session = await stripe.checkout.sessions.create({
            customer_email: email,
            client_reference_id: userId,
            mode: 'payment',
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `${pkg.credits} Credits - ${pkg.name}`,
                            description: `Purchase ${pkg.credits} credits for FundForge AI`,
                        },
                        unit_amount: pkg.price * 100,
                    },
                    quantity: 1,
                },
            ],
            metadata: {
                userId,
                credits: pkg.credits.toString(),
                packageName: pkg.name,
                packageId: pkg.id,
            },
            success_url: `${config_1.config.frontendUrl}/dashboard/supporter/purchase-credit?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${config_1.config.frontendUrl}/dashboard/supporter/purchase-credit?canceled=true`,
        });
        return session;
    },
    async retrieveCheckoutSession(sessionId) {
        return stripe.checkout.sessions.retrieve(sessionId);
    },
    constructWebhookEvent(payload, signature) {
        if (!config_1.config.stripe.webhookSecret || config_1.config.stripe.webhookSecret === 'whsec_test_placeholder') {
            logger_1.logger.warn('Stripe webhook secret not configured');
            return JSON.parse(payload.toString());
        }
        return stripe.webhooks.constructEvent(payload, signature, config_1.config.stripe.webhookSecret);
    },
};
//# sourceMappingURL=stripe.service.js.map