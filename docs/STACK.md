# Tech Stack

**Analyzed:** 2026-04-01

## Core

- **Framework:** Expo ~54.0.33 (managed workflow, `expo` CLI)
- **Language:** TypeScript ~5.9.2 (strict mode, `noUncheckedIndexedAccess`)
- **Runtime:** React Native 0.81.5, React 19.1.0 (Hermes via Expo)
- **Package manager:** npm (lockfile: `package-lock.json`; `yarn.lock` also present in tree—prefer one)

## Frontend

- **UI:** React Native components, `StyleSheet.create`, feature screens under `src/features`
- **Styling:** Centralized tokens in `src/theme/` (`colors`, `spacing`, `typography`, `radii`)
- **Images:** `expo-image` (`Image`, `RemoteImage` wrapper)
- **Lists:** `@shopify/flash-list` (Feed screen)
- **State — client:** Zustand ^5 with `persist` + MMKV-backed storage (`react-native-mmkv` ^4.3.0, `react-native-nitro-modules` ^0.35.2)
- **State — server:** TanStack React Query ^5.95.2
- **Navigation:** React Navigation 7 (`@react-navigation/native`, `native-stack`), static navigators via `createStaticNavigation` / `createNativeStackNavigator`
- **Forms:** Local `useState` on screens (no dedicated form library)

## Backend

- **API style:** REST over HTTP via Axios ^1.14.1 (`src/services/api/client.ts`)
- **Database (local):** `expo-sqlite` declared in `package.json` and `app.json` plugins; **no application usage found** under `src/`

## Authentication

- **Approach:** Bearer token in Axios request interceptor; token persisted in Zustand/MMKV; 401 clears session via `signOut`
- **Login UI:** `LoginScreen` currently sets a fixed demo token (not calling `authApi`)

## Testing

- **Unit / component:** Jest ^29.7 + `jest-expo` ~54.0.0
- **RTL:** `@testing-library/react-native` ^13.3.3
- **E2E:** Not present

## External Services

- **Backend API:** Configured base URL from `expo-constants` `extra.apiUrl` and optional `react-native-config` (`API_URL`)

## Development Tools

- **Lint:** ESLint 9 flat config (`eslint.config.mjs`), TypeScript ESLint, React / React Hooks plugins, Prettier integration (`eslint-config-prettier`)
- **Format:** Prettier ^3.8.1
- **Git hooks:** Husky ^9 + `lint-staged` (ESLint + Prettier on staged files)
- **Build / submit:** EAS (`eas.json`: development, preview, production profiles)
- **Aliases:** `babel-plugin-module-resolver` + matching `tsconfig` `paths` (`@features`, `@services`, etc.)
