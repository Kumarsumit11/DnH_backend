import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { associateService } from '../services/associate.service';
import { fundingService } from '../services/funding.service';
import { Role } from '@prisma/client';

export const associateController = {
  listPendingCompanies: asyncHandler(async (_req: Request, res: Response) => {
    const companies = await associateService.listPendingCompanies();
    sendSuccess(res, companies);
  }),

  approveCompany: asyncHandler(async (req: Request, res: Response) => {
    const company = await associateService.approveCompany(req.params.id);
    sendSuccess(res, company, 'Company approved');
  }),

  rejectCompany: asyncHandler(async (req: Request, res: Response) => {
    const { reason } = req.body;
    const company = await associateService.rejectCompany(req.params.id, reason);
    sendSuccess(res, company, 'Company rejected');
  }),

  listPendingFunding: asyncHandler(async (_req: Request, res: Response) => {
    const list = await associateService.listPendingFunding();
    sendSuccess(res, list);
  }),

  approveFunding: asyncHandler(async (req: Request, res: Response) => {
    const opportunity = await fundingService.setStatus(req.params.id, 'ACTIVE');
    sendSuccess(res, opportunity, 'Funding opportunity approved');
  }),

  rejectFunding: asyncHandler(async (req: Request, res: Response) => {
    const { rejectionReason } = req.body;
    const opportunity = await fundingService.setStatus(req.params.id, 'REJECTED', rejectionReason);
    sendSuccess(res, opportunity, 'Funding opportunity rejected');
  }),

  listPendingDocuments: asyncHandler(async (_req: Request, res: Response) => {
    const documents = await associateService.listPendingDocuments();
    sendSuccess(res, documents);
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const role = req.query.role as Role | undefined;
    const users = await associateService.listAllUsers(role);
    sendSuccess(res, users);
  }),

  suspendUser: asyncHandler(async (req: Request, res: Response) => {
    const account = await associateService.suspendUser(req.params.id);
    sendSuccess(res, account, 'User suspended');
  }),

  reactivateUser: asyncHandler(async (req: Request, res: Response) => {
    const account = await associateService.reactivateUser(req.params.id);
    sendSuccess(res, account, 'User reactivated');
  }),

  analytics: asyncHandler(async (_req: Request, res: Response) => {
    const analytics = await associateService.getAnalytics();
    sendSuccess(res, analytics);
  })
};
