import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/supporter', authenticate, authorize('supporter'), dashboardController.getSupporterStats);
router.get('/creator', authenticate, authorize('creator'), dashboardController.getCreatorStats);
router.get('/creator/analytics', authenticate, authorize('creator'), dashboardController.getCreatorAnalytics);

export default router;
