"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentStatusSchema = void 0;
const zod_1 = require("zod");
exports.documentStatusSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.enum(['VERIFIED', 'REJECTED']),
        rejectionReason: zod_1.z.string().optional()
    })
});
