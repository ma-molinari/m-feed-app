import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import type { FeedPage } from '../types';
import { deletePost, likePost, unlikePost } from '../services/feedApi';

const FEED_FOR_YOU_KEY = ['feed', 'foryou'] as const;
const LIKED_POSTS_KEY = ['feed', 'likedPosts'] as const;

type MutationContext = {
  previousLiked: number[] | undefined;
  previousFeed: InfiniteData<FeedPage> | undefined;
};

function patchFeedPostLikes(
  old: InfiniteData<FeedPage> | undefined,
  postId: number,
  delta: number,
): InfiniteData<FeedPage> | undefined {
  if (!old) return old;
  return {
    ...old,
    pages: old.pages.map((page) => ({
      ...page,
      data:
        page.data?.map((post) =>
          post.id === postId
            ? {
                ...post,
                total_likes: Math.max(0, (post.total_likes ?? 0) + delta),
              }
            : post,
        ) ?? [],
    })),
  };
}

export function useFeedMutations() {
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: LIKED_POSTS_KEY });
      await queryClient.cancelQueries({ queryKey: FEED_FOR_YOU_KEY });

      const previousLiked = queryClient.getQueryData<number[]>(LIKED_POSTS_KEY);
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(FEED_FOR_YOU_KEY);
      const wasLiked = previousLiked?.includes(postId) ?? false;

      queryClient.setQueryData<number[]>(LIKED_POSTS_KEY, (old) => {
        const next = new Set(old ?? []);
        next.add(postId);
        return [...next];
      });

      if (!wasLiked) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(FEED_FOR_YOU_KEY, (old) =>
          patchFeedPostLikes(old, postId, 1),
        );
      }

      return { previousLiked, previousFeed } satisfies MutationContext;
    },
    onError: (_err, _postId, context) => {
      if (!context) return;
      queryClient.setQueryData(LIKED_POSTS_KEY, context.previousLiked);
      queryClient.setQueryData(FEED_FOR_YOU_KEY, context.previousFeed);
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikePost,
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: LIKED_POSTS_KEY });
      await queryClient.cancelQueries({ queryKey: FEED_FOR_YOU_KEY });

      const previousLiked = queryClient.getQueryData<number[]>(LIKED_POSTS_KEY);
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(FEED_FOR_YOU_KEY);
      const wasLiked = previousLiked?.includes(postId) ?? false;

      queryClient.setQueryData<number[]>(LIKED_POSTS_KEY, (old) =>
        (old ?? []).filter((id) => id !== postId),
      );

      if (wasLiked) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(FEED_FOR_YOU_KEY, (old) =>
          patchFeedPostLikes(old, postId, -1),
        );
      }

      return { previousLiked, previousFeed } satisfies MutationContext;
    },
    onError: (_err, _postId, context) => {
      if (!context) return;
      queryClient.setQueryData(LIKED_POSTS_KEY, context.previousLiked);
      queryClient.setQueryData(FEED_FOR_YOU_KEY, context.previousFeed);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  return { likeMutation, unlikeMutation, deleteMutation };
}
