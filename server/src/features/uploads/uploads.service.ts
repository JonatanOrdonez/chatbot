import Boom from '@hapi/boom';
import { randomUUID } from 'node:crypto';
import { IMAGES_BUCKET } from '../../config/config';
import { supabase } from '../../config/supabase';

export const IMAGE_MAX_SIZE_MB = 5;

const EXTENSIONS: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export const IMAGE_MIME_TYPES = Object.keys(EXTENSIONS);

export const initStorage = async () => {
  const { error } = await supabase.storage.createBucket(IMAGES_BUCKET, {
    public: true,
    fileSizeLimit: `${IMAGE_MAX_SIZE_MB}MB`,
    allowedMimeTypes: IMAGE_MIME_TYPES,
  });

  if (error && !/already exists/i.test(error.message)) {
    throw error;
  }
};

// Every image lives under a folder named after its owner
const getUserFolderUrl = (userId: string): string =>
  supabase.storage.from(IMAGES_BUCKET).getPublicUrl(`${userId}/`).data.publicUrl;

export const isUserImageUrl = (url: string, userId: string): boolean =>
  url.startsWith(getUserFolderUrl(userId));

export const uploadImageService = async (
  userId: string,
  file: Express.Multer.File,
): Promise<string> => {
  const path = `${userId}/${randomUUID()}.${EXTENSIONS[file.mimetype]}`;

  const { error } = await supabase.storage
    .from(IMAGES_BUCKET)
    .upload(path, file.buffer, { contentType: file.mimetype });

  if (error) {
    console.log(error);
    throw Boom.badGateway('The image could not be stored', error.message);
  }

  return supabase.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
};
