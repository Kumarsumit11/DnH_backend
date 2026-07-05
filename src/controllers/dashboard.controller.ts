import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { companyService } from '../services/company.service';
import { investorService } from '../services/investor.service';
import { fundingService } from '../services/funding.service';
import { investmentService } from '../services/investment.service';
import { documentService } from '../services/document.service';
import { notificationService } from '../services/notification.service';
import { associateService } from '../services/associate.service';

export const dashboardController = {
  companyDashboard: asyncHandler(async (req: Request, res: Response) => {
    const profile = await companyService.getProfile(req.account!.id);
    const [fundingOpportunities, proposals, investments, documents, notifications] = await Promise.all([
      fundingService.listOwn(req.account!.id),
      investmentService.listCompanyProposals(profile.id),
      investmentService.listCompanyInvestments(profile.id),
      documentService.listOwn(req.account!.id),
      notificationService.list(req.account!.id, true)
    ]);
    sendSuccess(res, { profile, fundingOpportunities, proposals, investments, documents, unreadNotifications: notifications });
  }),

  investorDashboard: asyncHandler(async (req: Request, res: Response) => {
    const profile = await investorService.getProfile(req.account!.id);
    const [proposals, investments, documents, notifications] = await Promise.all([
      investmentService.listOwnProposals(req.account!.id),
      investmentService.listOwnInvestments(req.account!.id),
      documentService.listOwn(req.account!.id),
      notificationService.list(req.account!.id, true)
    ]);
    sendSuccess(res, { profile, proposals, investments, documents, unreadNotifications: notifications });
  }),

  associateDashboard: asyncHandler(async (_req: Request, res: Response) => {
    const [pendingCompanies, pendingFunding, pendingDocuments, analytics] = await Promise.all([
      associateService.listPendingCompanies(),
      associateService.listPendingFunding(),
      associateService.listPendingDocuments(),
      associateService.getAnalytics()
    ]);
    sendSuccess(res, { pendingCompanies, pendingFunding, pendingDocuments, analytics });
  })
};
