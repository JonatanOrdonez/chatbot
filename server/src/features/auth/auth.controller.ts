import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import { loginService, registerService } from './auth.service';

export const registerController = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');
  if (!name) throw Boom.badRequest('Name is required');

  const user = await registerService({ email, password, name });
  res.status(201).json(user);
};

export const loginController = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email) throw Boom.badRequest('Email is required');
  if (!password) throw Boom.badRequest('Password is required');

  const user = await loginService({ email, password });
  res.status(200).json(user);
};
