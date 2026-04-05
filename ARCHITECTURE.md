# Arquitetura base (m-feed-app)

Referência alinhada ao plano de stack React Native / Expo. O app usa **Expo SDK 54** com TypeScript estrito.

## Stack

| Área            | Escolha                                                                 |
|-----------------|-------------------------------------------------------------------------|
| Linguagem       | TypeScript 5+ (`strict`, `noUncheckedIndexedAccess`)                    |
| Navegação       | React Navigation v7 com **Static API** (`createStaticNavigation`)       |
| Estado servidor | TanStack Query v5                                                       |
| Estado cliente  | Zustand + persistência via MMKV (`createMMKV`)                          |
| HTTP            | Axios (`src/services/api/client.ts`) + interceptors                     |
| KV / SQL        | MMKV (`react-native-mmkv` v4); **Expo SQLite** para dados relacionais   |
| Listas          | Shopify FlashList v2                                                    |
| Imagens         | **expo-image** (substitui `react-native-fast-image` com React 19)     |
| Ambiente        | `EXPO_PUBLIC_*` via `app.config.js` + `expo-constants`; builds nativas podem usar `react-native-config` |
| Testes          | Jest + `jest-expo` + React Native Testing Library                       |
| Lint / format   | ESLint 9 (flat config) + Prettier + Husky + lint-staged                 |
| Paths           | `babel-plugin-module-resolver` + `tsconfig` paths (`@features`, …)    |
| CI / builds     | GitHub Actions (`.github/workflows/ci.yml`) + **EAS** (`eas.json`)      |

## Pastas (`src/`)

- `features/` — módulos por domínio (`auth`, `feed`) com `components`, `screens`, `hooks`, `services`, `types`; `auth/store` reexporta o store global quando fizer sentido colocar lógica junto da feature.
- `shared/` — UI e utilitários reutilizáveis (`components`, `hooks`, `utils`, `types`).
- `navigation/` — `RootNavigator`, pilhas Auth/Main, `types` das rotas.
- `store/` — Zustand (ex.: `authStore`) e adaptador MMKV.
- `services/` — `api/client`, `queryClient`.
- `theme/` — tokens (`colors`, `spacing`, `typography`).
- `constants/` — `env` (leitura segura de variáveis).

## Fluxo de autenticação

`RootNavigator` escolhe entre `AuthNavigation` e `MainNavigation` conforme `token` em `useAuthStore`. O cliente Axios lê o token e trata `401` com `signOut`.

## Desenvolvimento

```bash
npm install
npm start
```

Variáveis: copie `.env.example` para `.env` e defina `EXPO_PUBLIC_API_URL` (lidas em `app.config.js` → `expo.extra`).

**MMKV** e **react-native-config** exigem binário nativo; use **EAS Build** ou `expo prebuild` + dev client. No Jest, MMKV e FlashList são mockados em `jest.setup.js`.

## Comandos úteis

| Comando           | Descrição              |
|-------------------|------------------------|
| `npm run lint`    | ESLint                 |
| `npm run typecheck` | `tsc --noEmit`       |
| `npm test`        | Jest                   |
| `npm run format`  | Prettier               |

Com repositório Git inicializado, `npm install` executa `prepare` e registra o hook Husky (`.husky/pre-commit` → `lint-staged`).
