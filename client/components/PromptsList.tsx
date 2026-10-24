'use client';

import { useChat } from '@/context/ChatContext';

export const PromptsList = () => {
  const { prompts, isSending } = useChat();

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
      {prompts.length === 0 && !isSending && (
        <p className="text-sm opacity-60">Send a message to start a conversation.</p>
      )}
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className={`max-w-[80%] rounded px-3 py-2 border whitespace-pre-wrap ${
            prompt.role === 'user' ? 'self-end' : 'self-start'
          }`}
        >
          {prompt.message}
        </div>
      ))}
      {isSending && <p className="text-sm opacity-60">Thinking...</p>}
    </div>
  );
};
