# Code Conventions

## Naming Conventions

**Files:**

- React screens: `PascalCase` + `Screen` suffix — e.g. `LoginScreen.tsx`, `FeedScreen.tsx`, `RegisterScreen.tsx`
- Hooks: `camelCase` with `use` prefix — `useFeedItems.ts`
- API modules: `camelCase` — `authApi.ts`, `feedApi.ts`
- Store: `authStore.ts`, `mmkvStorage.ts`

**Functions/Methods:**

- Exported components: `PascalCase` — `LoginScreen`, `RemoteImage`, `RootNavigator`
- Hooks and helpers: `camelCase` — `useFeedItems`, `fetchFeedItems`, `readNativeConfig`
- Zustand actions: `camelCase` — `setToken`, `signOut`

**Variables:**

- React state setters: `setX` + `camelCase` value names — `emailOrUsername`, `setPassword`
- Navigation types: `*Navigation` — `LoginNavigation`, `RegisterNavigation`

**Constants:**

- Style keys and layout ratios: `SCREAMING_SNAKE` for module-level constants — `SHEET_HEIGHT_RATIO`, `PLACEHOLDER`
- Theme tokens: `camelCase` keys inside exported objects — `colors.background`, `spacing.lg`

## Code Organization

**Import/Dependency declaration:**

- External packages first (React, RN, third-party), then blank line, then internal aliases (`@theme`, `@store`, `@navigation`, relative `../`).
- Example from `LoginScreen.tsx`: `react` → `react-native` → `expo-image` / navigation / safe area → `@store`, `@theme` → `@navigation/types` → relative asset `require`.

**File structure:**

- Screens: hooks (`useState`, `useCallback`, `useMemo`) near top; component; `StyleSheet.create` at bottom in same file.
- Small feature `store` barrels re-export from global store — `src/features/auth/store/index.ts` exports `useAuthStore` from `@store/authStore`.

## Type Safety / Documentation

**Approach:** Strict TypeScript; explicit param lists for navigation (`NativeStackNavigationProp<AuthStackParamList, 'Login'>`).  
Nav param lists live in `src/navigation/types.ts` (`AuthStackParamList`, `MainStackParamList`).

**Shared utility type:** `Result<T, E>` in `src/shared/types/index.ts` (discriminated union) — available for future error handling; not heavily used in sampled files.

**Documentation:** Occasional JSDoc on modules (e.g. `authApi.ts` describes HTTP contracts); inline comments for non-obvious choices (e.g. bundled hero image eslint disable, MMKV/native config).

## Error Handling

**Pattern:** Axios errors propagate from `apiClient`; 401 handled in response interceptor (side effect: `signOut`). Callers of `fetchFeedItems` would reject on network/API errors unless wrapped.  
**MMKV:** `createMMKV` wrapped in try/catch; silent fallback to memory storage.

## Comments / Documentation

**Style:** Portuguese UI strings mixed with English marketing copy on login (`Log in.` / `Welcome back` vs `Sair` on feed). Code comments in English or Portuguese depending on file.  
**ESLint:** Targeted disables with reasons — e.g. `no-require-imports` for `react-native-config` and bundled image.
