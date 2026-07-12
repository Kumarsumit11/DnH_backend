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
import { FundingStatus, InvestmentStatus, ProposalStatus } from '@prisma/client';

export const dashboardController = {
  companyDashboard: asyncHandler(async (req: Request, res: Response) => {
    const profile = await companyService.getProfile(req.account!.id);
    const [fundingOpportunities, proposals, investments, documents, notifications, unreadCount] = await Promise.all([
      fundingService.listOwn(req.account!.id),
      investmentService.listCompanyProposals(profile.id),
      investmentService.listCompanyInvestments(profile.id),
      documentService.listOwn(req.account!.id),
      notificationService.list(req.account!.id, false),
      notificationService.countUnread(req.account!.id)
    ]);

    const fundingRequired = fundingOpportunities
      .filter((f) => f.status === FundingStatus.ACTIVE || f.status === FundingStatus.PENDING_APPROVAL)
      .reduce((sum, f) => sum + Number(f.fundNeeded), 0);

    const confirmedInvestments = investments.filter(
      (i) => i.status === InvestmentStatus.CONFIRMED || i.status === InvestmentStatus.COMPLETED
    );
    const fundingRaised = confirmedInvestments.reduce((sum, i) => sum + Number(i.amount), 0);
    const activeInvestors = new Set(confirmedInvestments.map((i) => i.investorId)).size;

    sendSuccess(res, {
      profile,
      fundingOpportunities,
      proposals,
      investments,
      documents,
      notifications,
      dashboard: {
        fundingRequired,
        fundingRaised,
        activeInvestors,
        verificationStatus: profile.verificationStatus,
        unreadNotifications: unreadCount
      }
    });
  }),

  investorDashboard: asyncHandler(async (req: Request, res: Response) => {
    const profile = await investorService.getProfile(req.account!.id);
    const [proposals, investments, documents, notifications, unreadCount] = await Promise.all([
      investmentService.listOwnProposals(req.account!.id),
      investmentService.listOwnInvestments(req.account!.id),
      documentService.listOwn(req.account!.id),
      notificationService.list(req.account!.id, false),
      notificationService.countUnread(req.account!.id)
    ]);

    const portfolioValue = investments
      .filter((i) => i.status === InvestmentStatus.CONFIRMED || i.status === InvestmentStatus.COMPLETED)
      .reduce((sum, i) => sum + Number(i.amount), 0);
    const activeInvestments = investments.filter((i) => i.status === InvestmentStatus.CONFIRMED).length;
    const openProposals = proposals.filter((p) => p.status === ProposalStatus.PENDING).length;

    sendSuccess(res, {
      profile,
      proposals,
      investments,
      documents,
      notifications,
      dashboard: {
        portfolioValue,
        activeInvestments,
        openProposals,
        unreadNotifications: unreadCount
      }
    });
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
