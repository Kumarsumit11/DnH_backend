"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingService = void 0;
const funding_repository_1 = require("../repositories/funding.repository");
const company_repository_1 = require("../repositories/company.repository");
const AppError_1 = require("../errors/AppError");
const client_1 = require("@prisma/client");
const audit_repository_1 = require("../repositories/audit.repository");
const notification_repository_1 = require("../repositories/notification.repository");
exports.fundingService = {
    async create(accountId, data) {
        const company = await company_repository_1.companyRepository.findByAccountId(accountId);
        if (!company)
            throw AppError_1.AppError.notFound('Company profile not found');
        if (company.verificationStatus !== client_1.VerificationStatus.VERIFIED) {
            throw AppError_1.AppError.forbidden('Company must be verified before publishing funding opportunities');
        }
        const opportunity = await funding_repository_1.fundingRepository.create(company.id, { ...data, status: client_1.FundingStatus.PENDING_APPROVAL });
        await audit_repository_1.auditRepository.logActivity(accountId, 'FUNDING_CREATED', `Created funding opportunity: ${opportunity.title}`);
        return opportunity;
    },
    async listOwn(accountId) {
        const company = await company_repository_1.companyRepository.findByAccountId(accountId);
        if (!company)
            throw AppError_1.AppError.notFound('Company profile not found');
        return funding_repository_1.fundingRepository.listByCompany(company.id);
    },
    async getById(id) {
        const opportunity = await funding_repository_1.fundingRepository.findById(id);
        if (!opportunity)
            throw AppError_1.AppError.notFound('Funding opportunity not found');
        return opportunity;
    },
    async update(accountId, id, data) {
        const opportunity = await funding_repository_1.fundingRepository.findById(id);
        if (!opportunity)
            throw AppError_1.AppError.notFound('Funding opportunity not found');
        const company = await company_repository_1.companyRepository.findByAccountId(accountId);
        if (!company || opportunity.companyId !== company.id)
            throw AppError_1.AppError.forbidden('Not authorized to edit this opportunity');
        return funding_repository_1.fundingRepository.update(id, data);
    },
    async delete(accountId, id) {
        const opportunity = await funding_repository_1.fundingRepository.findById(id);
        if (!opportunity)
            throw AppError_1.AppError.notFound('Funding opportunity not found');
        const company = await company_repository_1.companyRepository.findByAccountId(accountId);
        if (!company || opportunity.companyId !== company.id)
            throw AppError_1.AppError.forbidden('Not authorized to delete this opportunity');
        return funding_repository_1.fundingRepository.delete(id);
    },
    async listPendingApproval() {
        return funding_repository_1.fundingRepository.listPendingApproval();
    },
    async setStatus(id, status, rejectionReason) {
        const opportunity = await funding_repository_1.fundingRepository.updateStatus(id, status, rejectionReason);
        const company = await company_repository_1.companyRepository.findById(opportunity.companyId);
        if (company) {
            await notification_repository_1.notificationRepository.create(company.accountId, 'FUNDING', `Funding opportunity ${status.toLowerCase()}`, `Your funding opportunity "${opportunity.title}" was ${status.toLowerCase()}.`);
        }
        return opportunity;
    },
    async listActive(page, limit) {
        const skip = (page - 1) * limit;
        return funding_repository_1.fundingRepository.listActive(skip, limit);
    }
};
