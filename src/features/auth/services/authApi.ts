/**
 * Contratos e chamadas HTTP de autenticação.
 * Login usa `apiClient` com `skipGlobal401Handler` para não disparar `signOut` em 401.
 */
import { apiClient } from '@services/api/client';

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
  return data.data;
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
