import { Router } from 'express';
import { withdrawalController } from '../controllers/withdrawal.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { withdrawalSchema } from '../validations';

const router = Router();

router.get('/my', authenticate, authorize('creator'), withdrawalController.getMyWithdrawals);
router.post('/', authenticate, authorize('creator'), validate(withdrawalSchema), withdrawalController.request);

export default router;
