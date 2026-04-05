# Tech Stack

**Analyzed:** 2026-04-05

## Core

- **Framework:** Expo ~54.0.33 (managed workflow, `expo` CLI)
- **Language:** TypeScript ~5.9.2 (strict mode, `noUncheckedIndexedAccess`)
- **Runtime:** React Native 0.81.5, React 19.1.0 (Hermes via Expo)
- **Package manager:** npm (lockfile: `package-lock.json`; `yarn.lock` também presente — preferir um só)

## Frontend

- **UI:** React Native components, `StyleSheet.create`, feature screens em `src/features`
- **Styling:** Tokens centralizados em `src/theme/` (`colors`, `spacing`, `typography`, `radii`)
- **Ícones:** `@expo/vector-icons` ^15.1.1 (Ionicons na tab bar)
- **Imagens:** `expo-image` ~3.0.11 (`Image`, wrapper `RemoteImage`)
- **Seleção de mídia:** `expo-image-picker` ~17.0.10 (criação de posts)
- **Listas:** `@shopify/flash-list` ^2.3.1 (FeedScreen, PostDetailScreen)
- **State — client:** Zustand ^5.0.12 com `persist` + MMKV-backed storage (`react-native-mmkv` ^4.3.0, `react-native-nitro-modules` ^0.35.2)
- **State — server:** TanStack React Query ^5.95.2
- **Navigation:** React Navigation 7 (`@react-navigation/native` ^7.2.2, `native-stack` ^7.14.10, `bottom-tabs` ^7.15.9); static navigators via `createStaticNavigation`
- **Forms:** `useState` local nas screens (sem biblioteca de formulários dedicada)

## Backend

- **API style:** REST sobre HTTP via Axios ^1.14.0 (`src/services/api/client.ts`)
- **Database (local):** `expo-sqlite` ~16.0.10 declarado em `package.json` e `app.json`; **sem uso em `src/`**

## Authentication

- **Approach:** Bearer token em interceptor Axios; token + user persistidos em Zustand/MMKV; 401 limpa sessão via `signOut`
- **Login/Register:** Chamadas reais à API via `authApi.login` / `authApi.register`; `skipGlobal401Handler: true` evita logout em 401 durante auth

## Testing

- **Unit / component:** Jest ^29.7 + `jest-expo` ~54.0.0
- **RTL:** `@testing-library/react-native` ^13.3.3
- **E2E:** Não presente

## External Services

- **Backend API:** Base URL configurada via `expo-constants` `extra.apiUrl` e opcional `react-native-config` (`API_URL`)

## Development Tools

- **Lint:** ESLint 9 flat config (`eslint.config.mjs`), TypeScript ESLint, plugins React / React Hooks, Prettier integration (`eslint-config-prettier`)
- **Format:** Prettier ^3.8.1
- **Git hooks:** Husky ^9 + `lint-staged` (ESLint + Prettier em staged files)
- **Build / submit:** EAS (`eas.json`: development, preview, production profiles)
- **Aliases:** `babel-plugin-module-resolver` ^5.0.3 + `tsconfig` `paths` (`@features`, `@services`, `@store`, `@theme`, `@navigation`)
