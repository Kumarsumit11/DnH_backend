import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/apiResponse';
import { fundingService } from '../services/funding.service';

export const fundingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const opportunity = await fundingService.create(req.account!.id, req.body);
    sendSuccess(res, opportunity, 'Funding opportunity created and submitted for approval', 201);
  }),

  listOwn: asyncHandler(async (req: Request, res: Response) => {
    const list = await fundingService.listOwn(req.account!.id);
    sendSuccess(res, list);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const opportunity = await fundingService.getById(req.params.id);
    sendSuccess(res, opportunity);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const opportunity = await fundingService.update(req.account!.id, req.params.id, req.body);
    sendSuccess(res, opportunity, 'Funding opportunity updated');
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await fundingService.delete(req.account!.id, req.params.id);
    sendSuccess(res, {}, 'Funding opportunity deleted');
  }),

  listActive: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit } = req.query;
    const list = await fundingService.listActive(page ? Number(page) : 1, limit ? Number(limit) : 20);
    sendSuccess(res, list);
  })
};
