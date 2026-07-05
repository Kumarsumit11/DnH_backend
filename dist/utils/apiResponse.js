"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
function sendSuccess(res, data = {}, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
}
function sendError(res, message, errorCode, statusCode = 400) {
    return res.status(statusCode).json({ success: false, message, errorCode });
}
