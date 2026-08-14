import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { companyUpdateService } from '../services/company-update.service';

export const companyUpdateController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const update = await companyUpdateService.create(req.account!.id, req.body);
    sendSuccess(res, update, 'Update created');
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const updates = await companyUpdateService.list(req.account!.id);
    sendSuccess(res, updates);
  }),

  edit: asyncHandler(async (req: Request, res: Response) => {
    const update = await companyUpdateService.edit(req.account!.id, req.params.id, req.body);
    sendSuccess(res, update, 'Update edited');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await companyUpdateService.remove(req.account!.id, req.params.id);
    sendSuccess(res, null, 'Update deleted');
  })
};