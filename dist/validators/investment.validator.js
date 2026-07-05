"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.proposalStatusSchema = exports.createProposalSchema = void 0;
const zod_1 = require("zod");
exports.createProposalSchema = zod_1.z.object({
    body: zod_1.z.object({
        fundingOpportunityId: zod_1.z.string().uuid(),
        proposedAmount: zod_1.z.number().positive(),
        message: zod_1.z.string().optional()
    })
});
exports.proposalStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['ACCEPTED', 'REJECTED'])
    })
});
