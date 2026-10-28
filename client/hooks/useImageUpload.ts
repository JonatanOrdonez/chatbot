'use client';

import { useEffect, useState } from 'react';
import imageCompression from 'browser-image-compression';
import { api } from '@/lib/axios';
import { getErrorMessage } from '@/lib/errors';

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

export const IMAGE_ACCEPT = ALLOWED_TYPES.join(',');

export const useImageUpload = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const clear = () => {
    setImageUrl(null);
    setPreviewUrl(null);
    setError(null);
  };

  const selectFile = async (file: File) => {
    clear();

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Only png, jpeg and webp images are supported');
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`The image must be smaller than ${MAX_SIZE_MB} MB`);
      return;
    }

    setIsUploading(true);

    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      });

      const formData = new FormData();
      formData.append('file', compressed, file.name);

      // No Content-Type header: axios sets the multipart boundary itself
      const res = await api.post<{ url: string }>('/uploads/images', formData);

      setPreviewUrl(URL.createObjectURL(compressed));
      setImageUrl(res.data.url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  return { imageUrl, previewUrl, isUploading, error, selectFile, clear };
};
