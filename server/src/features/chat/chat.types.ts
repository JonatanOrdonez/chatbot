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
  imageUrl: string | null;
  createdAt: Date;
}

export interface CreatePromptDTO {
  conversationId: string;
  role: PromptRole;
  message: string;
  imageUrl?: string;
}

export interface PromptExchange {
  userPrompt: Prompt;
  assistantPrompt: Prompt;
}
