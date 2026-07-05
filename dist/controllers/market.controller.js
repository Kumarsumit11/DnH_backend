"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const market_service_1 = require("../services/market.service");
exports.marketController = {
    home: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const data = await market_service_1.marketService.getHome();
        (0, apiResponse_1.sendSuccess)(res, data, "Market data fetched successfully");
    }),
};
