"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundMiddleware = exports.errorMiddleware = void 0;
const AppError_1 = require("../errors/AppError");
const errorCodes_1 = require("../constants/errorCodes");
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
function errorMiddleware(err, _req, res, _next) {
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errorCode: err.errorCode
        });
    }
    if (err instanceof zod_1.ZodError) {
        const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        return res.status(400).json({
            success: false,
            message,
            errorCode: errorCodes_1.ErrorCode.VALIDATION_ERROR
        });
    }
    if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
            return res.status(409).json({
                success: false,
                message: `Duplicate value for field(s): ${err.meta?.target?.join(', ')}`,
                errorCode: errorCodes_1.ErrorCode.CONFLICT
            });
        }
        if (err.code === 'P2025') {
            return res.status(404).json({
                success: false,
                message: 'Record not found',
                errorCode: errorCodes_1.ErrorCode.NOT_FOUND
            });
        }
    }
    console.error('UNHANDLED ERROR:', err);
    return res.status(500).json({
        success: false,
        message: 'Internal server error',
        errorCode: errorCodes_1.ErrorCode.INTERNAL_ERROR
    });
}
exports.errorMiddleware = errorMiddleware;
function notFoundMiddleware(req, res) {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`,
        errorCode: errorCodes_1.ErrorCode.NOT_FOUND
    });
}
exports.notFoundMiddleware = notFoundMiddleware;
