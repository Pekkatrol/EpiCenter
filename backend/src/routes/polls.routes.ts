import { Router } from 'express';
import { getAllPolls, createPoll, vote, closePoll, deletePoll } from '../controllers/polls.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAllPolls);
router.post('/', requireAuth, requireAdmin, createPoll);
router.post('/:id/vote', requireAuth, vote);
router.patch('/:id/close', requireAuth, requireAdmin, closePoll);
router.delete('/:id', requireAuth, requireAdmin, deletePoll);

export default router;