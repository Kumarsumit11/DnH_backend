"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const funding_controller_1 = require("../controllers/funding.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const funding_validator_1 = require("../validators/funding.validator");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
// Public / cross-role
router.get('/active', auth_middleware_1.authenticate, funding_controller_1.fundingController.listActive);
router.get('/:id', auth_middleware_1.authenticate, funding_controller_1.fundingController.getById);
// Company only
router.post('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), (0, validate_middleware_1.validate)(funding_validator_1.createFundingSchema), funding_controller_1.fundingController.create);
router.get('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), funding_controller_1.fundingController.listOwn);
router.put('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), (0, validate_middleware_1.validate)(funding_validator_1.updateFundingSchema), funding_controller_1.fundingController.update);
router.delete('/:id', auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(roles_1.Role.COMPANY), funding_controller_1.fundingController.delete);
exports.default = router;
