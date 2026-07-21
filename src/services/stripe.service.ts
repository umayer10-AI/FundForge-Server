import Stripe from 'stripe';
import { config } from '../config';
import { logger } from '../utils/logger';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2024-11-20.acacia' as any,
});

export const CREDIT_PACKAGES = [
  { id: 'credits_100', credits: 100, price: 10, name: 'Starter Pack' },
  { id: 'credits_300', credits: 300, price: 25, name: 'Popular Pack', popular: true },
  { id: 'credits_800', credits: 800, price: 60, name: 'Pro Pack', save: true },
  { id: 'credits_1500', credits: 1500, price: 110, name: 'Ultimate Pack', save: true },
];

export const CREDIT_CONVERSION = {
  PURCHASE_RATE: 10, // 10 credits = $1
  WITHDRAWAL_RATE: 20, // 20 raised credits = $1
  MIN_WITHDRAWAL_CREDITS: 200,
};

export const stripeService = {
  async createCheckoutSession(userId: string, email: string, packageId: string) {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) throw new Error('Invalid package');

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
      success_url: `${config.frontendUrl}/dashboard/supporter/purchase-credit?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/dashboard/supporter/purchase-credit?canceled=true`,
    });

    return session;
  },

  async retrieveCheckoutSession(sessionId: string) {
    return stripe.checkout.sessions.retrieve(sessionId);
  },

  constructWebhookEvent(payload: Buffer, signature: string): Stripe.Event {
    if (!config.stripe.webhookSecret || config.stripe.webhookSecret === 'whsec_test_placeholder') {
      logger.warn('Stripe webhook secret not configured');
      return JSON.parse(payload.toString());
    }
    return stripe.webhooks.constructEvent(payload, signature, config.stripe.webhookSecret);
  },
};
