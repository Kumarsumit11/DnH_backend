"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorService = void 0;
const investor_repository_1 = require("../repositories/investor.repository");
const company_repository_1 = require("../repositories/company.repository");
const storage_service_1 = require("../storage/storage.service");
const buckets_1 = require("../constants/buckets");
const AppError_1 = require("../errors/AppError");
const audit_repository_1 = require("../repositories/audit.repository");
exports.investorService = {
    async getProfile(accountId) {
        const profile = await investor_repository_1.investorRepository.findByAccountId(accountId);
        if (!profile)
            throw AppError_1.AppError.notFound('Investor profile not found');
        return profile;
    },
    async updateProfile(accountId, data) {
        const updated = await investor_repository_1.investorRepository.update(accountId, data);
        await audit_repository_1.auditRepository.logActivity(accountId, 'PROFILE_UPDATE', 'Updated investor profile');
        return updated;
    },
    async uploadAvatar(accountId, file) {
        const result = await storage_service_1.storageService.uploadFile(buckets_1.Bucket.AVATARS, accountId, file);
        await investor_repository_1.investorRepository.updateAvatar(accountId, result.publicUrl);
        return result;
    },
    async browseCompanies(filters, page, limit) {
        const skip = (page - 1) * limit;
        return company_repository_1.companyRepository.listApprovedWithFilters(filters, skip, limit);
    },
    async getCompanyDetail(companyId) {
        const company = await company_repository_1.companyRepository.findById(companyId);
        if (!company)
            throw AppError_1.AppError.notFound('Company not found');
        return company;
    }
};
