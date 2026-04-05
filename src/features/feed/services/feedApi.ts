import { apiClient } from '@services/api/client';

import type { FeedPage } from '../types';

/** Login/register usam envelope `{ data: … }`; o feed retorna `{ ct, data }` direto no corpo (sem wrapper). */
type ApiEnvelope<T> = { data: T };

const FEED_LIMIT = 10;

export async function fetchFeed(params: { page: number; limit?: number }): Promise<FeedPage> {
  const limit = params.limit ?? FEED_LIMIT;
  const { data } = await apiClient.get<FeedPage>('/api/posts/feed', {
    params: { page: params.page, limit },
  });
  return data;
}

export async function fetchExploreFeed(params: { page: number; limit?: number }): Promise<FeedPage> {
  const limit = params.limit ?? FEED_LIMIT;
  const { data } = await apiClient.get<FeedPage>('/api/posts/explore', {
    params: { page: params.page, limit },
  });
  return data;
}

export async function fetchLikedPosts(): Promise<number[]> {
  const { data } = await apiClient.get<ApiEnvelope<number[]>>('/api/users/me/liked-posts');
  return data.data ?? [];
}

export async function likePost(postId: number): Promise<void> {
  await apiClient.post('/api/posts/like', { postId });
}

export async function unlikePost(postId: number): Promise<void> {
  await apiClient.post('/api/posts/unlike', { postId });
}

export async function deletePost(id: number): Promise<void> {
  await apiClient.delete(`/api/posts/${id}`);
}
