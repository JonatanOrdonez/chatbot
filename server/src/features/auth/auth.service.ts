import Boom from '@hapi/boom';
import { supabase } from '../../config/supabase';
import { LoginDTO, RegisterDTO, User } from './auth.types';

export const registerService = async ({ email, password, name }: RegisterDTO): Promise<User> => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });

  if (error || !data.user) {
    throw Boom.badRequest(error?.message ?? 'Could not register user');
  }

  return {
    id: data.user.id,
    email: data.user.email ?? email,
    token: data.session?.access_token ?? '',
    data: { name: data.user.user_metadata?.name ?? name },
  };
};

export const loginService = async ({ email, password }: LoginDTO): Promise<User> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.session) {
    throw Boom.unauthorized(error?.message ?? 'Invalid credentials');
  }

  return {
    id: data.user.id,
    email: data.user.email ?? email,
    token: data.session.access_token,
    data: { name: data.user.user_metadata?.name ?? '' },
  };
};
