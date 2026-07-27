import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { consultationService } from '../services/consultation.service';
import { ConsultationStatus } from '@prisma/client';

function renderResultPage(res: Response, title: string, message: string) {
  res.status(200).send(`
    <!DOCTYPE html>
    <html>
      <head><title>${title}</title></head>
      <body style="font-family: Arial, sans-serif; text-align: center; padding: 60px;">
        <h2>${title}</h2>
        <p>${message}</p>
      </body>
    </html>
  `);
}

export const consultationController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const result = await consultationService.create(req.body);
    sendSuccess(res, result, 'Consultation request received. We will contact you shortly.', 201);
  }),

  getAll: asyncHandler(async (req: Request, res: Response) => {
    const result = await consultationService.findAll();
    sendSuccess(res, result, 'Consultations retrieved successfully');
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const result = await consultationService.findById(req.params.id);
    sendSuccess(res, result, 'Consultation retrieved successfully');
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const result = await consultationService.updateStatus(req.params.id, status);
    sendSuccess(res, result, 'Consultation updated successfully');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const result = await consultationService.remove(req.params.id);
    sendSuccess(res, result, 'Consultation deleted successfully');
  }),

  // GET /api/admin/consultations/:id/approve?token=xxx — clicked from email
  approveByLink: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { token } = req.query;

    try {
      const result = await consultationService.actionByToken(id, String(token), ConsultationStatus.APPROVED);
      renderResultPage(res, 'Consultation Approved', `${result.fullName}'s consultation has been approved and notified.`);
    } catch (err: any) {
      renderResultPage(res, 'Action Failed', err.message || 'Something went wrong.');
    }
  }),

  // GET /api/admin/consultations/:id/reject?token=xxx — clicked from email
  rejectByLink: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { token } = req.query;

    try {
      const result = await consultationService.actionByToken(id, String(token), ConsultationStatus.REJECTED);
      renderResultPage(res, 'Consultation Rejected', `${result.fullName}'s consultation has been rejected and notified.`);
    } catch (err: any) {
      renderResultPage(res, 'Action Failed', err.message || 'Something went wrong.');
    }
  })
};