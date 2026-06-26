import { Router } from 'express';
import { devLogin, loginWithMicrosoft } from '../controllers/auth.controller';

const router = Router();

router.post('/dev-login', devLogin);
router.post('/microsoft', loginWithMicrosoft);

export default router;