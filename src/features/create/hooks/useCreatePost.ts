import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainStackParamList } from '@navigation/types';
import { feedKeys } from '@features/feed/queryKeys';

import { createPost, uploadFile } from '../services/createApi';

type CreatePostInput = { uri: string; content: string };

export function useCreatePost(
  navigation: NativeStackNavigationProp<MainStackParamList>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ uri, content }: CreatePostInput) => {
      const { filename } = await uploadFile(uri);
      await createPost({ image: filename, content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedKeys.forYou() });
      queryClient.invalidateQueries({ queryKey: feedKeys.explore() });
      navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
    },
  });
}
