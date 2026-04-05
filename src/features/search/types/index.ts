export type UserSearchItem = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
};

export type SuggestionUser = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
  _count: { posts: number };
};
