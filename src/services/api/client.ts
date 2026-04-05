import axios from 'axios';

import { env } from '@constants/env';
import { useAuthStore } from '@store/authStore';

export const apiClient = axios.create({
  baseURL: env.apiUrl || undefined,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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
