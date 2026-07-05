"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const market_controller_1 = require("../controllers/market.controller");
const router = (0, express_1.Router)();
router.get("/home", market_controller_1.marketController.home);
exports.default = router;
