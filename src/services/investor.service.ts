import { investorRepository } from '../repositories/investor.repository';
import { companyRepository } from '../repositories/company.repository';
import { storageService } from '../storage/storage.service';
import { Bucket } from '../constants/buckets';
import { AppError } from '../errors/AppError';
import { Prisma } from '@prisma/client';
import { auditRepository } from '../repositories/audit.repository';

export const investorService = {
  async getProfile(accountId: string) {
    const profile = await investorRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Investor profile not found');
    return profile;
  },

  async updateProfile(accountId: string, data: Prisma.InvestorProfileUpdateInput) {
    const updated = await investorRepository.update(accountId, data);
    await auditRepository.logActivity(accountId, 'PROFILE_UPDATE', 'Updated investor profile');
    return updated;
  },

  async uploadAvatar(accountId: string, file: Express.Multer.File) {
    const result = await storageService.uploadFile(Bucket.AVATARS, accountId, file);
    await investorRepository.updateAvatar(accountId, result.publicUrl);
    return result;
  },

  async browseCompanies(filters: { industry?: string; minFund?: number; maxFund?: number }, page: number, limit: number) {
    const skip = (page - 1) * limit;
    return companyRepository.listApprovedWithFilters(filters, skip, limit);
  },

  async getCompanyDetail(companyId: string) {
    const company = await companyRepository.findById(companyId);
    if (!company) throw AppError.notFound('Company not found');
    return company;
  }
};
