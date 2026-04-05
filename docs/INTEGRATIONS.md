# External Integrations

## Backend REST API

**Service:** Application backend (URL-configurable)  
**Purpose:** Authentication (`POST /public/login`, `POST /public/register`), personalized feed (`GET /api/posts/feed`), likes (`GET /api/users/me/liked-posts`, `POST /api/posts/like`, `POST /api/posts/unlike`), and post deletion (`DELETE /api/posts/:id`).  
**Implementation:**

- HTTP client: `src/services/api/client.ts` (Axios, 15s timeout, JSON headers)
- Feed + likes + delete: `src/features/feed/services/feedApi.ts` — responses use `{ data: … }` envelopes where applicable (aligned with login)

**Configuration:**

- `app.config.js` exposes `extra.apiUrl` from `process.env.EXPO_PUBLIC_API_URL` (fallback `''`)
- `src/constants/env.ts` resolves `env.apiUrl` as: `native.API_URL` (react-native-config) → `extra.apiUrl` → `''`

**Authentication:** Bearer token header from `useAuthStore.getState().token`; 401 responses trigger `signOut()`.

**Note:** Login is implemented in `authApi.login` → `POST /public/login`; registration in `authApi.register` → `POST /public/register` (201, no session). JWT and user are persisted via `useAuthStore` (MMKV). Requests with `skipGlobal401Handler` (login/register) do not trigger interceptor `signOut` on 401.

## Expo Application Services

**Service:** Expo / EAS  
**Purpose:** Build and release pipelines.  
**Implementation:** `eas.json` profiles (`development` with dev client, `preview`, `production` with `autoIncrement`).  
**Configuration:** `app.json` / `app.config.js` for app metadata, icons, splash, new architecture flag.

## Local persistence

**Service:** MMKV (via `react-native-mmkv` + Nitro modules)  
**Purpose:** Fast storage for Zustand persist (auth token).  
**Implementation:** `src/store/mmkvStorage.ts` — instance id `app-storage`; in-memory fallback if native module unavailable.

**Service:** react-native-config (optional native)  
**Purpose:** `API_URL` / `ENV` in dev client / prebuild scenarios.  
**Implementation:** Dynamic `require` in `env.ts` with try/catch when module missing (e.g. Expo Go).

## Media & UI libraries

**Service:** expo-image  
**Purpose:** Cached images, login hero and `RemoteImage`.  
**Implementation:** `LoginScreen` bundled asset; `src/shared/components/RemoteImage.tsx`.

**Service:** @shopify/flash-list  
**Purpose:** Virtualized feed list.  
**Implementation:** `FeedScreen.tsx`.

## Declared but unused in application code

**Service:** expo-sqlite  
**Purpose:** Local SQL database (typical offline/cache use cases).  
**Configuration:** Listed in `package.json` dependencies and `app.json` → `expo.plugins`.  
**Implementation:** No imports under `src/` at time of analysis — integration is **declared only**.

## API Integrations (summary)

| Area        | Location                         | Auth              | Endpoints used |
|------------|-----------------------------------|-------------------|----------------|
| Feed       | `feed/services/feedApi.ts`       | Bearer            | `GET /api/posts/feed`, `GET /api/users/me/liked-posts`, `POST /api/posts/like`, `POST /api/posts/unlike`, `DELETE /api/posts/:id` |
| Auth (API) | `auth/services/authApi.ts`       | N/A on login/register | `POST /public/login`, `POST /public/register` |

## Webhooks

None identified in this repository (mobile client only).

## Background Jobs

None identified; no queue or task runner in `package.json` dependencies beyond the app runtime.
