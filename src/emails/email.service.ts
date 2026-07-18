// email.service.ts
import { BrevoClient } from '@getbrevo/brevo';
import { env } from '../config/env';

const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

async function send(to: string, subject: string, html: string) {
  if (!env.BREVO_API_KEY) {
    console.log(`[EMAIL SKIPPED - no BREVO_API_KEY configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender: { email: env.SMTP_FROM },
      to: [{ email: to }],
    });
  } catch (err: any) {
    console.error('❌ Brevo send failed:', err?.response?.body || err?.message || err);
    throw new Error('Failed to send email');
  }
}

export const emailService = {
  sendOtpEmail: (to: string, otp: string, purpose: string) =>
    send(
      to,
      'DNH — Your Verification Code',
      `<p>Your ${purpose} code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`
    ),

  sendWelcomeEmail: (to: string, name: string) =>
    send(to, 'Welcome to DNH', `<p>Hi ${name},</p><p>Your account has been verified. Welcome to DNH.</p>`),

  sendPasswordResetConfirmation: (to: string) =>
    send(to, 'DNH — Password Changed', `<p>Your password was changed successfully. If this wasn't you, contact support immediately.</p>`),

  sendCompanyApprovedEmail: (to: string, companyName: string) =>
    send(to, 'DNH — Company Verified', `<p>Congratulations, ${companyName} has been verified and is now live on DNH.</p>`),

  sendCompanyRejectedEmail: (to: string, companyName: string, reason: string) =>
    send(to, 'DNH — Verification Update', `<p>${companyName}'s verification was not approved.</p><p>Reason: ${reason}</p>`)
};