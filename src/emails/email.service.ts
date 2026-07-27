// email.service.ts
import { BrevoClient } from '@getbrevo/brevo';
import { env } from '../config/env';

const brevo = new BrevoClient({ apiKey: env.BREVO_API_KEY });

// Parses "Name <email@domain.com>" or a plain "email@domain.com" into { name?, email }
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^(.*)<(.+)>$/);
  if (match) {
    return { name: match[1].trim().replace(/^["']|["']$/g, ''), email: match[2].trim() };
  }
  return { email: from.trim() };
}

const sender = parseSender(env.SMTP_FROM);

async function send(to: string, subject: string, html: string) {
  if (!env.BREVO_API_KEY) {
    console.log(`[EMAIL SKIPPED - no BREVO_API_KEY configured] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await brevo.transactionalEmails.sendTransacEmail({
      subject,
      htmlContent: html,
      sender,
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
    send(to, 'DNH — Verification Update', `<p>${companyName}'s verification was not approved.</p><p>Reason: ${reason}</p>`),

  sendConsultationConfirmation: (to: string, name: string) =>
    send(
      to,
      'DNH - Consultation Request Received',
      `<p>Hello ${name},</p>
       <p>Thank you for requesting a consultation with DNH.</p>
       <p>Our advisory team has received your request. We will review it and contact you shortly.</p>
       <p>Regards,<br/>DNH Team</p>`
    ),

  sendConsultationApproved: (to: string, name: string, meetLink?: string) =>
    send(
      to,
      'DNH - Your Consultation Request Was Approved',
      `<p>Hello ${name},</p>
       <p>Good news — your consultation request with DNH has been approved.</p>
       ${meetLink
         ? `<p><strong>Google Meet link:</strong> <a href="${meetLink}">${meetLink}</a></p>`
         : `<p>Our advisory team will reach out shortly to confirm the meeting details.</p>`}
       <p>Regards,<br/>DNH Team</p>`
    ),

  sendConsultationRejected: (to: string, name: string) =>
    send(
      to,
      'DNH - Update on Your Consultation Request',
      `<p>Hello ${name},</p>
       <p>Thank you for your interest in DNH. Unfortunately, we're unable to accommodate your consultation request at this time.</p>
       <p>Feel free to reach out again in the future.</p>
       <p>Regards,<br/>DNH Team</p>`
    ),

  sendConsultationCompleted: (to: string, name: string) =>
    send(
      to,
      'DNH - Consultation Marked Complete',
      `<p>Hello ${name},</p>
       <p>Your consultation with DNH has been marked as completed.</p>
       <p>Thank you for your time — we hope it was valuable.</p>
       <p>Regards,<br/>DNH Team</p>`
    ),

  sendConsultationCancelled: (to: string, name: string) =>
    send(
      to,
      'DNH - Consultation Cancelled',
      `<p>Hello ${name},</p>
       <p>Your consultation request with DNH has been cancelled.</p>
       <p>If this was unexpected or you'd like to rebook, please reach out to us.</p>
       <p>Regards,<br/>DNH Team</p>`
    ),

  sendConsultationNotificationToAdmin: (consultation: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    company?: string | null;
    consultationType: string;
    preferredDate: Date;
    preferredTime: string;
    notes?: string | null;
    actionToken?: string | null;
  }) => {
    const baseUrl = env.API_BASE_URL || 'http://localhost:5000';
    const approveUrl = `${baseUrl}/api/admin/consultations/${consultation.id}/approve?token=${consultation.actionToken}`;
    const rejectUrl = `${baseUrl}/api/admin/consultations/${consultation.id}/reject?token=${consultation.actionToken}`;

    return send(
      env.ADMIN_NOTIFICATION_EMAIL ?? env.SMTP_FROM,
      'New Consultation Request',
      `<p><strong>Name:</strong> ${consultation.fullName}</p>
       <p><strong>Email:</strong> ${consultation.email}</p>
       <p><strong>Phone:</strong> ${consultation.phone}</p>
       <p><strong>Company:</strong> ${consultation.company ?? '—'}</p>
       <p><strong>Consultation Type:</strong> ${consultation.consultationType}</p>
       <p><strong>Preferred Date:</strong> ${consultation.preferredDate.toDateString()}</p>
       <p><strong>Preferred Time:</strong> ${consultation.preferredTime}</p>
       <p><strong>Notes:</strong> ${consultation.notes ?? '—'}</p>
       <div style="margin-top: 20px;">
         <a href="${approveUrl}" style="background:#16a34a;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;margin-right:10px;">Approve</a>
         <a href="${rejectUrl}" style="background:#dc2626;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Reject</a>
       </div>`
    );
  }
};