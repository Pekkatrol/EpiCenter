import { Router } from 'express';
import { getAllBanners, createBanner, updateBanner, deleteBanner } from '../controllers/banners.controller';
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', getAllBanners);
router.post('/', requireAuth, requireAdmin, createBanner);
router.put('/:id', requireAuth, requireAdmin, updateBanner);
router.delete('/:id', requireAuth, requireAdmin, deleteBanner);

export default router;