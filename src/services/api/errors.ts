import type { AxiosError } from 'axios';

import { env } from '@constants/env';

const GENERIC = 'Não foi possível concluir a operação. Tente novamente.';

/** Thrown when `env.apiUrl` is empty and a request would leave the client without a base URL. */
export class MissingApiUrlError extends Error {
  constructor() {
    super(
      'API não configurada. Defina EXPO_PUBLIC_API_URL no .env ou em extra (veja docs/INTEGRATIONS.md). Reinicie o Metro com -c após alterar .env.',
    );
    this.name = 'MissingApiUrlError';
  }
}

/** Thrown when `POST /public/login` returns a body without a usable token and user id. */
export class InvalidLoginResponseError extends Error {
  constructor() {
    super('Resposta de login inválida. Tente novamente ou atualize o app.');
    this.name = 'InvalidLoginResponseError';
  }
}

function isAxiosError(payload: unknown): payload is AxiosError {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    (payload as { isAxiosError?: boolean }).isAxiosError === true
  );
}

function extract400Message(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message.trim()) return o.message;
  const errors = o.errors;
  if (!Array.isArray(errors) || errors.length === 0) return undefined;
  const first = errors[0];
  if (typeof first === 'string' && first.trim()) return first;
  if (first && typeof first === 'object' && 'message' in first) {
    const m = (first as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return undefined;
}

/** Where the error is shown: adjusts 401 copy (login form vs authenticated session). */
export type ApiErrorContext = 'login' | 'authenticated';

/** Maps Axios/network failures to a single string for the UI (AUTH-03/04 + edge cases). */
export function getApiErrorMessage(error: unknown, context?: ApiErrorContext): string {
  if (error instanceof MissingApiUrlError || error instanceof InvalidLoginResponseError) {
    return error.message;
  }
  if (!isAxiosError(error)) {
    return GENERIC;
  }

  const status = error.response?.status;
  const body = error.response?.data;

  if (status === 401) {
    if (context === 'authenticated') {
      return 'Sessão expirada. Faça login novamente.';
    }
    return 'Credenciais inválidas';
  }

  if (status === 400) {
    return extract400Message(body) ?? GENERIC;
  }

  if (status != null && status >= 500) {
    return GENERIC;
  }

  if (error.code === 'ECONNABORTED') {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn('[api] timeout', { baseURL: env.apiUrl || '(empty)' });
    }
    return 'Tempo esgotado. Verifique se o servidor está no ar e tente novamente.';
  }

  if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.warn(
        '[api] network error (unreachable host, blocked HTTP, or wrong URL). baseURL:',
        env.apiUrl || '(empty)',
        '— Android emulator: use http://10.0.2.2:<port> instead of localhost; rebuild native app after app.json network changes.',
      );
    }
    return 'Não foi possível conectar ao servidor. Verifique sua rede, a URL da API (EXPO_PUBLIC_API_URL) e tente novamente.';
  }

  return GENERIC;
}
