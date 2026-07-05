"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const company_service_1 = require("../services/company.service");
const investor_service_1 = require("../services/investor.service");
const funding_service_1 = require("../services/funding.service");
const investment_service_1 = require("../services/investment.service");
const document_service_1 = require("../services/document.service");
const notification_service_1 = require("../services/notification.service");
const associate_service_1 = require("../services/associate.service");
exports.dashboardController = {
    companyDashboard: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await company_service_1.companyService.getProfile(req.account.id);
        const [fundingOpportunities, proposals, investments, documents, notifications] = await Promise.all([
            funding_service_1.fundingService.listOwn(req.account.id),
            investment_service_1.investmentService.listCompanyProposals(profile.id),
            investment_service_1.investmentService.listCompanyInvestments(profile.id),
            document_service_1.documentService.listOwn(req.account.id),
            notification_service_1.notificationService.list(req.account.id, true)
        ]);
        (0, apiResponse_1.sendSuccess)(res, { profile, fundingOpportunities, proposals, investments, documents, unreadNotifications: notifications });
    }),
    investorDashboard: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await investor_service_1.investorService.getProfile(req.account.id);
        const [proposals, investments, documents, notifications] = await Promise.all([
            investment_service_1.investmentService.listOwnProposals(req.account.id),
            investment_service_1.investmentService.listOwnInvestments(req.account.id),
            document_service_1.documentService.listOwn(req.account.id),
            notification_service_1.notificationService.list(req.account.id, true)
        ]);
        (0, apiResponse_1.sendSuccess)(res, { profile, proposals, investments, documents, unreadNotifications: notifications });
    }),
    associateDashboard: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const [pendingCompanies, pendingFunding, pendingDocuments, analytics] = await Promise.all([
            associate_service_1.associateService.listPendingCompanies(),
            associate_service_1.associateService.listPendingFunding(),
            associate_service_1.associateService.listPendingDocuments(),
            associate_service_1.associateService.getAnalytics()
        ]);
        (0, apiResponse_1.sendSuccess)(res, { pendingCompanies, pendingFunding, pendingDocuments, analytics });
    })
};
