import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '@navigation/types';
import { updatePost } from '../services/createApi';

type EditPostInput = { id: number; content: string };

export function useEditPost(
  navigation: NativeStackNavigationProp<MainStackParamList>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }: EditPostInput) => updatePost(id, { content }),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feed', 'foryou'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'explore'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      navigation.goBack();
    },
  });
}
