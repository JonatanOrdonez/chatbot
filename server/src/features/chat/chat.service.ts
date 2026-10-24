import Boom from '@hapi/boom';
import { groq } from '../../config/groq';
import { GROQ_MODEL } from '../../config/config';
import {
  createConversationRepository,
  createPromptRepository,
  getConversationByIdAndUserRepository,
  getConversationsByUserIdRepository,
  getPromptsByConversationIdRepository,
} from './chat.repository';
import { Conversation, Prompt, PromptExchange, PromptRole } from './chat.types';

const TITLE_MAX_LENGTH = 50;
const SYSTEM_PROMPT = 'You are a helpful assistant. Answer clearly and concisely.';

const getOwnedConversation = async (conversationId: string, userId: string) => {
  const conversation = await getConversationByIdAndUserRepository(conversationId, userId);

  if (!conversation) {
    throw Boom.notFound('Conversation not found');
  }

  return conversation;
};

const buildTitle = (message: string): string => {
  const trimmed = message.trim();
  return trimmed.length > TITLE_MAX_LENGTH ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}...` : trimmed;
};

// The user prompt must already be saved: the model replies to the stored history
const createAssistantPrompt = async (conversationId: string): Promise<Prompt> => {
  const history = await getPromptsByConversationIdRepository(conversationId);

  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...history.map((prompt) => ({ role: prompt.role, content: prompt.message })),
      ],
    });

    const message = completion.choices[0]?.message?.content;

    if (!message) {
      throw Boom.badGateway('The AI service returned an empty response');
    }

    return await createPromptRepository({
      conversationId,
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
): Promise<PromptExchange> => {
  await getOwnedConversation(conversationId, userId);

  const userPrompt = await createPromptRepository({
    conversationId,
    role: PromptRole.User,
    message,
  });

  const assistantPrompt = await createAssistantPrompt(conversationId);

  return { userPrompt, assistantPrompt };
};

export const createConversationService = async (userId: string, message: string) => {
  const conversation = await createConversationRepository({
    userId,
    title: buildTitle(message),
  });

  const prompts = await createPromptService(conversation.id, userId, message);

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
