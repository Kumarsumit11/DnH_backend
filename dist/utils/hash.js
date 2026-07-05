"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareToken = exports.hashToken = exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const SALT_ROUNDS = 12;
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
exports.hashPassword = hashPassword;
async function comparePassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
exports.comparePassword = comparePassword;
async function hashToken(token) {
    return bcryptjs_1.default.hash(token, 10);
}
exports.hashToken = hashToken;
async function compareToken(token, hash) {
    return bcryptjs_1.default.compare(token, hash);
}
exports.compareToken = compareToken;
