import { Router } from 'express';
import { adminAuthController } from '../controllers/adminAuth.controller';

const router = Router();

router.post('/request-otp', adminAuthController.requestOtp);
router.post('/verify-otp', adminAuthController.verifyOtp);

export default router;
