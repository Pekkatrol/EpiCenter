import { Router } from 'express';
import {
  getAllSuggestions,
  createSuggestion,
  toggleLike,
  updateStatus,
  deleteSuggestion,
} from '../controllers/suggestions.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', requireAuth, getAllSuggestions);
router.post('/', requireAuth, createSuggestion);
router.post('/:id/like', requireAuth, toggleLike);
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteSuggestion);

export default router;