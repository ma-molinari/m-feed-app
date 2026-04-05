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
│   │   ├── create/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   └── services/
│   │   ├── feed/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── profile/
│   │   │   ├── hooks/
│   │   │   ├── screens/
│   │   │   ├── services/
│   │   │   └── types/
│   │   └── search/
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

_(Also: `.spec/` for product/layout specs — separate from runtime code.)_

## Module Organization

### Authentication feature

**Purpose:** Login/register UI e chamadas HTTP de auth.  
**Location:** `src/features/auth/`  
**Key files:** `screens/LoginScreen.tsx`, `screens/RegisterScreen.tsx`, `services/authApi.ts` (login/register reais), `hooks/useAuth.ts` (re-export store), `store/index.ts` (re-export `useAuthStore`)

### Feed feature

**Purpose:** Feed principal (For You), detalhes de post, comentários, likes, opções de post.  
**Location:** `src/features/feed/`  
**Key files:** `screens/FeedScreen.tsx`, `screens/PostDetailScreen.tsx`, `hooks/useFeed.ts`, `hooks/useExploreFeed.ts`, `hooks/useFeedMutations.ts`, `hooks/useLikedPosts.ts`, `hooks/usePostDetail.ts`, `hooks/useComments.ts`, `hooks/useCreateComment.ts`, `services/feedApi.ts`, `types/index.ts`  
**Components:** `PostCard.tsx`, `PostOptionsSheet.tsx`, `SkeletonCard.tsx`

### Create feature

**Purpose:** Criação e edição de posts (upload de imagem + conteúdo).  
**Location:** `src/features/create/`  
**Key files:** `screens/CreateScreen.tsx`, `screens/EditPostScreen.tsx`, `hooks/useCreatePost.ts`, `hooks/useEditPost.ts`, `services/createApi.ts`

### Profile feature

**Purpose:** Perfil próprio e de outros usuários; follow/unfollow; edição de dados e senha.  
**Location:** `src/features/profile/`  
**Key files:** `screens/ProfileScreen.tsx`, `screens/UserProfileScreen.tsx`, `hooks/useMyProfile.ts`, `hooks/useUserById.ts`, `hooks/useUserPosts.ts`, `hooks/useFollowUser.ts`, `hooks/useUpdateProfile.ts`, `hooks/useUpdatePassword.ts`, `services/profileApi.ts`, `types/index.ts`

### Search feature

**Purpose:** Busca de usuários por texto e sugestões.  
**Location:** `src/features/search/`  
**Key files:** `screens/SearchScreen.tsx`, `hooks/useUserSearch.ts`, `hooks/useUserSuggestions.ts`, `services/searchApi.ts`, `types/index.ts`

### Navigation

**Purpose:** Roteamento auth vs app, stack modal e tab bar.  
**Location:** `src/navigation/`  
**Key files:** `RootNavigator.tsx`, `AuthNavigator.tsx`, `MainNavigator.tsx` (stack modal sobre tabs), `TabNavigator.tsx` (Home / Search / Create / Profile), `MainAppShell.tsx` (wrapper com safe area + fundo escuro), `screenTopInset.tsx`, `types.ts`

### Services & store

**Purpose:** HTTP client, React Query defaults, auth persistida.  
**Location:** `src/services/`, `src/store/`  
**Key files:** `api/client.ts`, `api/errors.ts`, `queryClient.ts`, `authStore.ts`, `mmkvStorage.ts`

### Theme & shared UI

**Purpose:** Design tokens e componentes reutilizáveis.  
**Location:** `src/theme/`, `src/shared/`  
**Key files:** `colors.ts`, `spacing.ts`, `typography.ts`, `radii.ts`, `components/RemoteImage.tsx`

## Where Things Live

**REST API client:**

- Configuração: `src/constants/env.ts` (lê Expo `extra` + opcional `react-native-config`)
- Instância + interceptors: `src/services/api/client.ts`
- Erros tipados: `src/services/api/errors.ts`

**Authentication token + user:**

- Store: `src/store/authStore.ts` — `token` e `user` (tipo `AuthUser`)
- Adapter de persistência: `src/store/mmkvStorage.ts`

**Bottom tab navigation:**

- Tab bar: `src/navigation/TabNavigator.tsx` (4 abas: Home, Search, Create, Profile)
- Stack modal: `src/navigation/MainNavigator.tsx` (PostDetail, EditPost, UserProfile sobre os tabs)
- Shell: `src/navigation/MainAppShell.tsx` (safe area + cor de fundo)

**Environment-specific app config:**

- Expo: `app.config.js` (`extra.apiUrl`), `app.json` (plugins, native ids)

## Special Directories

**`__tests__/`**

**Purpose:** Testes Jest co-localizados na raiz (não dentro de `src/`).  
**Examples:** `LoginScreen.test.tsx`, `App.test.tsx`

**`coverage/`**

**Purpose:** Output de cobertura do Jest gerado pelo `test:ci` (geralmente gitignored).

**`.spec/`**

**Purpose:** Especificações e layouts de referência do produto — não importados pelo bundle do app.
