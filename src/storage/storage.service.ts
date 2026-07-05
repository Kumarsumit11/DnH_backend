import { v4 as uuid } from 'uuid';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../errors/AppError';

export interface UploadResult {
  path: string;
  publicUrl: string;
}

export const storageService = {
  async uploadFile(bucket: string, accountId: string, file: Express.Multer.File): Promise<UploadResult> {
    const ext = file.originalname.split('.').pop();
    const path = `${accountId}/${uuid()}.${ext}`;

    const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

    if (error) throw AppError.badRequest(`File upload failed: ${error.message}`);

    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  },

  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
    if (error) throw AppError.badRequest(`File deletion failed: ${error.message}`);
  },

  async getSignedUrl(bucket: string, path: string, expiresInSeconds = 3600): Promise<string> {
    const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
    if (error) throw AppError.badRequest(`Failed to sign URL: ${error.message}`);
    return data.signedUrl;
  }
};
