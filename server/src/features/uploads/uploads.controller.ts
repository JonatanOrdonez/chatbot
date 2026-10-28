import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import { uploadImageService } from './uploads.service';

export const uploadImageController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);

  if (!req.file) {
    throw Boom.badRequest('An image is required in the "file" field');
  }

  const url = await uploadImageService(user.id, req.file);
  res.status(201).json({ url });
};
