import { useQuery } from '@tanstack/react-query';

import { fetchMe } from '../services/profileApi';

export function useMyProfile() {
  return useQuery({
    queryKey: ['users', 'me'],
    queryFn: fetchMe,
  });
}
