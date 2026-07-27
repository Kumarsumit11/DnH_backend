import { Router } from 'express';
import { consultationController } from '../controllers/consultation.controller';
import { validate } from '../middleware/validate.middleware';
import {
  createConsultationSchema,
  updateConsultationStatusSchema,
  consultationIdParamSchema
} from '../validators/consultation.validator';

export const publicConsultationRouter = Router();
publicConsultationRouter.post('/', validate(createConsultationSchema), consultationController.create);

export const adminConsultationRouter = Router();
adminConsultationRouter.get('/', consultationController.getAll);
adminConsultationRouter.get('/:id', validate(consultationIdParamSchema), consultationController.getOne);
adminConsultationRouter.put('/:id', validate(updateConsultationStatusSchema), consultationController.updateStatus);
adminConsultationRouter.delete('/:id', validate(consultationIdParamSchema), consultationController.remove);

// Clicked directly from the admin notification email — no auth, secured by one-time token instead
adminConsultationRouter.get('/:id/approve', consultationController.approveByLink);
adminConsultationRouter.get('/:id/reject', consultationController.rejectByLink);