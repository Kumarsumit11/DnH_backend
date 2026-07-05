import multer from 'multer';
import { AppError } from '../errors/AppError';
import { ErrorCode } from '../constants/errorCodes';

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new AppError('Unsupported file type', 400, ErrorCode.UNSUPPORTED_FILE_TYPE));
    }
    cb(null, true);
  }
});
