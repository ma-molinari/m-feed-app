export type { PostWithAuthor } from '@features/feed/types';

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  fullName: string;
  bio: string | null;
  avatar: string | null;
  createdAt: string;
  updatedAt: string;
  followers: number;
  following: number;
  posts: number;
};
