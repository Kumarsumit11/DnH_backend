"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.associateController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const associate_service_1 = require("../services/associate.service");
const funding_service_1 = require("../services/funding.service");
exports.associateController = {
    listPendingCompanies: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const companies = await associate_service_1.associateService.listPendingCompanies();
        (0, apiResponse_1.sendSuccess)(res, companies);
    }),
    approveCompany: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const company = await associate_service_1.associateService.approveCompany(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, company, 'Company approved');
    }),
    rejectCompany: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { reason } = req.body;
        const company = await associate_service_1.associateService.rejectCompany(req.params.id, reason);
        (0, apiResponse_1.sendSuccess)(res, company, 'Company rejected');
    }),
    listPendingFunding: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const list = await associate_service_1.associateService.listPendingFunding();
        (0, apiResponse_1.sendSuccess)(res, list);
    }),
    approveFunding: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const opportunity = await funding_service_1.fundingService.setStatus(req.params.id, 'ACTIVE');
        (0, apiResponse_1.sendSuccess)(res, opportunity, 'Funding opportunity approved');
    }),
    rejectFunding: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { rejectionReason } = req.body;
        const opportunity = await funding_service_1.fundingService.setStatus(req.params.id, 'REJECTED', rejectionReason);
        (0, apiResponse_1.sendSuccess)(res, opportunity, 'Funding opportunity rejected');
    }),
    listPendingDocuments: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const documents = await associate_service_1.associateService.listPendingDocuments();
        (0, apiResponse_1.sendSuccess)(res, documents);
    }),
    listUsers: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const role = req.query.role;
        const users = await associate_service_1.associateService.listAllUsers(role);
        (0, apiResponse_1.sendSuccess)(res, users);
    }),
    suspendUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const account = await associate_service_1.associateService.suspendUser(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, account, 'User suspended');
    }),
    reactivateUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const account = await associate_service_1.associateService.reactivateUser(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, account, 'User reactivated');
    }),
    analytics: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const analytics = await associate_service_1.associateService.getAnalytics();
        (0, apiResponse_1.sendSuccess)(res, analytics);
    })
};
