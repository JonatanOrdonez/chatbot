import Boom from '@hapi/boom';
import { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { groq } from '../../config/groq';
import { GROQ_MODEL, GROQ_VISION_MODEL } from '../../config/config';
import {
  createConversationRepository,
  createPromptRepository,
  getConversationByIdAndUserRepository,
  getConversationsByUserIdRepository,
  getPromptsByConversationIdRepository,
} from './chat.repository';
import { Conversation, Prompt, PromptExchange, PromptRole } from './chat.types';
import { isUserImageUrl } from '../uploads/uploads.service';

const TITLE_MAX_LENGTH = 50;
const SYSTEM_PROMPT = 'You are a helpful assistant. Answer clearly and concisely.';

const getOwnedConversation = async (conversationId: string, userId: string) => {
  const conversation = await getConversationByIdAndUserRepository(conversationId, userId);

  if (!conversation) {
    throw Boom.notFound('Conversation not found');
  }

  return conversation;
};

// The URL ends up being fetched by Groq: only accept images this user uploaded to our bucket
const assertOwnImageUrl = (imageUrl: string | undefined, userId: string) => {
  if (imageUrl && !isUserImageUrl(imageUrl, userId)) {
    throw Boom.badRequest('Invalid image URL');
  }
};

const buildTitle = (message: string): string => {
  const trimmed = message.trim();
  return trimmed.length > TITLE_MAX_LENGTH ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}...` : trimmed;
};

// history is the conversation before userPrompt, which is the message being answered
// Only userPrompt's image is sent to the model: older images are not resent
const createAssistantPrompt = async (history: Prompt[], userPrompt: Prompt): Promise<Prompt> => {
  const userMessage: ChatCompletionMessageParam = userPrompt.imageUrl
    ? {
      role: 'user',
      content: [
        { type: 'text', text: userPrompt.message },
        { type: 'image_url', image_url: { url: userPrompt.imageUrl } },
      ],
    }
    : { role: 'user', content: userPrompt.message };

  try {
    const completion = await groq.chat.completions.create({
      model: userPrompt.imageUrl ? GROQ_VISION_MODEL : GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map((prompt) => ({ role: prompt.role, content: prompt.message })),
        userMessage,
      ],
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      throw Boom.badGateway('The AI service returned an empty response');
    }

    return await createPromptRepository({
      conversationId: userPrompt.conversationId,
      role: PromptRole.Assistant,
      message,
    });
  } catch (error) {
    if (Boom.isBoom(error)) throw error;
    throw Boom.badGateway('The AI service failed to respond');
  }
};

export const createPromptService = async (
  conversationId: string,
  userId: string,
  message: string,
  imageUrl?: string,
): Promise<PromptExchange> => {
  await getOwnedConversation(conversationId, userId);
  assertOwnImageUrl(imageUrl, userId);

  const history = await getPromptsByConversationIdRepository(conversationId);

  const userPrompt = await createPromptRepository({
    conversationId,
    role: PromptRole.User,
    message,
    imageUrl,
  });

  const assistantPrompt = await createAssistantPrompt(history, userPrompt);

  return { userPrompt, assistantPrompt };
};

export const createConversationService = async (userId: string, message: string, imageUrl?: string) => {
  assertOwnImageUrl(imageUrl, userId);

  const conversation = await createConversationRepository({
    userId,
    title: buildTitle(message),
  });

  const prompts = await createPromptService(conversation.id, userId, message, imageUrl);

  return { conversation, ...prompts };
};

export const getConversationsService = async (userId: string): Promise<Conversation[]> => {
  return getConversationsByUserIdRepository(userId);
};

export const getPromptsService = async (
  conversationId: string,
  userId: string,
): Promise<Prompt[]> => {
  await getOwnedConversation(conversationId, userId);
  return getPromptsByConversationIdRepository(conversationId);
};
