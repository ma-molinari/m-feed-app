import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { fetchLikedPosts } from '../services/feedApi';

export function useLikedPosts() {
  const query = useQuery({
    queryKey: ['feed', 'likedPosts'],
    queryFn: fetchLikedPosts,
  });

  const isLiked = useCallback(
    (postId: number) => (query.data ?? []).includes(postId),
    [query.data],
  );

  return { ...query, isLiked };
}
