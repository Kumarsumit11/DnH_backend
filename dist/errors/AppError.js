"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
const errorCodes_1 = require("../constants/errorCodes");
class AppError extends Error {
    constructor(message, statusCode, errorCode) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.isOperational = true;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
    static badRequest(message, errorCode = errorCodes_1.ErrorCode.VALIDATION_ERROR) {
        return new AppError(message, 400, errorCode);
    }
    static unauthorized(message = 'Unauthorized', errorCode = errorCodes_1.ErrorCode.UNAUTHORIZED) {
        return new AppError(message, 401, errorCode);
    }
    static forbidden(message = 'Forbidden', errorCode = errorCodes_1.ErrorCode.FORBIDDEN) {
        return new AppError(message, 403, errorCode);
    }
    static notFound(message = 'Resource not found', errorCode = errorCodes_1.ErrorCode.NOT_FOUND) {
        return new AppError(message, 404, errorCode);
    }
    static conflict(message, errorCode = errorCodes_1.ErrorCode.CONFLICT) {
        return new AppError(message, 409, errorCode);
    }
    static internal(message = 'Internal server error') {
        return new AppError(message, 500, errorCodes_1.ErrorCode.INTERNAL_ERROR);
    }
}
exports.AppError = AppError;
