"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
}
exports.sendSuccess = sendSuccess;
function sendError(res, message, errorCode, statusCode = 400) {
    return res.status(statusCode).json({ success: false, message, errorCode });
}
exports.sendError = sendError;
