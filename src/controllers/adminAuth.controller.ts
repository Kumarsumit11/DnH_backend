import { Request, Response } from 'express';
import { adminAuthService } from '../services/adminAuth.service';

export const adminAuthController = {
  async requestOtp(req: Request, res: Response) {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    try {
      await adminAuthService.requestOtp(email);
    } catch (err: any) {
      return res.status(500).json({ success: false, message: err.message || 'Failed to send OTP' });
    }
    // Always the same response, whether or not the email is a recognized admin.
    return res.json({ success: true, message: 'If this email is registered, an OTP has been sent.' });
  },

  async verifyOtp(req: Request, res: Response) {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }
    try {
      const token = adminAuthService.verifyOtpAndIssueToken(email, otp);
      return res.json({ success: true, message: 'Login successful', data: { token } });
    } catch (err: any) {
      return res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
    }
  }
};
