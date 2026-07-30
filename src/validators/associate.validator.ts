import { z } from 'zod';
import { DocumentStatus } from '@prisma/client';

export const documentReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES']),
    rejectionReason: z.string().min(1).max(1000).optional()
  }).refine(
    (data) => data.action === 'APPROVE' || !!data.rejectionReason,
    { message: 'rejectionReason is required for REJECT and REQUEST_CHANGES', path: ['rejectionReason'] }
  )
});

export const listDocumentsQuerySchema = z.object({
  query: z.object({
    status: z.nativeEnum(DocumentStatus).optional()
  })
});

export const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    subject: z.string().max(200).optional(),
    content: z.string().min(1).max(5000)
  })
});

export const listMessagesQuerySchema = z.object({
  query: z.object({
    threadWith: z.string().uuid().optional()
  })
});

export const companyIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});
