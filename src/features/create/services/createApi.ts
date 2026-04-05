import { apiClient } from '@services/api/client';

export async function uploadFile(uri: string): Promise<{ filename: string; mimetype: string }> {
  const formData = new FormData();
  formData.append('file', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  const { data } = await apiClient.post('/api/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function createPost(payload: { image: string; content: string }): Promise<void> {
  await apiClient.post('/api/posts', payload);
}

export async function updatePost(id: number, payload: { content: string }): Promise<void> {
  await apiClient.put(`/api/posts/${id}`, payload);
}
