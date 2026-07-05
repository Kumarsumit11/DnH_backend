import { Router } from "express";
import { marketController } from "../controllers/market.controller";

const router = Router();

router.get("/home", marketController.home);

export default router;