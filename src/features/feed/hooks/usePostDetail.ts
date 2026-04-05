import { useQuery } from '@tanstack/react-query';

import { feedKeys } from '../queryKeys';
import { fetchPostById } from '../services/feedApi';

export function usePostDetail(postId: number) {
  return useQuery({
    queryKey: feedKeys.post(postId),
    queryFn: () => fetchPostById(postId),
    enabled: postId > 0,
  });
}
