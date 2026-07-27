import { z } from 'zod';
import { ConsultationType, ConsultationStatus } from '@prisma/client';

const phoneRegex = /^[+]?[\d\s\-()]{7,20}$/;

// Strips time to midnight so "today" always passes regardless of current time-of-day
function isNotPast(dateStr: string): boolean {
  const inputDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  inputDate.setHours(0, 0, 0, 0);
  return inputDate.getTime() >= today.getTime();
}

export const createConsultationSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2, 'Full name is required').max(100),
    email: z.string().trim().toLowerCase().email('Invalid email address'),
    phone: z.string().trim().regex(phoneRegex, 'Invalid phone number'),
    company: z.string().trim().max(150).optional(),
    consultationType: z.nativeEnum(ConsultationType, {
      errorMap: () => ({ message: 'Invalid consultation type' })
    }),
    preferredDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), 'Invalid date format')
      .refine(isNotPast, 'Preferred date cannot be in the past'),
    preferredTime: z.string().trim().min(1, 'Preferred time is required').max(20),
    notes: z.string().trim().max(1000, 'Notes must be under 1000 characters').optional()
  })
});

export const updateConsultationStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid consultation id')
  }),
  body: z.object({
    status: z.nativeEnum(ConsultationStatus, {
      errorMap: () => ({ message: 'Invalid status value' })
    })
  })
});

export const consultationIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid consultation id')
  })
});