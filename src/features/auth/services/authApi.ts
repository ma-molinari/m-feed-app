/**
 * Contratos e chamadas HTTP de autenticação.
 * Login usa `apiClient` com `skipGlobal401Handler` para não disparar `signOut` em 401.
 */
import { apiClient } from '@services/api/client';
import { InvalidLoginResponseError } from '@services/api/errors';

import type { AuthUser } from '@features/auth/types';

export type LoginPayload = {
  email: string;
  password: string;
};

type LoginApiEnvelope = {
  data: {
    token: string;
    user: AuthUser;
  };
};

export async function login(payload: LoginPayload): Promise<{ token: string; user: AuthUser }> {
  const { data } = await apiClient.post<LoginApiEnvelope>('/public/login', payload, {
    skipGlobal401Handler: true,
  });
  const inner = data?.data;
  const token = inner?.token;
  const user = inner?.user;
  if (typeof token !== 'string' || !token.trim() || !user?.id) {
    throw new InvalidLoginResponseError();
  }
  return { token, user };
}

export type RegisterPayload = {
  email: string;
  username: string;
  fullName: string;
  password: string;
};

export async function register(payload: RegisterPayload): Promise<void> {
  await apiClient.post('/public/register', payload, {
    skipGlobal401Handler: true,
  });
}
