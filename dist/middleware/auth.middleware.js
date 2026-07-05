"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../errors/AppError");
const errorCodes_1 = require("../constants/errorCodes");
function authenticate(req, _res, next) {
    const authHeader = req.headers.authorization;
    const tokenFromCookie = req.cookies?.accessToken;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : tokenFromCookie;
    if (!token) {
        return next(AppError_1.AppError.unauthorized('No access token provided', errorCodes_1.ErrorCode.UNAUTHORIZED));
    }
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        req.account = { id: payload.sub, email: payload.email, role: payload.role };
        next();
    }
    catch (err) {
        return next(AppError_1.AppError.unauthorized('Invalid or expired access token', errorCodes_1.ErrorCode.TOKEN_EXPIRED));
    }
}
