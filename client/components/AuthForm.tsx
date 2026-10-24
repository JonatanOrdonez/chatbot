'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getErrorMessage } from '@/lib/errors';

export const AuthForm = () => {
  const { login, register } = useAuth();
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(email.trim(), password, name.trim());
        // Without a session (email confirmation enabled) the user must log in later
        setNotice('Account created. Check your email if confirmation is required, then log in.');
        setIsRegister(false);
        return;
      }

      await login(email.trim(), password);
      router.replace('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">{isRegister ? 'Create account' : 'Log in'}</h1>
      {isRegister && (
        <input
          className="border rounded px-2 py-1"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      )}
      <input
        className="border rounded px-2 py-1"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border rounded px-2 py-1"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      {notice && <p className="text-green-600 text-sm">{notice}</p>}
      <button type="submit" disabled={isLoading} className="border rounded px-2 py-1">
        {isRegister ? 'Register' : 'Log in'}
      </button>
      <button
        type="button"
        onClick={() => setIsRegister((prev) => !prev)}
        className="text-sm underline"
      >
        {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
      </button>
    </form>
  );
};
