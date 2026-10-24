import { Router } from 'express';
import {
  createConversationController,
  createPromptController,
  getConversationsController,
  getPromptsController,
} from './chat.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.post('/conversations', createConversationController);
router.get('/conversations', getConversationsController);

router.post('/conversations/:conversationId/prompts', createPromptController);
router.get('/conversations/:conversationId/prompts', getPromptsController);

export default router;
