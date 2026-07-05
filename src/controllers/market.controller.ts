import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/apiResponse";
import { marketService } from "../services/market.service";

export const marketController = {

  home: asyncHandler(async (_req: Request, res: Response) => {

    const data = await marketService.getHome();

    sendSuccess(
      res,
      data,
      "Market data fetched successfully"
    );

  }),

};