"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fundingStatusSchema = exports.updateFundingSchema = exports.createFundingSchema = void 0;
const zod_1 = require("zod");
exports.createFundingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3),
        description: zod_1.z.string().min(10),
        fundNeeded: zod_1.z.number().positive(),
        fundPurpose: zod_1.z.string().min(3),
        valuation: zod_1.z.number().positive().optional(),
        minimumTicket: zod_1.z.number().positive().optional(),
        equityOfferedPct: zod_1.z.number().min(0).max(100).optional()
    })
});
exports.updateFundingSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3).optional(),
        description: zod_1.z.string().min(10).optional(),
        fundNeeded: zod_1.z.number().positive().optional(),
        fundPurpose: zod_1.z.string().min(3).optional(),
        valuation: zod_1.z.number().positive().optional(),
        minimumTicket: zod_1.z.number().positive().optional(),
        equityOfferedPct: zod_1.z.number().min(0).max(100).optional()
    })
});
exports.fundingStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['ACTIVE', 'REJECTED', 'CLOSED']),
        rejectionReason: zod_1.z.string().optional()
    })
});
