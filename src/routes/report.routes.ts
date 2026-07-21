import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reportSchema } from '../validations';

const router = Router();

router.post('/', authenticate, authorize('supporter'), validate(reportSchema), reportController.create);

export default router;
