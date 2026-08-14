import { z } from 'zod';

export const createCompanyUpdateSchema = z.object({
  body: z.object({
    authorRole: z.enum(['CEO', 'CFO']),
    authorName: z.string().min(2).max(100),
    title: z.string().min(2).max(200),
    content: z.string().min(1),
    category: z.enum(['GENERAL', 'FINANCIAL', 'PRODUCT', 'MILESTONE', 'RISK']).optional()
  })
});

export const editCompanyUpdateSchema = z.object({
  body: z.object({
    authorRole: z.enum(['CEO', 'CFO']).optional(),
    authorName: z.string().min(2).max(100).optional(),
    title: z.string().min(2).max(200).optional(),
    content: z.string().min(1).optional(),
    category: z.enum(['GENERAL', 'FINANCIAL', 'PRODUCT', 'MILESTONE', 'RISK']).optional()
  })
});