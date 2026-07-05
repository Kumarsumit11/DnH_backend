import { ErrorCode } from '../constants/errorCodes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: ErrorCode;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, errorCode: ErrorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, errorCode: ErrorCode = ErrorCode.VALIDATION_ERROR) {
    return new AppError(message, 400, errorCode);
  }
  static unauthorized(message = 'Unauthorized', errorCode: ErrorCode = ErrorCode.UNAUTHORIZED) {
    return new AppError(message, 401, errorCode);
  }
  static forbidden(message = 'Forbidden', errorCode: ErrorCode = ErrorCode.FORBIDDEN) {
    return new AppError(message, 403, errorCode);
  }
  static notFound(message = 'Resource not found', errorCode: ErrorCode = ErrorCode.NOT_FOUND) {
    return new AppError(message, 404, errorCode);
  }
  static conflict(message: string, errorCode: ErrorCode = ErrorCode.CONFLICT) {
    return new AppError(message, 409, errorCode);
  }
  static internal(message = 'Internal server error') {
    return new AppError(message, 500, ErrorCode.INTERNAL_ERROR);
  }
}
