import type { AxiosError } from 'axios';

import { env } from '@constants/env';

const GENERIC = 'Não foi possível concluir a operação. Tente novamente.';

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

/** Maps Axios/network failures to a single string for the UI (AUTH-03/04 + edge cases). */
export function getApiErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return GENERIC;
  }

  const status = error.response?.status;
  const body = error.response?.data;

  if (status === 401) {
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
