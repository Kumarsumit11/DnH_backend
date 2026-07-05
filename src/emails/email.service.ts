import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined
});

async function send(to: string, subject: string, html: string) {
  if (!env.SMTP_HOST) {
    console.log(`[EMAIL SKIPPED - no SMTP configured] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
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
