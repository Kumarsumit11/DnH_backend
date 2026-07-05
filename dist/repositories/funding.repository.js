"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingRepository = void 0;
const prisma_1 = require("../config/prisma");
const client_1 = require("@prisma/client");
exports.fundingRepository = {
    create: (companyId, data) => prisma_1.prisma.fundingOpportunity.create({ data: { ...data, company: { connect: { id: companyId } } } }),
    findById: (id) => prisma_1.prisma.fundingOpportunity.findUnique({ where: { id }, include: { company: true } }),
    listByCompany: (companyId) => prisma_1.prisma.fundingOpportunity.findMany({ where: { companyId }, orderBy: { createdAt: 'desc' } }),
    update: (id, data) => prisma_1.prisma.fundingOpportunity.update({ where: { id }, data }),
    updateStatus: (id, status, rejectionReason) => prisma_1.prisma.fundingOpportunity.update({ where: { id }, data: { status, rejectionReason } }),
    delete: (id) => prisma_1.prisma.fundingOpportunity.delete({ where: { id } }),
    listPendingApproval: () => prisma_1.prisma.fundingOpportunity.findMany({ where: { status: client_1.FundingStatus.PENDING_APPROVAL }, include: { company: true } }),
    listActive: (skip, take) => prisma_1.prisma.fundingOpportunity.findMany({ where: { status: client_1.FundingStatus.ACTIVE }, include: { company: true }, skip, take })
};
