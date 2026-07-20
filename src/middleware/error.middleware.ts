import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errorCode: err.errorCode
    });
  }

  if (err instanceof ZodError) {
    const message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    return res.status(400).json({
      success: false,
      message,
      errorCode: ErrorCode.VALIDATION_ERROR
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `Duplicate value for field(s): ${(err.meta?.target as string[])?.join(', ')}`,
        errorCode: ErrorCode.CONFLICT
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        errorCode: ErrorCode.NOT_FOUND
      });
    }
  }

  console.error('UNHANDLED ERROR:', err);
  return res.status(500).json({
    success: false,
    message: 'Internal server error',
    errorCode: ErrorCode.INTERNAL_ERROR
  });
}

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    errorCode: ErrorCode.NOT_FOUND
  });
}

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  const statusCode = (err as { statusCode?: number })?.statusCode || 500;
  const message = (err as { message?: string })?.message || 'Internal server error';
  res.status(statusCode).json({
    success: false,
    message,
  });
};
