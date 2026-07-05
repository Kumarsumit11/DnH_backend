"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
exports.generateSecureToken = generateSecureToken;
const crypto_1 = __importDefault(require("crypto"));
function generateOtp(length = 6) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits[crypto_1.default.randomInt(0, digits.length)];
    }
    return otp;
}
function generateSecureToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
