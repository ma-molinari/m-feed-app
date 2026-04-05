# Code Conventions

## Naming Conventions

**Files:**

- React screens: `PascalCase` + sufixo `Screen` — ex: `LoginScreen.tsx`, `FeedScreen.tsx`, `PostDetailScreen.tsx`, `UserProfileScreen.tsx`
- Hooks: `camelCase` com prefixo `use` — `useFeed.ts`, `useFeedMutations.ts`, `useMyProfile.ts`, `useFollowUser.ts`
- Módulos de API: `camelCase` — `authApi.ts`, `feedApi.ts`, `createApi.ts`, `profileApi.ts`, `searchApi.ts`
- Store: `authStore.ts`, `mmkvStorage.ts`

**Functions/Methods:**

- Componentes exportados: `PascalCase` — `FeedScreen`, `PostCard`, `RemoteImage`, `MainAppShell`
- Hooks e helpers: `camelCase` — `useFeed`, `fetchFeed`, `useCreatePost`, `readNativeConfig`
- Actions do Zustand: `camelCase` — `setSession`, `signOut`

**Variables:**

- State setters do React: `setX` + nomes `camelCase` — `emailOrUsername`, `setPassword`, `setIsLoading`
- Tipos de navegação: `*Navigation` — `LoginNavigation`, `RegisterNavigation`

**Constants:**

- Constantes de módulo: `SCREAMING_SNAKE` — `FEED_PAGE_SIZE`, `FEED_FOR_YOU_KEY`, `LIKED_POSTS_KEY`
- Tokens de tema: chaves `camelCase` dentro de objetos exportados — `colors.dark.background`, `spacing.lg`

## Code Organization

**Import/Dependency declaration:**

- Pacotes externos primeiro (React, RN, terceiros), depois linha em branco, depois aliases internos (`@theme`, `@store`, `@features`, relativos `../`).
- Exemplo em `FeedScreen.tsx`: `react` → `@tanstack/react-query` → `@shopify/flash-list` → `@features/feed/…` → `@theme/…`

**File structure:**

- Screens: hooks (`useState`, `useCallback`, `useMemo`, React Query) perto do topo; componente retornado; `StyleSheet.create` ao final no mesmo arquivo.
- Hooks de mutation: `useMutation` com `onMutate`/`onError` para optimistic updates; lógica de rollback encapsulada.
- Pequenos barrels de feature `store/index.ts` re-exportam do store global — `src/features/auth/store/index.ts` exporta `useAuthStore` de `@store/authStore`.

**Auth — onde importar:** prefira `@store/authStore` para `useAuthStore`, `setSession` e `signOut`. O barrel `@features/auth/store` e o hook `useAuth` (`@features/auth/hooks/useAuth`) apenas re-exportam o mesmo store; use um estilo consistente em código novo (import direto do `@store/authStore` é o mais explícito). Não há migração em lote obrigatória dos imports antigos.

## Type Safety / Documentation

**Approach:** TypeScript estrito; listas de params de navegação em `src/navigation/types.ts`.  
Envelopes de API tipados localmente por feature (ex: `type ApiEnvelope<T> = { data: T }` em `feedApi.ts` e `profileApi.ts`).

**Tipo de auth:** `AuthUser` definido em `src/features/auth/types/index.ts`; armazenado tanto no `authStore` quanto retornado pela API de login.

**Shared utility type:** `Result<T, E>` em `src/shared/types/index.ts` (union discriminada) — disponível mas não amplamente utilizado nos arquivos amostrados.

**Documentation:** JSDoc ocasional em módulos (ex: `authApi.ts` descreve contratos HTTP); comentários inline para escolhas não óbvias (ex: `skipGlobal401Handler`, fallback MMKV).

## Error Handling

**Pattern:** Erros Axios propagam de `apiClient`; 401 tratado no interceptor de response (efeito colateral: `signOut`). Requests de auth passam `skipGlobal401Handler: true` para não ser interceptados.  
**Mutations:** `onError` de `useMutation` reverte snapshot do cache (ex: `useFeedMutations`).  
**MMKV:** `createMMKV` dentro de try/catch; fallback silencioso para storage in-memory.

## Comments / Documentation

**Style:** Strings de UI em português; comentários de código em inglês ou português dependendo do arquivo. Sem regra estrita de língua única.  
**ESLint:** Disables pontuais com razão — ex: `no-require-imports` para `react-native-config` e imagem bundled.
