import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { authRateLimiter, otpRateLimiter } from '../middleware/rateLimiter';
import {
  registerInvestorSchema,
  registerCompanySchema,
  registerStartSchema,
  completeProfileSchema,
  loginSchema,
  verifyEmailSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema
} from '../validators/auth.validator';

const router = Router();

router.post('/register/investor', authRateLimiter, validate(registerInvestorSchema), authController.registerInvestor);
router.post('/register/company', authRateLimiter, validate(registerCompanySchema), authController.registerCompany);


router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/resend-otp', otpRateLimiter, validate(resendOtpSchema), authController.resendOtp);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/forgot-password', otpRateLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.post('/logout', authController.logout);

export default router;
