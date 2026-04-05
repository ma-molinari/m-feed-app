/** Subset returned by `POST /public/login` (`user` in envelope). */
export type AuthUser = {
  id: number;
  email: string;
  username: string;
  fullName: string;
};
