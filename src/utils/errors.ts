/**
 * Lightweight error classes. If your project already has a shared
 * AppError / HttpError class, replace these with imports from there —
 * the controllers only rely on `.statusCode` and `.message`.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

export class ValidationError extends AppError {
  details: unknown;

  constructor(message = 'Validation failed', details: unknown = null) {
    super(message, 422);
    this.details = details;
  }
}
