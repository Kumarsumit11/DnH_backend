import { z } from 'zod';

export const documentStatusSchema = z.object({
  body: z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    rejectionReason: z.string().optional()
  })
});
