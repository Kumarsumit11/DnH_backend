"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentController = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const document_service_1 = require("../services/document.service");
const AppError_1 = require("../errors/AppError");
const client_1 = require("@prisma/client");
exports.documentController = {
    upload: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.file)
            throw AppError_1.AppError.badRequest('No file uploaded');
        const { type } = req.body;
        if (!type || !Object.values(client_1.DocumentType).includes(type)) {
            throw AppError_1.AppError.badRequest('Invalid or missing document type');
        }
        const document = await document_service_1.documentService.upload(req.account.id, type, req.file);
        (0, apiResponse_1.sendSuccess)(res, document, 'Document uploaded', 201);
    }),
    listOwn: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const documents = await document_service_1.documentService.listOwn(req.account.id);
        (0, apiResponse_1.sendSuccess)(res, documents);
    }),
    listPending: (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
        const documents = await document_service_1.documentService.listPending();
        (0, apiResponse_1.sendSuccess)(res, documents);
    }),
    review: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { status, rejectionReason } = req.body;
        const document = await document_service_1.documentService.review(req.account.id, req.params.id, status, rejectionReason);
        (0, apiResponse_1.sendSuccess)(res, document, `Document ${status.toLowerCase()}`);
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await document_service_1.documentService.delete(req.account.id, req.params.id);
        (0, apiResponse_1.sendSuccess)(res, {}, 'Document deleted');
    })
};
