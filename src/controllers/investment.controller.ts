import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { investmentService } from '../services/investment.service';
import { companyService } from '../services/company.service';

export const investmentController = {
  createProposal: asyncHandler(async (req: Request, res: Response) => {
    const { fundingOpportunityId, proposedAmount, sharesRequested, message } = req.body;
    const proposal = await investmentService.createProposal(req.account!.id, fundingOpportunityId, proposedAmount, message, sharesRequested);
    sendSuccess(res, proposal, 'Proposal submitted', 201);
  }),

  listOwnProposals: asyncHandler(async (req: Request, res: Response) => {
    const proposals = await investmentService.listOwnProposals(req.account!.id);
    sendSuccess(res, proposals);
  }),

  listCompanyProposals: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getProfile(req.account!.id);
    const proposals = await investmentService.listCompanyProposals(company.id);
    sendSuccess(res, proposals);
  }),

  respondToProposal: asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const proposal = await investmentService.respondToProposal(req.account!.id, req.params.id, status);
    sendSuccess(res, proposal, `Proposal ${status.toLowerCase()}`);
  }),

  listOwnInvestments: asyncHandler(async (req: Request, res: Response) => {
    const investments = await investmentService.listOwnInvestments(req.account!.id);
    sendSuccess(res, investments);
  }),

  listCompanyInvestments: asyncHandler(async (req: Request, res: Response) => {
    const company = await companyService.getProfile(req.account!.id);
    const investments = await investmentService.listCompanyInvestments(company.id);
    sendSuccess(res, investments);
  })
};
