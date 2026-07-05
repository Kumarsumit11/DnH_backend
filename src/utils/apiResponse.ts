import { Response } from 'express';

export function sendSuccess(res: Response, data: unknown = {}, message = 'Success', statusCode = 200) {
  return res.status(statusCode).json({ success: true, message, data });
}

export function sendError(res: Response, message: string, errorCode: string, statusCode = 400) {
  return res.status(statusCode).json({ success: false, message, errorCode });
}
