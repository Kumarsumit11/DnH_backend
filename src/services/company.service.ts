import { companyRepository } from '../repositories/company.repository';
import { storageService } from '../storage/storage.service';
import { Bucket } from '../constants/buckets';
import { AppError } from '../errors/AppError';
import { Prisma } from '@prisma/client';
import { auditRepository } from '../repositories/audit.repository';

export const companyService = {
  async getProfile(accountId: string) {
    const profile = await companyRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Company profile not found');
    return profile;
  },

  async updateProfile(accountId: string, data: Prisma.CompanyProfileUpdateInput) {
    const updated = await companyRepository.update(accountId, data);
    await auditRepository.logActivity(accountId, 'PROFILE_UPDATE', 'Updated company profile');
    return updated;
  },

  async uploadLogo(accountId: string, file: Express.Multer.File) {
    const result = await storageService.uploadFile(Bucket.LOGOS, accountId, file);
    await companyRepository.updateLogo(accountId, result.publicUrl);
    return result;
  },

  async submitForVerification(accountId: string) {
    const profile = await companyRepository.submitForVerification(accountId);
    await auditRepository.logActivity(accountId, 'VERIFICATION_SUBMITTED', 'Submitted company for verification');
    return profile;
  }
};
