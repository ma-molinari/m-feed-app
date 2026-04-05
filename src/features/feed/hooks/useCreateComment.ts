import { useMutation, useQueryClient } from '@tanstack/react-query';

import { feedKeys } from '../queryKeys';
import { createComment } from '../services/feedApi';

export function useCreateComment(postId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => createComment(postId, content),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.comments(postId) });
      void queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
      void queryClient.invalidateQueries({ queryKey: feedKeys.forYou() });
      void queryClient.invalidateQueries({ queryKey: feedKeys.explore() });
    },
  });
}
