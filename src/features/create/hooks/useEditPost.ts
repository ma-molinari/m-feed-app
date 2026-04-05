import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '@navigation/types';
import { feedKeys } from '@features/feed/queryKeys';

import { updatePost } from '../services/createApi';

type EditPostInput = { id: number; content: string };

export function useEditPost(
  navigation: NativeStackNavigationProp<MainStackParamList>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: EditPostInput) => updatePost(id, { content }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: feedKeys.forYou() });
      queryClient.invalidateQueries({ queryKey: feedKeys.explore() });
      queryClient.invalidateQueries({ queryKey: feedKeys.post(id) });
      navigation.goBack();
    },
  });
}
