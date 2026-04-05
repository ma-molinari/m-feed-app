export type PostAuthorSnippet = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
};

export type PostWithAuthor = {
  id: number;
  userId: number;
  content: string | null;
  image: string;
  createdAt: string;
  updatedAt: string;
  user: PostAuthorSnippet;
  total_likes?: number;
  total_comments?: number;
};

export type FeedPage = { ct: number; data: PostWithAuthor[] };
