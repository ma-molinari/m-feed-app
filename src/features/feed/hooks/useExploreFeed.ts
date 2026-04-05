import { useInfiniteQuery } from '@tanstack/react-query';

import { feedKeys } from '../queryKeys';
import { fetchExploreFeed } from '../services/feedApi';

const EXPLORE_PAGE_SIZE = 10;

export function useExploreFeed(enabled = true) {
  return useInfiniteQuery({
    queryKey: feedKeys.explore(),
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchExploreFeed({ page: pageParam as number, limit: EXPLORE_PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) === EXPLORE_PAGE_SIZE ? allPages.length : undefined,
  });
}
