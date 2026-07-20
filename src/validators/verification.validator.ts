import { z } from 'zod';

/**
 * Shared decision payload for both company and investor verification:
 *   { "action": "VERIFY" }
 *   { "action": "REJECT", "rejectionReason": "GST number does not match registration docs" }
 * rejectionReason is required (min 5 chars) whenever action is REJECT.
 */
export const verificationDecisionSchema = z
  .object({
    action: z.enum(['VERIFY', 'REJECT']),
    rejectionReason: z.string().min(5, 'rejectionReason must be at least 5 characters').optional(),
  })
  .refine((data) => data.action !== 'REJECT' || !!data.rejectionReason, {
    message: 'rejectionReason is required when action is "REJECT"',
    path: ['rejectionReason'],
  });

export type VerificationDecisionInput = z.infer<typeof verificationDecisionSchema>;

export const investorIdParamSchema = z.object({
  investorId: z.string().uuid({ message: 'investorId must be a valid UUID' }),
});

export const documentIdParamSchema = z.object({
  documentId: z.string().uuid({ message: 'documentId must be a valid UUID' }),
});

const DOCUMENT_TYPES = [
  'KYC',
  'PITCH_DECK',
  'COMPANY_REGISTRATION',
  'FINANCIAL_STATEMENT',
  'LOGO',
  'AVATAR',
  'OTHER',
] as const;

const DOCUMENT_STATUSES = ['PENDING', 'VERIFIED', 'REJECTED'] as const;

export const adminDocumentsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  status: z.enum(DOCUMENT_STATUSES).optional(),
  type: z.enum(DOCUMENT_TYPES).optional(),
  accountId: z.string().uuid().optional(),
});

export type AdminDocumentsQueryInput = z.infer<typeof adminDocumentsQuerySchema>;

export const adminInvestorsQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20))
    .pipe(z.number().int().min(1).max(100)),
  verificationStatus: z.enum(['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED']).optional(),
  search: z.string().optional(),
});

export type AdminInvestorsQueryInput = z.infer<typeof adminInvestorsQuerySchema>;
