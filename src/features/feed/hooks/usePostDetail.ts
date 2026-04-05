import { useQuery } from '@tanstack/react-query';

import { fetchPostById } from '../services/feedApi';

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPostById(postId),
  });
}
