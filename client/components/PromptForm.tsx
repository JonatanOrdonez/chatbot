'use client';

import { useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { getErrorMessage } from '@/lib/errors';

export const PromptForm = () => {
  const { sendMessage, isSending } = useChat();
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    setError(null);

    try {
      await sendMessage(message.trim());
      setMessage('');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" disabled={isSending} className="border rounded px-2 py-1">
          Send
        </button>
      </div>
    </form>
  );
};
