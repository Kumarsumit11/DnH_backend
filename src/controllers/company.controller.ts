import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { companyService } from '../services/company.service';
import { AppError } from '../errors/AppError';

export const companyController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const profile = await companyService.getProfile(req.account!.id);
    sendSuccess(res, profile);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await companyService.updateProfile(req.account!.id, req.body);
    sendSuccess(res, profile, 'Profile updated');
  }),

  uploadLogo: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('No file uploaded');
    const result = await companyService.uploadLogo(req.account!.id, req.file);
    sendSuccess(res, result, 'Logo uploaded');
  }),

  submitForVerification: asyncHandler(async (req: Request, res: Response) => {
    const profile = await companyService.submitForVerification(req.account!.id);
    sendSuccess(res, profile, 'Submitted for verification');
  })
};
