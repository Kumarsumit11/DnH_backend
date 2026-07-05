"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_controller_1 = require("../controllers/document.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const upload_middleware_1 = require("../middleware/upload.middleware");
const document_validator_1 = require("../validators/document.validator");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.post('/', upload_middleware_1.upload.single('file'), document_controller_1.documentController.upload);
router.get('/mine', document_controller_1.documentController.listOwn);
router.delete('/:id', document_controller_1.documentController.delete);
// Associate partner review
router.get('/pending', (0, role_middleware_1.authorize)(roles_1.Role.ASSOCIATE_PARTNER), document_controller_1.documentController.listPending);
router.put('/:id/review', (0, role_middleware_1.authorize)(roles_1.Role.ASSOCIATE_PARTNER), (0, validate_middleware_1.validate)(document_validator_1.documentStatusSchema), document_controller_1.documentController.review);
exports.default = router;
