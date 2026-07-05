"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentService = void 0;
const investment_repository_1 = require("../repositories/investment.repository");
const investor_repository_1 = require("../repositories/investor.repository");
const funding_repository_1 = require("../repositories/funding.repository");
const AppError_1 = require("../errors/AppError");
const client_1 = require("@prisma/client");
const notification_repository_1 = require("../repositories/notification.repository");
const audit_repository_1 = require("../repositories/audit.repository");
exports.investmentService = {
    async createProposal(accountId, fundingOpportunityId, proposedAmount, message) {
        const investor = await investor_repository_1.investorRepository.findByAccountId(accountId);
        if (!investor)
            throw AppError_1.AppError.notFound('Investor profile not found');
        const opportunity = await funding_repository_1.fundingRepository.findById(fundingOpportunityId);
        if (!opportunity)
            throw AppError_1.AppError.notFound('Funding opportunity not found');
        if (opportunity.status !== client_1.FundingStatus.ACTIVE) {
            throw AppError_1.AppError.badRequest('This funding opportunity is not currently accepting proposals');
        }
        const proposal = await investment_repository_1.investmentRepository.createProposal(investor.id, fundingOpportunityId, proposedAmount, message);
        await notification_repository_1.notificationRepository.create(opportunity.company.accountId, 'PROPOSAL', 'New investment proposal received', `${investor.fullName} proposed an investment of ${proposedAmount} on "${opportunity.title}"`);
        await audit_repository_1.auditRepository.logActivity(accountId, 'PROPOSAL_CREATED', `Proposed ${proposedAmount} on ${opportunity.title}`);
        return proposal;
    },
    async listOwnProposals(accountId) {
        const investor = await investor_repository_1.investorRepository.findByAccountId(accountId);
        if (!investor)
            throw AppError_1.AppError.notFound('Investor profile not found');
        return investment_repository_1.investmentRepository.listProposalsByInvestor(investor.id);
    },
    async listCompanyProposals(companyId) {
        return investment_repository_1.investmentRepository.listProposalsForCompany(companyId);
    },
    async respondToProposal(companyAccountId, proposalId, status) {
        const proposal = await investment_repository_1.investmentRepository.findProposalById(proposalId);
        if (!proposal)
            throw AppError_1.AppError.notFound('Proposal not found');
        if (proposal.fundingOpportunity.company.accountId !== companyAccountId) {
            throw AppError_1.AppError.forbidden('Not authorized to respond to this proposal');
        }
        if (proposal.status !== client_1.ProposalStatus.PENDING) {
            throw AppError_1.AppError.badRequest('This proposal has already been responded to');
        }
        const updated = await investment_repository_1.investmentRepository.updateProposalStatus(proposalId, status);
        if (status === 'ACCEPTED') {
            await investment_repository_1.investmentRepository.createInvestment(proposal.investorId, proposal.fundingOpportunityId, proposal.id, Number(proposal.proposedAmount));
        }
        await notification_repository_1.notificationRepository.create(proposal.investor.accountId, 'PROPOSAL', `Your proposal was ${status.toLowerCase()}`, `Your proposal on "${proposal.fundingOpportunity.title}" was ${status.toLowerCase()}.`);
        return updated;
    },
    async listOwnInvestments(accountId) {
        const investor = await investor_repository_1.investorRepository.findByAccountId(accountId);
        if (!investor)
            throw AppError_1.AppError.notFound('Investor profile not found');
        return investment_repository_1.investmentRepository.listInvestmentsByInvestor(investor.id);
    },
    async listCompanyInvestments(companyId) {
        return investment_repository_1.investmentRepository.listInvestmentsForCompany(companyId);
    }
};
