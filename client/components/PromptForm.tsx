'use client';

import { useRef, useState } from 'react';
import { useChat } from '@/context/ChatContext';
import { IMAGE_ACCEPT, useImageUpload } from '@/hooks/useImageUpload';
import { getErrorMessage } from '@/lib/errors';

export const PromptForm = () => {
  const { sendMessage, isSending } = useChat();
  const image = useImageUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const isBusy = isSending || image.isUploading;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset so picking the same file again triggers a new change event
    e.target.value = '';
    if (file) image.selectFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isBusy) return;

    setError(null);

    try {
      await sendMessage(message.trim(), image.imageUrl ?? undefined);
      setMessage('');
      image.clear();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const errorMessage = error ?? image.error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      {errorMessage && <p className="text-red-600 text-sm">{errorMessage}</p>}
      {image.isUploading && <p className="text-sm opacity-60">Uploading image...</p>}
      {image.previewUrl && (
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image.previewUrl} alt="Selected" className="h-16 w-16 object-cover rounded border" />
          <button
            type="button"
            onClick={image.clear}
            disabled={isBusy}
            className="border rounded px-2 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          >
            Remove
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          className="border rounded px-2 py-1 flex-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isBusy}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={IMAGE_ACCEPT}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="border rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800"
        >
          Attach image
        </button>
        <button type="submit" disabled={isBusy} className="border rounded px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:disabled:bg-gray-800">
          Send
        </button>
      </div>
    </form>
  );
};
