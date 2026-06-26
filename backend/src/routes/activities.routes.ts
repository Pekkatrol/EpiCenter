import { Router } from 'express';
import { getAllActivities, getActivityById, createActivity, updateActivity, deleteActivity } from '../controllers/activities.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllActivities);
router.get('/:id', getActivityById);
router.post('/', requireAuth, requireAdmin, createActivity);
router.put('/:id', requireAuth, requireAdmin, updateActivity);
router.delete('/:id', requireAuth, requireAdmin, deleteActivity);

export default router;