import { companyUpdateRepository } from '../repositories/company-update.repository';
import { companyRepository } from '../repositories/company.repository';
import { AppError } from '../errors/AppError';
import { auditRepository } from '../repositories/audit.repository';
import { Prisma } from '@prisma/client';

export const companyUpdateService = {
  async create(accountId: string, data: Prisma.CompanyUpdateCreateWithoutCompanyInput) {
    const profile = await companyRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Company profile not found');

    const update = await companyUpdateRepository.create(profile.id, data);
    await auditRepository.logActivity(accountId, 'UPDATE_CREATED', 'Created company update');
    return update;
  },

  async list(accountId: string) {
    const profile = await companyRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Company profile not found');
    return companyUpdateRepository.listByCompanyId(profile.id);
  },

  async listForCompany(companyId: string) {
    return companyUpdateRepository.listByCompanyId(companyId);
  },

  async edit(accountId: string, id: string, data: Prisma.CompanyUpdateUpdateInput) {
    const profile = await companyRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Company profile not found');

    const existing = await companyUpdateRepository.findById(id);
    if (!existing || existing.companyId !== profile.id) throw AppError.notFound('Update not found');

    const updated = await companyUpdateRepository.update(id, data);
    await auditRepository.logActivity(accountId, 'UPDATE_EDITED', 'Edited company update');
    return updated;
  },

  async remove(accountId: string, id: string) {
    const profile = await companyRepository.findByAccountId(accountId);
    if (!profile) throw AppError.notFound('Company profile not found');

    const existing = await companyUpdateRepository.findById(id);
    if (!existing || existing.companyId !== profile.id) throw AppError.notFound('Update not found');

    await companyUpdateRepository.delete(id);
    await auditRepository.logActivity(accountId, 'UPDATE_DELETED', 'Deleted company update');
  }
};