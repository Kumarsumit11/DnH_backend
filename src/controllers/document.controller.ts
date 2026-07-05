import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { documentService } from '../services/document.service';
import { AppError } from '../errors/AppError';
import { DocumentType } from '@prisma/client';

export const documentController = {
  upload: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('No file uploaded');
    const { type } = req.body;
    if (!type || !Object.values(DocumentType).includes(type)) {
      throw AppError.badRequest('Invalid or missing document type');
    }
    const document = await documentService.upload(req.account!.id, type as DocumentType, req.file);
    sendSuccess(res, document, 'Document uploaded', 201);
  }),

  listOwn: asyncHandler(async (req: Request, res: Response) => {
    const documents = await documentService.listOwn(req.account!.id);
    sendSuccess(res, documents);
  }),

  listPending: asyncHandler(async (_req: Request, res: Response) => {
    const documents = await documentService.listPending();
    sendSuccess(res, documents);
  }),

  review: asyncHandler(async (req: Request, res: Response) => {
    const { status, rejectionReason } = req.body;
    const document = await documentService.review(req.account!.id, req.params.id, status, rejectionReason);
    sendSuccess(res, document, `Document ${status.toLowerCase()}`);
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await documentService.delete(req.account!.id, req.params.id);
    sendSuccess(res, {}, 'Document deleted');
  })
};
