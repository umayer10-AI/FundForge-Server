import { Response } from 'express';
import { Payment, User, CreditTransaction } from '../models';
import { AuthRequest } from '../middleware/auth';
import { sendSuccess, sendError, sendPaginated } from '../utils/response';
import { stripeService, CREDIT_PACKAGES } from '../services/stripe.service';
import { createNotification } from '../services/notification.service';
import { emailService } from '../services/email.service';
import { config } from '../config';

export const paymentController = {
  async createCheckoutSession(req: AuthRequest, res: Response) {
    try {
      const { packageId } = req.body;
      const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
      if (!pkg) return sendError(res, 'Invalid package selected', 400);

      const session = await stripeService.createCheckoutSession(req.user!._id, req.user!.email, packageId);

      await Payment.create({
        userId: req.user!._id,
        email: req.user!.email,
        packageName: pkg.name,
        credits: pkg.credits,
        price: pkg.price,
        checkoutSessionId: session.id,
        status: 'pending',
      });

      sendSuccess(res, { url: session.url, sessionId: session.id }, 'Checkout session created');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async handleWebhook(req: AuthRequest, res: Response) {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const event = stripeService.constructWebhookEvent(req.body, sig);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as any;
        const { userId, credits, packageName } = session.metadata;

        const payment = await Payment.findOne({ checkoutSessionId: session.id });
        if (payment && payment.status === 'succeeded') {
          return sendSuccess(res, null, 'Already processed');
        }

        const user = await User.findById(userId);
        if (!user) return sendError(res, 'User not found', 404);

        const creditAmount = parseInt(credits);
        user.credits += creditAmount;
        await user.save();

        await CreditTransaction.create({
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

        await createNotification({
          title: 'Credits Purchased',
          message: `You purchased ${creditAmount} credits (${packageName})!`,
          type: 'payment',
          toEmail: user.email,
          fromEmail: config.adminEmail,
          actionRoute: '/dashboard/supporter/purchase-credit',
        });

        await emailService.sendCreditsPurchased(user.email, creditAmount, payment?.price || 0);
      }

      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object as any;
        const payment = await Payment.findOne({ paymentIntentId: paymentIntent.id });
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }
      }

      sendSuccess(res, null, 'Webhook processed');
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async verifySession(req: AuthRequest, res: Response) {
    try {
      const { session_id } = req.query;
      if (!session_id) return sendError(res, 'Session ID required', 400);

      const session = await stripeService.retrieveCheckoutSession(session_id as string);
      const payment = await Payment.findOne({ checkoutSessionId: session_id });

      sendSuccess(res, {
        sessionStatus: session.payment_status,
        paymentStatus: payment?.status || 'pending',
        payment,
      });
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getPaymentHistory(req: AuthRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const filter: any = { userId: req.user!._id };
      const [payments, total] = await Promise.all([
        Payment.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
        Payment.countDocuments(filter),
      ]);

      sendPaginated(res, payments, total, page, limit);
    } catch (error: any) {
      sendError(res, error.message);
    }
  },

  async getCreditPackages(_req: AuthRequest, res: Response) {
    sendSuccess(res, CREDIT_PACKAGES);
  },
};
