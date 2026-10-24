'use client';

import { useChat } from '@/context/ChatContext';

export const ConversationsList = () => {
  const { conversations, activeConversationId, selectConversation, startNewConversation } =
    useChat();

  return (
    <div className="flex flex-col gap-2">
      <button onClick={startNewConversation} className="border rounded px-2 py-1">
        New conversation
      </button>
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => selectConversation(conversation.id)}
          className={`border rounded px-3 py-2 text-left truncate ${
            conversation.id === activeConversationId ? 'font-semibold' : ''
          }`}
        >
          {conversation.title}
        </button>
      ))}
    </div>
  );
};
