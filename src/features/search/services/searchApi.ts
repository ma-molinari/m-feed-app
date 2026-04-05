import { apiClient } from '@services/api/client';

import type { SuggestionUser, UserSearchItem } from '../types';

type SuggestionsEnvelope = { data: SuggestionUser[] };
type SearchEnvelope = { ct: number; data: UserSearchItem[] };

export async function fetchSuggestions(): Promise<SuggestionUser[]> {
  const { data } = await apiClient.get<SuggestionsEnvelope>('/api/users/suggestions');
  return data.data ?? [];
}

export async function searchUsers(query: string): Promise<UserSearchItem[]> {
  const { data } = await apiClient.get<SearchEnvelope>('/api/users/search', {
    params: { query },
  });
  return data.data ?? [];
}
