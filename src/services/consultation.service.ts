import { PrismaClient, ConsultationStatus, ConsultationType } from '@prisma/client';
import crypto from 'crypto';
import { emailService } from '../emails/email.service';
import { calendarService } from './calendar.service';

const prisma = new PrismaClient();

interface CreateConsultationInput {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  consultationType: ConsultationType;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
}

export const consultationService = {
  async create(input: CreateConsultationInput) {
    const actionToken = crypto.randomBytes(32).toString('hex');

    const consultation = await prisma.consultation.create({
      data: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        company: input.company,
        consultationType: input.consultationType,
        preferredDate: new Date(input.preferredDate),
        preferredTime: input.preferredTime,
        notes: input.notes,
        status: ConsultationStatus.PENDING,
        actionToken
      }
    });

    try {
      await emailService.sendConsultationConfirmation(consultation.email, consultation.fullName);
    } catch (err) {
      console.error('Failed to send consultation confirmation email:', err);
    }

    try {
      await emailService.sendConsultationNotificationToAdmin(consultation);
    } catch (err) {
      console.error('Failed to send consultation admin notification email:', err);
    }

    return consultation;
  },

  async findAll() {
    return prisma.consultation.findMany({
      orderBy: { createdAt: 'desc' }
    });
  },

  async findById(id: string) {
    const consultation = await prisma.consultation.findUnique({ where: { id } });
    if (!consultation) {
      const error: any = new Error('Consultation not found');
      error.statusCode = 404;
      throw error;
    }
    return consultation;
  },

  // Manual approve/reject via PUT /api/admin/consultations/:id
  async updateStatus(id: string, status: ConsultationStatus) {
    const consultation = await this.findById(id);
    let meetLink: string | undefined;

    if (status === ConsultationStatus.APPROVED && consultation.status !== ConsultationStatus.APPROVED) {
      try {
        const meeting = await calendarService.createMeetingWithLink({
          summary: `DNH Consultation — ${consultation.fullName}`,
          description: `Consultation type: ${consultation.consultationType}\nNotes: ${consultation.notes ?? '—'}`,
          attendeeEmail: consultation.email,
          preferredDate: consultation.preferredDate,
          preferredTime: consultation.preferredTime
        });
        meetLink = meeting.meetLink;
      } catch (err) {
        console.error('Failed to create Google Meet event:', err);
      }
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status }
    });

    try {
      switch (status) {
        case ConsultationStatus.APPROVED:
          await emailService.sendConsultationApproved(updated.email, updated.fullName, meetLink);
          break;
        case ConsultationStatus.REJECTED:
          await emailService.sendConsultationRejected(updated.email, updated.fullName);
          break;
        case ConsultationStatus.COMPLETED:
          await emailService.sendConsultationCompleted(updated.email, updated.fullName);
          break;
        case ConsultationStatus.CANCELLED:
          await emailService.sendConsultationCancelled(updated.email, updated.fullName);
          break;
      }
    } catch (err) {
      console.error('Failed to send consultation status update email:', err);
    }

    return updated;
  },

  // Used by email Accept/Decline links — verifies token, applies status, invalidates token
  async actionByToken(id: string, token: string, newStatus: ConsultationStatus) {
    const consultation = await prisma.consultation.findUnique({ where: { id } });

    if (!consultation) {
      const error: any = new Error('Consultation not found');
      error.statusCode = 404;
      throw error;
    }

    if (!consultation.actionToken || consultation.actionToken !== token) {
      const error: any = new Error('Invalid or expired link');
      error.statusCode = 400;
      throw error;
    }

    if (consultation.status !== ConsultationStatus.PENDING) {
      const error: any = new Error(`This request was already ${consultation.status.toLowerCase()}`);
      error.statusCode = 409;
      throw error;
    }

    let meetLink: string | undefined;

    if (newStatus === ConsultationStatus.APPROVED) {
      try {
        const meeting = await calendarService.createMeetingWithLink({
          summary: `DNH Consultation — ${consultation.fullName}`,
          description: `Consultation type: ${consultation.consultationType}\nNotes: ${consultation.notes ?? '—'}`,
          attendeeEmail: consultation.email,
          preferredDate: consultation.preferredDate,
          preferredTime: consultation.preferredTime
        });
        meetLink = meeting.meetLink;
      } catch (err) {
        console.error('Failed to create Google Meet event:', err);
      }
    }

    const updated = await prisma.consultation.update({
      where: { id },
      data: { status: newStatus, actionToken: null }
    });

    try {
      if (newStatus === ConsultationStatus.APPROVED) {
        await emailService.sendConsultationApproved(updated.email, updated.fullName, meetLink);
      } else if (newStatus === ConsultationStatus.REJECTED) {
        await emailService.sendConsultationRejected(updated.email, updated.fullName);
      }
    } catch (err) {
      console.error('Failed to send consultation status update email:', err);
    }

    return updated;
  },

  async remove(id: string) {
    await this.findById(id);
    await prisma.consultation.delete({ where: { id } });
    return { id };
  }
};