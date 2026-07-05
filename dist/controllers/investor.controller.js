"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.investorController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const investor_service_1 = require("../services/investor.service");
const AppError_1 = require("../errors/AppError");
exports.investorController = {
    getMe: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await investor_service_1.investorService.getProfile(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, profile);
    }),
    updateProfile: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await investor_service_1.investorService.updateProfile(req.account.id, req.body);
        (0, apiResponse_1.sendSuccess)(res, profile, 'Profile updated');
    }),
    uploadAvatar: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.file)
            throw AppError_1.AppError.badRequest('No file uploaded');
        const result = await investor_service_1.investorService.uploadAvatar(req.account.id, req.file);
        (0, apiResponse_1.sendSuccess)(res, result, 'Avatar uploaded');
    }),
    browseCompanies: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { industry, minFund, maxFund, page, limit } = req.query;
        const companies = await investor_service_1.investorService.browseCompanies({
            industry: industry,
            minFund: minFund ? Number(minFund) : undefined,
            maxFund: maxFund ? Number(maxFund) : undefined
        }, page ? Number(page) : 1, limit ? Number(limit) : 20);
        (0, apiResponse_1.sendSuccess)(res, companies);
    }),
    getCompanyDetail: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const company = await investor_service_1.investorService.getCompanyDetail(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, company);
    })
};
