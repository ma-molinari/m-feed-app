import { useMutation, useQueryClient } from '@tanstack/react-query';

import { followUser, unfollowUser } from '../services/profileApi';

export function useFollowUser(userId: number) {
  const queryClient = useQueryClient();

  const follow = useMutation({
    mutationFn: () => followUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  const unfollow = useMutation({
    mutationFn: () => unfollowUser(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', userId] });
    },
  });

  return { follow, unfollow };
}
