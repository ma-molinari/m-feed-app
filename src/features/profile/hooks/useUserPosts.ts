import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchUserPosts } from '../services/profileApi';

const PAGE_SIZE = 12;

export function useUserPosts(userId: number) {
  return useInfiniteQuery({
    queryKey: ['users', userId, 'posts'],
    enabled: userId > 0,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchUserPosts(userId, { page: pageParam as number, limit: PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) === PAGE_SIZE ? allPages.length : undefined,
  });
}
