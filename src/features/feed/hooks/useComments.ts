import { useInfiniteQuery } from '@tanstack/react-query';

import { feedKeys } from '../queryKeys';
import { fetchComments } from '../services/feedApi';

const COMMENTS_LIMIT = 20;

export function useComments(postId: number) {
  return useInfiniteQuery({
    queryKey: feedKeys.comments(postId),
    enabled: postId > 0,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchComments(postId, { page: pageParam as number, limit: COMMENTS_LIMIT }),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) === COMMENTS_LIMIT ? allPages.length : undefined,
  });
}
