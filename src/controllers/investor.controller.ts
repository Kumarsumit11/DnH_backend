import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { investorService } from '../services/investor.service';
import { AppError } from '../errors/AppError';

export const investorController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const profile = await investorService.getProfile(req.account!.id);
    sendSuccess(res, profile);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const profile = await investorService.updateProfile(req.account!.id, req.body);
    sendSuccess(res, profile, 'Profile updated');
  }),

  uploadAvatar: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw AppError.badRequest('No file uploaded');
    const result = await investorService.uploadAvatar(req.account!.id, req.file);
    sendSuccess(res, result, 'Avatar uploaded');
  }),

  browseCompanies: asyncHandler(async (req: Request, res: Response) => {
    const { industry, minFund, maxFund, page, limit } = req.query;
    const companies = await investorService.browseCompanies(
      {
        industry: industry as string | undefined,
        minFund: minFund ? Number(minFund) : undefined,
        maxFund: maxFund ? Number(maxFund) : undefined
      },
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );
    sendSuccess(res, companies);
  }),

  getCompanyDetail: asyncHandler(async (req: Request, res: Response) => {
    const company = await investorService.getCompanyDetail(req.params.id);
    sendSuccess(res, company);
  })
};
