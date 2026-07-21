import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { aiChatSchema } from '../validations';

const router = Router();

router.post('/chat', authenticate, validate(aiChatSchema), aiController.chat);

export default router;
