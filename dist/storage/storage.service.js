"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageService = void 0;
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const AppError_1 = require("../errors/AppError");
exports.storageService = {
    async uploadFile(bucket, accountId, file) {
        const ext = file.originalname.split('.').pop();
        const path = `${accountId}/${(0, uuid_1.v4)()}.${ext}`;
        const { error } = await supabase_1.supabaseAdmin.storage.from(bucket).upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false
        });
        if (error)
            throw AppError_1.AppError.badRequest(`File upload failed: ${error.message}`);
        const { data } = supabase_1.supabaseAdmin.storage.from(bucket).getPublicUrl(path);
        return { path, publicUrl: data.publicUrl };
    },
    async deleteFile(bucket, path) {
        const { error } = await supabase_1.supabaseAdmin.storage.from(bucket).remove([path]);
        if (error)
            throw AppError_1.AppError.badRequest(`File deletion failed: ${error.message}`);
    },
    async getSignedUrl(bucket, path, expiresInSeconds = 3600) {
        const { data, error } = await supabase_1.supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
        if (error)
            throw AppError_1.AppError.badRequest(`Failed to sign URL: ${error.message}`);
        return data.signedUrl;
    }
};
