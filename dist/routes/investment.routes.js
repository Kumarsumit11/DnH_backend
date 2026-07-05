"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const investment_controller_1 = require("../controllers/investment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const investment_validator_1 = require("../validators/investment.validator");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// Investor
router.post('/proposals', (0, role_middleware_1.authorize)(roles_1.Role.INVESTOR), (0, validate_middleware_1.validate)(investment_validator_1.createProposalSchema), investment_controller_1.investmentController.createProposal);
router.get('/proposals/mine', (0, role_middleware_1.authorize)(roles_1.Role.INVESTOR), investment_controller_1.investmentController.listOwnProposals);
router.get('/investments/mine', (0, role_middleware_1.authorize)(roles_1.Role.INVESTOR), investment_controller_1.investmentController.listOwnInvestments);
// Company
router.get('/proposals/received', (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), investment_controller_1.investmentController.listCompanyProposals);
router.put('/proposals/:id/respond', (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), (0, validate_middleware_1.validate)(investment_validator_1.proposalStatusSchema), investment_controller_1.investmentController.respondToProposal);
router.get('/investments/received', (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), investment_controller_1.investmentController.listCompanyInvestments);
exports.default = router;
