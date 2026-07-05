import { investmentRepository } from '../repositories/investment.repository';
import { investorRepository } from '../repositories/investor.repository';
import { fundingRepository } from '../repositories/funding.repository';
import { AppError } from '../errors/AppError';
import { FundingStatus, ProposalStatus } from '@prisma/client';
import { notificationRepository } from '../repositories/notification.repository';
import { auditRepository } from '../repositories/audit.repository';

export const investmentService = {
  async createProposal(accountId: string, fundingOpportunityId: string, proposedAmount: number, message?: string) {
    const investor = await investorRepository.findByAccountId(accountId);
    if (!investor) throw AppError.notFound('Investor profile not found');

    const opportunity = await fundingRepository.findById(fundingOpportunityId);
    if (!opportunity) throw AppError.notFound('Funding opportunity not found');
    if (opportunity.status !== FundingStatus.ACTIVE) {
      throw AppError.badRequest('This funding opportunity is not currently accepting proposals');
    }

    const proposal = await investmentRepository.createProposal(investor.id, fundingOpportunityId, proposedAmount, message);

    await notificationRepository.create(
      opportunity.company.accountId,
      'PROPOSAL',
      'New investment proposal received',
      `${investor.fullName} proposed an investment of ${proposedAmount} on "${opportunity.title}"`
    );
    await auditRepository.logActivity(accountId, 'PROPOSAL_CREATED', `Proposed ${proposedAmount} on ${opportunity.title}`);

    return proposal;
  },

  async listOwnProposals(accountId: string) {
    const investor = await investorRepository.findByAccountId(accountId);
    if (!investor) throw AppError.notFound('Investor profile not found');
    return investmentRepository.listProposalsByInvestor(investor.id);
  },

  async listCompanyProposals(companyId: string) {
    return investmentRepository.listProposalsForCompany(companyId);
  },

  async respondToProposal(companyAccountId: string, proposalId: string, status: 'ACCEPTED' | 'REJECTED') {
    const proposal = await investmentRepository.findProposalById(proposalId);
    if (!proposal) throw AppError.notFound('Proposal not found');
    if (proposal.fundingOpportunity.company.accountId !== companyAccountId) {
      throw AppError.forbidden('Not authorized to respond to this proposal');
    }
    if (proposal.status !== ProposalStatus.PENDING) {
      throw AppError.badRequest('This proposal has already been responded to');
    }

    const updated = await investmentRepository.updateProposalStatus(proposalId, status as ProposalStatus);

    if (status === 'ACCEPTED') {
      await investmentRepository.createInvestment(
        proposal.investorId,
        proposal.fundingOpportunityId,
        proposal.id,
        Number(proposal.proposedAmount)
      );
    }

    await notificationRepository.create(
      proposal.investor.accountId,
      'PROPOSAL',
      `Your proposal was ${status.toLowerCase()}`,
      `Your proposal on "${proposal.fundingOpportunity.title}" was ${status.toLowerCase()}.`
    );

    return updated;
  },

  async listOwnInvestments(accountId: string) {
    const investor = await investorRepository.findByAccountId(accountId);
    if (!investor) throw AppError.notFound('Investor profile not found');
    return investmentRepository.listInvestmentsByInvestor(investor.id);
  },

  async listCompanyInvestments(companyId: string) {
    return investmentRepository.listInvestmentsForCompany(companyId);
  }
};
