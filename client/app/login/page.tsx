'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/components/AuthForm';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, isReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/');
    }
  }, [isReady, isAuthenticated, router]);

  return (
    <main className="max-w-sm mx-auto py-10 px-4 w-full">
      <AuthForm />
    </main>
  );
}
