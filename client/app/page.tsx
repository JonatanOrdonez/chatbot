'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ConversationsList } from '@/components/ConversationsList';
import { PromptForm } from '@/components/PromptForm';
import { PromptsList } from '@/components/PromptsList';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, isAuthenticated, isReady, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isReady, isAuthenticated, router]);

  if (!isReady || !user) {
    return null;
  }

  return (
    <div className="flex flex-1 h-screen">
      <aside className="flex flex-col gap-4 w-72 border-r p-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <span className="font-semibold truncate">{user.data.name}</span>
          <button onClick={logout} className="border rounded px-2 py-1 text-sm">
            Log out
          </button>
        </div>
        <ConversationsList />
      </aside>
      <main className="flex flex-col gap-4 flex-1 p-4 min-w-0">
        <PromptsList />
        <PromptForm />
      </main>
    </div>
  );
}
