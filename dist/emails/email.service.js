"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("../config/env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.env.SMTP_HOST,
    port: env_1.env.SMTP_PORT,
    secure: env_1.env.SMTP_PORT === 465,
    auth: env_1.env.SMTP_USER ? { user: env_1.env.SMTP_USER, pass: env_1.env.SMTP_PASS } : undefined
});
async function send(to, subject, html) {
    if (!env_1.env.SMTP_HOST) {
        console.log(`[EMAIL SKIPPED - no SMTP configured] To: ${to} | Subject: ${subject}`);
        return;
    }
    await transporter.sendMail({ from: env_1.env.SMTP_FROM, to, subject, html });
}
exports.emailService = {
    sendOtpEmail: (to, otp, purpose) => send(to, 'DNH — Your Verification Code', `<p>Your ${purpose} code is:</p><h2>${otp}</h2><p>This code expires in 10 minutes.</p>`),
    sendWelcomeEmail: (to, name) => send(to, 'Welcome to DNH', `<p>Hi ${name},</p><p>Your account has been verified. Welcome to DNH.</p>`),
    sendPasswordResetConfirmation: (to) => send(to, 'DNH — Password Changed', `<p>Your password was changed successfully. If this wasn't you, contact support immediately.</p>`),
    sendCompanyApprovedEmail: (to, companyName) => send(to, 'DNH — Company Verified', `<p>Congratulations, ${companyName} has been verified and is now live on DNH.</p>`),
    sendCompanyRejectedEmail: (to, companyName, reason) => send(to, 'DNH — Verification Update', `<p>${companyName}'s verification was not approved.</p><p>Reason: ${reason}</p>`)
};
