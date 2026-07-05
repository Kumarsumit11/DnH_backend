import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.accessToken;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : tokenFromCookie;

  if (!token) {
    return next(AppError.unauthorized('No access token provided', ErrorCode.UNAUTHORIZED));
  }

  try {
    const payload = verifyAccessToken(token);
    req.account = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  } catch (err) {
    return next(AppError.unauthorized('Invalid or expired access token', ErrorCode.TOKEN_EXPIRED));
  }
}
