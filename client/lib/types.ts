export interface User {
  id: string;
  email: string;
  token: string;
  data: {
    name: string;
  };
}

export type PromptRole = 'user' | 'assistant';

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
}

export interface Prompt {
  id: string;
  conversationId: string;
  role: PromptRole;
  message: string;
  createdAt: string;
}

export interface PromptExchange {
  userPrompt: Prompt;
  assistantPrompt: Prompt;
}

export interface CreateConversationResponse extends PromptExchange {
  conversation: Conversation;
}
