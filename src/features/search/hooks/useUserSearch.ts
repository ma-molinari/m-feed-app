import { useQuery } from '@tanstack/react-query';

import { searchUsers } from '../services/searchApi';

export function useUserSearch(debouncedQuery: string) {
  return useQuery({
    queryKey: ['users', 'search', debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });
}
