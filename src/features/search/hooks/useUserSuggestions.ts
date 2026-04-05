import { useQuery } from '@tanstack/react-query';

import { fetchSuggestions } from '../services/searchApi';

export function useUserSuggestions() {
  return useQuery({
    queryKey: ['users', 'suggestions'],
    queryFn: fetchSuggestions,
  });
}
