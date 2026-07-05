import { Request, Response, NextFunction } from 'express';
import { Role } from '../constants/roles';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';

export function authorize(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.account) {
      return next(AppError.unauthorized());
    }
    if (!allowedRoles.includes(req.account.role)) {
      return next(AppError.forbidden(`Access restricted to: ${allowedRoles.join(', ')}`, ErrorCode.FORBIDDEN));
    }
    next();
  };
}
