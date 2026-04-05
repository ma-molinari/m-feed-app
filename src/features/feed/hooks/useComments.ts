import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchComments } from '../services/feedApi';

const COMMENTS_LIMIT = 20;

export function useComments(postId: number) {
  return useInfiniteQuery({
    queryKey: ['comments', postId],
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchComments(postId, { page: pageParam as number, limit: COMMENTS_LIMIT }),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) === COMMENTS_LIMIT ? allPages.length : undefined,
  });
}
