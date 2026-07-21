import { Router } from 'express';
import { campaignController } from '../controllers/campaign.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { campaignSchema, campaignUpdateSchema } from '../validations';

const router = Router();

router.get('/featured', campaignController.getFeatured);
router.get('/categories', campaignController.getCategories);
router.get('/', campaignController.getAll);
router.get('/my', authenticate, authorize('creator'), campaignController.getMyCampaigns);
router.get('/:id', campaignController.getById);
router.post('/', authenticate, authorize('creator'), validate(campaignSchema), campaignController.create);
router.put('/:id', authenticate, authorize('creator', 'admin'), validate(campaignUpdateSchema), campaignController.update);
router.delete('/:id', authenticate, authorize('creator', 'admin'), campaignController.delete);

export default router;
