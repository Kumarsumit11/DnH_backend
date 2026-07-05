"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const company_service_1 = require("../services/company.service");
const AppError_1 = require("../errors/AppError");
exports.companyController = {
    getMe: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await company_service_1.companyService.getProfile(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, profile);
    }),
    updateProfile: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await company_service_1.companyService.updateProfile(req.account.id, req.body);
        (0, apiResponse_1.sendSuccess)(res, profile, 'Profile updated');
    }),
    uploadLogo: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.file)
            throw AppError_1.AppError.badRequest('No file uploaded');
        const result = await company_service_1.companyService.uploadLogo(req.account.id, req.file);
        (0, apiResponse_1.sendSuccess)(res, result, 'Logo uploaded');
    }),
    submitForVerification: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const profile = await company_service_1.companyService.submitForVerification(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, profile, 'Submitted for verification');
    })
};
