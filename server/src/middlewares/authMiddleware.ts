import Boom from '@hapi/boom';
import { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { User } from '../features/auth/auth.types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  const [scheme, token] = (req.headers.authorization ?? '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw Boom.unauthorized('Missing or malformed Authorization header');
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw Boom.unauthorized('Invalid or expired token');
  }

  req.user = {
    id: data.user.id,
    email: data.user.email ?? '',
    token,
    data: { name: data.user.user_metadata?.name ?? '' },
  };

  next();
};

export const getUserFromRequest = (req: Request): User => {
  if (!req.user) {
    throw Boom.unauthorized('User not authenticated');
  }

  return req.user;
};
