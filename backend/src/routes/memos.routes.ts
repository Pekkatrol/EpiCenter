import { Router } from 'express';
import { getAllMemos, getMemoById, createMemo, updateMemo, deleteMemo } from '../controllers/memos.controller';
import { requireAuth, requireAdmin, optionalAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', optionalAuth, getAllMemos);
router.get('/:id', optionalAuth, getMemoById);
router.post('/', requireAuth, requireAdmin, createMemo);
router.put('/:id', requireAuth, requireAdmin, updateMemo);
router.delete('/:id', requireAuth, requireAdmin, deleteMemo);

export default router;