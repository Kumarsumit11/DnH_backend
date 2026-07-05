"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const AppError_1 = require("../errors/AppError");
const errorCodes_1 = require("../constants/errorCodes");
function authorize(...allowedRoles) {
    return (req, _res, next) => {
        if (!req.account) {
            return next(AppError_1.AppError.unauthorized());
        }
        if (!allowedRoles.includes(req.account.role)) {
            return next(AppError_1.AppError.forbidden(`Access restricted to: ${allowedRoles.join(', ')}`, errorCodes_1.ErrorCode.FORBIDDEN));
        }
        next();
    };
}
exports.authorize = authorize;
