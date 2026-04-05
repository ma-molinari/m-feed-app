import { useInfiniteQuery } from '@tanstack/react-query';

import { feedKeys } from '../queryKeys';
import { fetchFeed } from '../services/feedApi';

const FEED_PAGE_SIZE = 10;

export function useFeed(enabled = true) {
  return useInfiniteQuery({
    queryKey: feedKeys.forYou(),
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      fetchFeed({ page: pageParam as number, limit: FEED_PAGE_SIZE }),
    getNextPageParam: (lastPage, allPages) =>
      (lastPage.data?.length ?? 0) === FEED_PAGE_SIZE ? allPages.length : undefined,
  });
}
