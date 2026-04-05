import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { feedKeys } from '../queryKeys';
import { fetchLikedPosts } from '../services/feedApi';

export function useLikedPosts() {
  const query = useQuery({
    queryKey: feedKeys.likedPosts(),
    queryFn: fetchLikedPosts,
  });

  const likedIdSet = useMemo(() => new Set(query.data ?? []), [query.data]);

  return { ...query, likedIdSet };
}
