import axios from 'axios';

import { env } from '@constants/env';
import { useAuthStore } from '@store/authStore';

import { MissingApiUrlError } from './errors';

export const apiClient = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  if (!env.apiUrl?.trim()) {
    return Promise.reject(new MissingApiUrlError());
  }
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Global 401 → `signOut` assumes the backend uses 401 for invalid/expired session on protected routes.
 * Login/register pass `skipGlobal401Handler` so wrong credentials do not clear a (non‑)session here.
 * If the API uses 401 for other cases, narrow this (e.g. path allowlist) after aligning with backend.
 */
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const skip = err.config?.skipGlobal401Handler === true;
    if (err.response?.status === 401 && !skip) {
      useAuthStore.getState().signOut();
    }
    return Promise.reject(err);
  },
);
