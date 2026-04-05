import 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** When true, 401 responses do not trigger global `signOut` (e.g. login). */
    skipGlobal401Handler?: boolean;
  }
}
