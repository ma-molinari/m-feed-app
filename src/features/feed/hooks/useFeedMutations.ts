import { useCallback, useEffect, useRef } from 'react';
import { type InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';

import { feedKeys, userPostsQueryKey } from '../queryKeys';
import type { FeedPage, PostWithAuthor } from '../types';
import { deletePost, likePost, unlikePost } from '../services/feedApi';

type MutationContext = {
  previousLiked: number[] | undefined;
  previousFeed: InfiniteData<FeedPage> | undefined;
  previousPost: PostWithAuthor | undefined;
};

function patchPostDetailLikes(
  old: PostWithAuthor | undefined,
  postId: number,
  delta: number,
): PostWithAuthor | undefined {
  if (!old || old.id !== postId) return old;
  return {
    ...old,
    total_likes: Math.max(0, (old.total_likes ?? 0) + delta),
  };
}

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
      await queryClient.cancelQueries({ queryKey: feedKeys.likedPosts() });
      await queryClient.cancelQueries({ queryKey: feedKeys.forYou() });
      await queryClient.cancelQueries({ queryKey: feedKeys.post(postId) });

      const previousLiked = queryClient.getQueryData<number[]>(feedKeys.likedPosts());
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(feedKeys.forYou());
      const previousPost = queryClient.getQueryData<PostWithAuthor>(feedKeys.post(postId));
      const wasLiked = previousLiked?.includes(postId) ?? false;

      queryClient.setQueryData<number[]>(feedKeys.likedPosts(), (old) => {
        const next = new Set(old ?? []);
        next.add(postId);
        return [...next];
      });

      if (!wasLiked) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(feedKeys.forYou(), (old) =>
          patchFeedPostLikes(old, postId, 1),
        );
        queryClient.setQueryData<PostWithAuthor>(feedKeys.post(postId), (old) =>
          patchPostDetailLikes(old, postId, 1),
        );
      }

      return { previousLiked, previousFeed, previousPost } satisfies MutationContext;
    },
    onError: (_err, postId, context) => {
      if (!context) return;
      queryClient.setQueryData(feedKeys.likedPosts(), context.previousLiked);
      queryClient.setQueryData(feedKeys.forYou(), context.previousFeed);
      queryClient.setQueryData(feedKeys.post(postId), context.previousPost);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.forYou() });
      void queryClient.invalidateQueries({ queryKey: feedKeys.explore() });
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikePost,
    onMutate: async (postId: number) => {
      await queryClient.cancelQueries({ queryKey: feedKeys.likedPosts() });
      await queryClient.cancelQueries({ queryKey: feedKeys.forYou() });
      await queryClient.cancelQueries({ queryKey: feedKeys.post(postId) });

      const previousLiked = queryClient.getQueryData<number[]>(feedKeys.likedPosts());
      const previousFeed = queryClient.getQueryData<InfiniteData<FeedPage>>(feedKeys.forYou());
      const previousPost = queryClient.getQueryData<PostWithAuthor>(feedKeys.post(postId));
      const wasLiked = previousLiked?.includes(postId) ?? false;

      queryClient.setQueryData<number[]>(feedKeys.likedPosts(), (old) =>
        (old ?? []).filter((id) => id !== postId),
      );

      if (wasLiked) {
        queryClient.setQueryData<InfiniteData<FeedPage>>(feedKeys.forYou(), (old) =>
          patchFeedPostLikes(old, postId, -1),
        );
        queryClient.setQueryData<PostWithAuthor>(feedKeys.post(postId), (old) =>
          patchPostDetailLikes(old, postId, -1),
        );
      }

      return { previousLiked, previousFeed, previousPost } satisfies MutationContext;
    },
    onError: (_err, postId, context) => {
      if (!context) return;
      queryClient.setQueryData(feedKeys.likedPosts(), context.previousLiked);
      queryClient.setQueryData(feedKeys.forYou(), context.previousFeed);
      queryClient.setQueryData(feedKeys.post(postId), context.previousPost);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: feedKeys.forYou() });
      void queryClient.invalidateQueries({ queryKey: feedKeys.explore() });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: (_data, postId) => {
      const cached = queryClient.getQueryData<PostWithAuthor>(feedKeys.post(postId));
      const authorId = cached?.userId;
      queryClient.invalidateQueries({ queryKey: feedKeys.root });
      queryClient.invalidateQueries({ queryKey: feedKeys.post(postId) });
      if (authorId != null) {
        queryClient.invalidateQueries({ queryKey: userPostsQueryKey(authorId) });
      }
    },
  });

  const likeMutRef = useRef(likeMutation);
  const unlikeMutRef = useRef(unlikeMutation);
  useEffect(() => {
    likeMutRef.current = likeMutation;
    unlikeMutRef.current = unlikeMutation;
  });

  /**
   * P1-6: while like/unlike is in flight, ignore further taps so optimistic counts and server state stay aligned.
   */
  const likePostStable = useCallback((postId: number) => {
    const l = likeMutRef.current;
    const u = unlikeMutRef.current;
    if (l.isPending || u.isPending) return;
    l.mutate(postId);
  }, []);

  const unlikePostStable = useCallback((postId: number) => {
    const l = likeMutRef.current;
    const u = unlikeMutRef.current;
    if (l.isPending || u.isPending) return;
    u.mutate(postId);
  }, []);

  return {
    likeMutation,
    unlikeMutation,
    likePost: likePostStable,
    unlikePost: unlikePostStable,
    deleteMutation,
  };
}
