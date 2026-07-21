import { Router } from 'express';
import { contributionController } from '../controllers/contribution.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { contributionSchema } from '../validations';

const router = Router();

router.get('/my', authenticate, authorize('supporter'), contributionController.getMyContributions);
router.get('/creator', authenticate, authorize('creator'), contributionController.getCreatorContributions);
router.get('/campaign/:campaignId', authenticate, authorize('creator', 'admin'), contributionController.getCampaignContributions);
router.post('/', authenticate, authorize('supporter'), validate(contributionSchema), contributionController.create);
router.put('/:id/approve', authenticate, authorize('creator', 'admin'), contributionController.approve);
router.put('/:id/reject', authenticate, authorize('creator', 'admin'), contributionController.reject);

export default router;
