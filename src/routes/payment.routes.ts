import { Router } from 'express';
import { paymentController } from '../controllers/payment.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/packages', paymentController.getCreditPackages);
router.get('/history', authenticate, paymentController.getPaymentHistory);
router.get('/verify', authenticate, paymentController.verifySession);
router.post('/create-checkout-session', authenticate, authorize('supporter'), paymentController.createCheckoutSession);
router.post('/webhook', paymentController.handleWebhook);

export default router;
