"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyService = void 0;
const company_repository_1 = require("../repositories/company.repository");
const storage_service_1 = require("../storage/storage.service");
const buckets_1 = require("../constants/buckets");
const AppError_1 = require("../errors/AppError");
const audit_repository_1 = require("../repositories/audit.repository");
exports.companyService = {
    async getProfile(accountId) {
        const profile = await company_repository_1.companyRepository.findByAccountId(accountId);
        if (!profile)
            throw AppError_1.AppError.notFound('Company profile not found');
        return profile;
    },
    async updateProfile(accountId, data) {
        const updated = await company_repository_1.companyRepository.update(accountId, data);
        await audit_repository_1.auditRepository.logActivity(accountId, 'PROFILE_UPDATE', 'Updated company profile');
        return updated;
    },
    async uploadLogo(accountId, file) {
        const result = await storage_service_1.storageService.uploadFile(buckets_1.Bucket.LOGOS, accountId, file);
        await company_repository_1.companyRepository.updateLogo(accountId, result.publicUrl);
        return result;
    },
    async submitForVerification(accountId) {
        const profile = await company_repository_1.companyRepository.submitForVerification(accountId);
        await audit_repository_1.auditRepository.logActivity(accountId, 'VERIFICATION_SUBMITTED', 'Submitted company for verification');
        return profile;
    }
};
