import Boom from '@hapi/boom';
import { Router } from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { uploadImageController } from './uploads.controller';
import { IMAGE_MAX_SIZE_MB, IMAGE_MIME_TYPES } from './uploads.service';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: IMAGE_MAX_SIZE_MB * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (IMAGE_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(Boom.unsupportedMediaType('Only png, jpeg and webp images are supported'));
  },
});

const router = Router();

router.use(authMiddleware);

// Authenticate first so anonymous requests never get their body parsed
router.post('/images', upload.single('file'), uploadImageController);

export default router;
