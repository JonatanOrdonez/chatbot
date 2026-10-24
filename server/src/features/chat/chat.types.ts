export enum PromptRole {
  User = 'user',
  Assistant = 'assistant',
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
}

export interface CreateConversationDTO {
  userId: string;
  title: string;
}

export interface Prompt {
  id: string;
  conversationId: string;
  role: PromptRole;
  message: string;
  createdAt: Date;
}

export interface CreatePromptDTO {
  conversationId: string;
  role: PromptRole;
  message: string;
}

export interface PromptExchange {
  userPrompt: Prompt;
  assistantPrompt: Prompt;
}
