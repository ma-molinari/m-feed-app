import { useQuery } from '@tanstack/react-query';

import { fetchUserById } from '../services/profileApi';

export function useUserById(id: number) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUserById(id),
    enabled: id > 0,
  });
}
