"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const funding_service_1 = require("../services/funding.service");
exports.fundingController = {
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const opportunity = await funding_service_1.fundingService.create(req.account.id, req.body);
        (0, apiResponse_1.sendSuccess)(res, opportunity, 'Funding opportunity created and submitted for approval', 201);
    }),
    listOwn: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const list = await funding_service_1.fundingService.listOwn(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, list);
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const opportunity = await funding_service_1.fundingService.getById(req.params.id);
        (0, apiResponse_1.sendSuccess)(res, opportunity);
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const opportunity = await funding_service_1.fundingService.update(req.account.id, req.params.id, req.body);
        (0, apiResponse_1.sendSuccess)(res, opportunity, 'Funding opportunity updated');
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await funding_service_1.fundingService.delete(req.account.id, req.params.id);
        (0, apiResponse_1.sendSuccess)(res, {}, 'Funding opportunity deleted');
    }),
    listActive: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { page, limit } = req.query;
        const list = await funding_service_1.fundingService.listActive(page ? Number(page) : 1, limit ? Number(limit) : 20);
        (0, apiResponse_1.sendSuccess)(res, list);
    })
};
