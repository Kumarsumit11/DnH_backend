"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.browseCompaniesQuerySchema = exports.updateInvestorProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateInvestorProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        fullName: zod_1.z.string().min(2).optional(),
        address: zod_1.z.string().optional(),
        investmentRangeMin: zod_1.z.number().nonnegative().optional(),
        investmentRangeMax: zod_1.z.number().nonnegative().optional(),
        preferredIndustries: zod_1.z.array(zod_1.z.string()).optional(),
        bio: zod_1.z.string().optional()
    })
});
exports.browseCompaniesQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        industry: zod_1.z.string().optional(),
        minFund: zod_1.z.string().optional(),
        maxFund: zod_1.z.string().optional(),
        page: zod_1.z.string().optional(),
        limit: zod_1.z.string().optional()
    })
});
