import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { associateService } from '../services/associate.service';
import { DocumentStatus } from '@prisma/client';

export const associateController = {
  dashboard: asyncHandler(async (_req: Request, res: Response) => {
    const stats = await associateService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard stats fetched');
  }),

  listCompanies: asyncHandler(async (_req: Request, res: Response) => {
    const companies = await associateService.listCompanies();
    sendSuccess(res, companies, 'Companies fetched');
  }),

  getCompanyDetail: asyncHandler(async (req: Request, res: Response) => {
    const company = await associateService.getCompanyDetail(req.params.id);
    sendSuccess(res, company, 'Company detail fetched');
  }),

  listDocuments: asyncHandler(async (req: Request, res: Response) => {
    const status = req.query.status as DocumentStatus | undefined;
    const documents = await associateService.listDocuments(status);
    sendSuccess(res, documents, 'Documents fetched');
  }),

  reviewDocument: asyncHandler(async (req: Request, res: Response) => {
    const { action, rejectionReason } = req.body;
    const reviewerId = req.account!.id;
    const updated = await associateService.reviewDocument(req.params.id, action, reviewerId, rejectionReason);
    sendSuccess(res, updated, 'Document reviewed');
  }),

  listFunding: asyncHandler(async (_req: Request, res: Response) => {
    const funding = await associateService.listFunding();
    sendSuccess(res, funding, 'Funding opportunities fetched');
  }),

  listMessages: asyncHandler(async (req: Request, res: Response) => {
    const accountId = req.account!.id;
    const threadWith = req.query.threadWith as string | undefined;
    const messages = await associateService.listMessages(accountId, threadWith);
    sendSuccess(res, messages, 'Messages fetched');
  }),

  sendMessage: asyncHandler(async (req: Request, res: Response) => {
    const senderId = req.account!.id;
    const { receiverId, content, subject } = req.body;
    const message = await associateService.sendMessage(senderId, receiverId, content, subject);
    sendSuccess(res, message, 'Message sent', 201);
  }),

  getProfile: asyncHandler(async (req: Request, res: Response) => {
    const accountId = req.account!.id;
    const profile = await associateService.getProfile(accountId);
    sendSuccess(res, profile, 'Profile fetched');
  })
};
