# Testing Infrastructure

## Test Frameworks

**Unit / component:** Jest ^29.7 with `jest-expo` ~54.0.0 preset  
**E2E:** Not configured  
**Coverage:** Jest `collectCoverageFrom`: `src/**/*.{ts,tsx}` (see `jest.config.js`); script `test:ci` runs `jest --ci --coverage`

## Test Organization

**Location:** `__tests__/` at repository root  
**Naming:** `*.test.ts` / `*.test.tsx`  
**Structure:** One file per major surface area sampled so far (`LoginScreen`, `QueryClientProvider` smoke)

## Testing Patterns

### Component tests

**Approach:** `@testing-library/react-native` with targeted `jest.mock` for navigation and Zustand selectors.  
**Location:** `__tests__/LoginScreen.test.tsx`  
**Description:** Wraps `LoginScreen` in `SafeAreaProvider` with fixed `initialMetrics`; asserts copy, Sign up → `navigate('Register')`, Submit → `setToken('demo-token')`.

### Provider smoke test

**Approach:** Minimal render under `QueryClientProvider` using the same `queryClient` instance as the app.  
**Location:** `__tests__/App.test.tsx`  
**Description:** Confirms children render — validates the provider wiring pattern from `App.tsx`.

### Global Jest setup mocks

**Approach:** `jest.setup.js` mocks native-heavy modules for Jest/Node environment.  
**Location:** `jest.setup.js`  
**Contents:** `react-native-mmkv` factory mock; `@shopify/flash-list` → RN `FlatList`; `expo-image` → simple `View` stub.

## Test Execution

**Commands:**

- `npm test` — local Jest
- `npm run test:ci` — CI mode with coverage

**Configuration:** `jest.config.js` — `testMatch: ['**/__tests__/**/*.test.[jt]s?(x)']`, `setupFilesAfterEnv: ['<rootDir>/jest.setup.js']`

## Coverage Targets

**Current:** No documented numeric target in repo.  
**Goals:** Not specified in source.  
**Enforcement:** Coverage artifacts produced by `test:ci`; no threshold enforcement observed in `jest.config.js`.

## Gaps (evidence-based)

- No tests for `apiClient`, `RootNavigator`, `FeedScreen`, or `fetchFeedItems`.
- Navigation and auth store are mocked in login tests; integration between real persist layer and screens is not covered.
