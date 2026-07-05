"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCompanyProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateCompanyProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        companyName: zod_1.z.string().min(2).optional(),
        registrationNumber: zod_1.z.string().optional(),
        industry: zod_1.z.string().optional(),
        description: zod_1.z.string().optional(),
        website: zod_1.z.string().url().optional(),
        foundedYear: zod_1.z.number().int().min(1800).max(new Date().getFullYear()).optional(),
        teamSize: zod_1.z.number().int().min(1).optional(),
        address: zod_1.z.string().optional()
    })
});
