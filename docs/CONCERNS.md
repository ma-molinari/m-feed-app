# Concerns

Evidence-backed risks and gaps; omitting items without a clear code or config trail.

## High — Authentication is not backed by the API

**Evidence:** `LoginScreen.tsx` `onSubmit` calls `setToken('demo-token')` only; `authApi.ts` defines `LoginPayload` / `LoginResponse` but has no `apiClient` calls.  
**Impact:** Any real backend expecting JWT exchange is bypassed; token shape and expiry are not validated.  
**Fix:** Implement `login(payload)` in `authApi.ts`, call it from `LoginScreen` (or a dedicated hook), handle errors, and persist the returned token.

## High — Feed query disabled and UI disconnected from API

**Evidence:** `useFeedItems.ts` sets `enabled: false`; `FeedScreen.tsx` uses `const PLACEHOLDER: Row[] = []` and never imports `useFeedItems` or `fetchFeedItems`.  
**Impact:** Users always see an empty list despite `feedApi.ts` being ready for `GET /feed`.  
**Fix:** Enable the query when appropriate (e.g. when `apiUrl` and token exist), map `FeedItem` (`imageUrl`) to list rows, and wire `FlashList` `data` to query results with loading/error states.

## Medium — Unused native dependency (expo-sqlite)

**Evidence:** `expo-sqlite` in `package.json` and `app.json` `plugins`; no usage in `src/`.  
**Impact:** Larger binary / native surface area and maintenance cost without benefit; confuses readers about data layer.  
**Fix:** Remove plugin and dependency until a local DB is required, or implement the planned persistence and document it.

## Medium — Dual lockfiles

**Evidence:** Both `package-lock.json` and `yarn.lock` appear in the project tree.  
**Impact:** Inconsistent installs across machines and CI.  
**Fix:** Choose npm or Yarn, delete the other lockfile, and document the choice in team onboarding (no new markdown required if you prefer to only fix the repo).

## Low — `useAuth` hook is a pass-through

**Evidence:** `src/features/auth/hooks/useAuth.ts` only re-exports `useAuthStore`.  
**Impact:** Minor indirection; could hide future auth logic if not expanded.  
**Fix:** Either fold callers to `@store/authStore` or grow the hook with login/logout API orchestration.

## Low — Test coverage scope

**Evidence:** Only `__tests__/LoginScreen.test.tsx` and `__tests__/App.test.tsx`; no coverage for navigators, `apiClient`, or feed.  
**Impact:** Regressions in auth gating or HTTP behavior may go unnoticed.  
**Fix:** Add integration-style tests with MSW or mocked Axios for `fetchFeedItems` and 401 handling; shallow tests for `RootNavigator` branching.

## Low — Environment empty string base URL

**Evidence:** `apiClient` uses `baseURL: env.apiUrl || undefined`; misconfiguration yields relative URLs or failed requests depending on platform.  
**Impact:** Subtle runtime failures if `EXPO_PUBLIC_API_URL` / native config is missing.  
**Fix:** Optional dev-only assertion or startup log when `apiUrl` is empty in non-test builds.
