import { apiClient } from '@services/api/client';

import type { PostWithAuthor, UserProfile } from '../types';

type ApiEnvelope<T> = { data: T };
type PostsPage = { ct: number; data: PostWithAuthor[] };

export async function fetchMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiEnvelope<UserProfile>>('/api/users/me');
  return data.data;
}

export async function fetchUserById(id: number): Promise<UserProfile> {
  const { data } = await apiClient.get<ApiEnvelope<UserProfile>>(`/api/users/${id}`);
  return data.data;
}

export async function fetchUserPosts(
  id: number,
  params: { page: number; limit?: number },
): Promise<PostsPage> {
  const { data } = await apiClient.get<PostsPage>(`/api/users/${id}/posts`, {
    params: { page: params.page, limit: params.limit },
  });
  return data;
}

export async function updateProfile(
  payload: Partial<{
    email: string;
    username: string;
    fullName: string;
    bio: string;
    avatar: string;
  }>,
): Promise<UserProfile> {
  const { data } = await apiClient.put<ApiEnvelope<UserProfile>>('/api/users/profile', payload);
  return data.data;
}

export async function updatePassword(payload: {
  password: string;
  newPassword: string;
}): Promise<void> {
  await apiClient.patch('/api/users/password', payload);
}

export async function followUser(userId: number): Promise<void> {
  await apiClient.post('/api/users/follow', { userId });
}

export async function unfollowUser(userId: number): Promise<void> {
  await apiClient.post('/api/users/unfollow', { userId });
}
