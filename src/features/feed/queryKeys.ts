/** Centralized React Query keys for feed, post detail, comments, and profile post grids. */

export const feedKeys = {
  root: ['feed'] as const,
  forYou: () => ['feed', 'foryou'] as const,
  explore: () => ['feed', 'explore'] as const,
  likedPosts: () => ['feed', 'likedPosts'] as const,
  post: (id: number) => ['post', id] as const,
  comments: (postId: number) => ['comments', postId] as const,
};

/** Must match `useUserPosts` — used to invalidate grids after delete. */
export function userPostsQueryKey(userId: number) {
  return ['users', userId, 'posts'] as const;
}
