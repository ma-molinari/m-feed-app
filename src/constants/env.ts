import Constants from 'expo-constants';

type NativeConfig = { API_URL?: string; ENV?: string };

function readNativeConfig(): NativeConfig {
  try {
    // Available after prebuild / dev client with react-native-config linked
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Config = require('react-native-config').default as NativeConfig | undefined;
    return Config ?? {};
  } catch {
    return {};
  }
}

/** First trimmed non-empty string wins; empty native API_URL must not block Expo extra. */
function firstNonEmptyUrl(...candidates: (string | undefined)[]): string {
  for (const c of candidates) {
    const t = c?.trim();
    if (t) return t;
  }
  return '';
}

const native = readNativeConfig();
const extra = (Constants.expoConfig?.extra ?? {}) as { apiUrl?: string; imageUrl?: string };

const publicApiUrl =
  typeof process.env.EXPO_PUBLIC_API_URL === 'string' ? process.env.EXPO_PUBLIC_API_URL : undefined;

const publicImageUrl =
  typeof process.env.EXPO_PUBLIC_IMAGE_URL === 'string' ? process.env.EXPO_PUBLIC_IMAGE_URL : undefined;

const apiUrl = firstNonEmptyUrl(native.API_URL, extra.apiUrl, publicApiUrl);
const imageUrl = firstNonEmptyUrl(extra.imageUrl, publicImageUrl);

if (typeof __DEV__ !== 'undefined' && __DEV__ && !apiUrl) {
  console.warn(
    '[env] apiUrl is empty. Set EXPO_PUBLIC_API_URL in .env (restart Metro with -c after changes). On Android emulator, use http://10.0.2.2:<port> instead of localhost.',
  );
}

if (typeof __DEV__ !== 'undefined' && !__DEV__ && !apiUrl.trim()) {
  throw new Error(
    '[env] apiUrl is required in production builds. Set EXPO_PUBLIC_API_URL (see docs/INTEGRATIONS.md) or native API_URL via react-native-config.',
  );
}

export const env = {
  apiUrl,
  imageUrl,
  appEnv: native.ENV ?? (process.env.NODE_ENV === 'production' ? 'production' : 'development'),
} as const;
