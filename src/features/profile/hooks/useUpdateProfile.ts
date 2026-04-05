import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateProfile } from '../services/profileApi';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'me'] });
    },
  });
}
