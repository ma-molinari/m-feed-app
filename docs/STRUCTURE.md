# Project Structure

**Root:** Repository root of the `m-feed-app` project (where `package.json` and `App.tsx` live).

## Directory Tree

Max depth ~3 (representative):

```text
m-feed-app/
├── App.tsx
├── index.ts
├── app.json
├── app.config.js
├── eas.json
├── assets/
│   └── images/
├── src/
│   ├── constants/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   ├── store/
│   │   │   └── types/
│   │   └── feed/
│   │       ├── hooks/
│   │       ├── screens/
│   │       ├── services/
│   │       └── types/
│   ├── navigation/
│   ├── services/
│   │   └── api/
│   ├── shared/
│   │   └── components/
│   ├── store/
│   └── theme/
├── __tests__/
├── scripts/
└── docs/          # brownfield mapping (this folder)
```

*(Also: `.spec/` for product/layout specs — separate from runtime code.)*

## Module Organization

### Authentication feature

**Purpose:** Login/register UI and auth-related API types.  
**Location:** `src/features/auth/`  
**Key files:** `screens/LoginScreen.tsx`, `screens/RegisterScreen.tsx`, `services/authApi.ts` (types only today), `hooks/useAuth.ts` (re-export store)

### Feed feature

**Purpose:** Main feed list and feed API hook.  
**Location:** `src/features/feed/`  
**Key files:** `screens/FeedScreen.tsx`, `hooks/useFeedItems.ts`, `services/feedApi.ts`, `types/index.ts`

### Navigation

**Purpose:** Auth vs main stacks and param list types.  
**Location:** `src/navigation/`  
**Key files:** `RootNavigator.tsx`, `AuthNavigator.tsx`, `MainNavigator.tsx`, `types.ts`

### Services & store

**Purpose:** HTTP client, React Query defaults, persisted auth.  
**Location:** `src/services/`, `src/store/`  
**Key files:** `api/client.ts`, `queryClient.ts`, `authStore.ts`, `mmkvStorage.ts`

### Theme & shared UI

**Purpose:** Design tokens and reusable components.  
**Location:** `src/theme/`, `src/shared/`  
**Key files:** `colors.ts`, `spacing.ts`, `typography.ts`, `components/RemoteImage.tsx`

## Where Things Live

**REST API client:**

- Configuration: `src/constants/env.ts` (reads Expo `extra` + optional `react-native-config`)
- Instance + interceptors: `src/services/api/client.ts`

**Authentication token:**

- Store: `src/store/authStore.ts`
- Persistence adapter: `src/store/mmkvStorage.ts`

**Environment-specific app config:**

- Expo: `app.config.js` (`extra.apiUrl`), `app.json` (plugins, native ids)

## Special Directories

**`__tests__/`**

**Purpose:** Jest tests co-located at repo root (not inside `src/`).  
**Examples:** `LoginScreen.test.tsx`, `App.test.tsx`

**`coverage/`**

**Purpose:** Generated Jest coverage output (gitignored in typical workflows; may exist locally after `test:ci`).

**`.spec/`**

**Purpose:** Specifications and reference layouts for the product — not imported by the app bundle.
