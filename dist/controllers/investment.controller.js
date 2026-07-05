"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investmentController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const investment_service_1 = require("../services/investment.service");
const company_service_1 = require("../services/company.service");
exports.investmentController = {
    createProposal: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { fundingOpportunityId, proposedAmount, message } = req.body;
        const proposal = await investment_service_1.investmentService.createProposal(req.account.id, fundingOpportunityId, proposedAmount, message);
        (0, apiResponse_1.sendSuccess)(res, proposal, 'Proposal submitted', 201);
    }),
    listOwnProposals: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const proposals = await investment_service_1.investmentService.listOwnProposals(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, proposals);
    }),
    listCompanyProposals: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const company = await company_service_1.companyService.getProfile(req.account.id);
        const proposals = await investment_service_1.investmentService.listCompanyProposals(company.id);
        (0, apiResponse_1.sendSuccess)(res, proposals);
    }),
    respondToProposal: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { status } = req.body;
        const proposal = await investment_service_1.investmentService.respondToProposal(req.account.id, req.params.id, status);
        (0, apiResponse_1.sendSuccess)(res, proposal, `Proposal ${status.toLowerCase()}`);
    }),
    listOwnInvestments: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const investments = await investment_service_1.investmentService.listOwnInvestments(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, investments);
    }),
    listCompanyInvestments: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const company = await company_service_1.companyService.getProfile(req.account.id);
        const investments = await investment_service_1.investmentService.listCompanyInvestments(company.id);
        (0, apiResponse_1.sendSuccess)(res, investments);
    })
};
