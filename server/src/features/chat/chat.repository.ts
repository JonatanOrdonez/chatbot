import { pool } from '../../db/db';
import { Conversation, CreateConversationDTO, CreatePromptDTO, Prompt } from './chat.types';

const CONVERSATION_COLUMNS = 'id, user_id AS "userId", title, created_at AS "createdAt"';
const PROMPT_COLUMNS =
  'id, conversation_id AS "conversationId", role, message, image_url AS "imageUrl", created_at AS "createdAt"';

export const createConversationRepository = async (
  conversation: CreateConversationDTO,
): Promise<Conversation> => {
  const result = await pool.query<Conversation>(
    `INSERT INTO public.conversations (user_id, title)
     VALUES ($1, $2)
     RETURNING ${CONVERSATION_COLUMNS}`,
    [conversation.userId, conversation.title],
  );

  return result.rows[0];
};

export const getConversationsByUserIdRepository = async (
  userId: string,
): Promise<Conversation[]> => {
  const result = await pool.query<Conversation>(
    `SELECT ${CONVERSATION_COLUMNS}
     FROM public.conversations
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId],
  );

  return result.rows;
};

export const getConversationByIdAndUserRepository = async (
  id: string,
  userId: string,
): Promise<Conversation | undefined> => {
  const result = await pool.query<Conversation>(
    `SELECT ${CONVERSATION_COLUMNS}
     FROM public.conversations
     WHERE id = $1 AND user_id = $2`,
    [id, userId],
  );

  return result.rows[0];
};

export const createPromptRepository = async (prompt: CreatePromptDTO): Promise<Prompt> => {
  const result = await pool.query<Prompt>(
    `INSERT INTO public.prompts (conversation_id, role, message, image_url)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PROMPT_COLUMNS}`,
    [prompt.conversationId, prompt.role, prompt.message, prompt.imageUrl ?? null],
  );

  return result.rows[0];
};

export const getPromptsByConversationIdRepository = async (
  conversationId: string,
): Promise<Prompt[]> => {
  const result = await pool.query<Prompt>(
    `SELECT ${PROMPT_COLUMNS}
     FROM public.prompts
     WHERE conversation_id = $1
     ORDER BY created_at ASC`,
    [conversationId],
  );

  return result.rows;
};
