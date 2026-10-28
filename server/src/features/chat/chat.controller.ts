import Boom from '@hapi/boom';
import { Request, Response } from 'express';
import { getUserFromRequest } from '../../middlewares/authMiddleware';
import {
  createConversationService,
  createPromptService,
  getConversationsService,
  getPromptsService,
} from './chat.service';

const getMessage = (req: Request): string => {
  const message = req.body.message;

  if (typeof message !== 'string' || !message.trim()) {
    throw Boom.badRequest('Message is required');
  }

  return message;
};

const getImageUrl = (req: Request): string | undefined => {
  const imageUrl = req.body.imageUrl;

  if (imageUrl === undefined || imageUrl === null) return undefined;

  if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
    throw Boom.badRequest('imageUrl must be a non-empty string');
  }

  return imageUrl;
};

export const createConversationController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const result = await createConversationService(user.id, getMessage(req), getImageUrl(req));
  res.status(201).json(result);
};

export const getConversationsController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const conversations = await getConversationsService(user.id);
  res.status(200).json(conversations);
};

export const createPromptController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const result = await createPromptService(
    String(req.params.conversationId),
    user.id,
    getMessage(req),
    getImageUrl(req),
  );
  res.status(201).json(result);
};

export const getPromptsController = async (req: Request, res: Response) => {
  const user = getUserFromRequest(req);
  const prompts = await getPromptsService(String(req.params.conversationId), user.id);
  res.status(200).json(prompts);
};
