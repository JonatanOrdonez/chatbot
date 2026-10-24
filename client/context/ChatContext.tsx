'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/lib/axios';
import { Conversation, CreateConversationResponse, Prompt, PromptExchange } from '@/lib/types';
import { useAuth } from './AuthContext';

interface ChatContextValue {
  conversations: Conversation[];
  activeConversationId: string | null;
  prompts: Prompt[];
  isSending: boolean;
  selectConversation: (id: string) => Promise<void>;
  startNewConversation: () => void;
  sendMessage: (message: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

const ChatState = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const onInit = async () => {
      const res = await api.get<Conversation[]>('/conversations');
      setConversations(res.data);
    };

    onInit();
  }, [isAuthenticated]);

  const selectConversation = async (id: string) => {
    setActiveConversationId(id);
    setPrompts([]);
    const res = await api.get<Prompt[]>(`/conversations/${id}/prompts`);
    setPrompts(res.data);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setPrompts([]);
  };

  const sendMessage = async (message: string) => {
    setIsSending(true);

    try {
      if (activeConversationId) {
        const res = await api.post<PromptExchange>(
          `/conversations/${activeConversationId}/prompts`,
          { message },
        );
        setPrompts((prev) => [...prev, res.data.userPrompt, res.data.assistantPrompt]);
        return;
      }

      const res = await api.post<CreateConversationResponse>('/conversations', { message });
      setConversations((prev) => [res.data.conversation, ...prev]);
      setActiveConversationId(res.data.conversation.id);
      setPrompts([res.data.userPrompt, res.data.assistantPrompt]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <ChatContext.Provider
      value={{
        conversations,
        activeConversationId,
        prompts,
        isSending,
        selectConversation,
        startNewConversation,
        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

// Keyed by user so the chat state is reset on login/logout
export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  return <ChatState key={user?.id ?? 'anonymous'}>{children}</ChatState>;
};

export const useChat = () => {
  const context = useContext(ChatContext);

  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};
