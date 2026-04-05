# M-Feed App — Design de Arquitetura

**Spec:** `.specs/features/m-feed-app/spec.md`  
**Status:** Pronto para Tasks

---

## Visão Geral

O app já possui a estrutura base correta (`features/`, `navigation/`, `services/`, `store/`,
`theme/`). O design consiste em **expandir** os módulos existentes e **criar** os módulos
faltantes seguindo os padrões já estabelecidos. Nenhuma mudança de arquitetura é necessária.

---

## 1. Estrutura de Módulos (alvo)

```text
src/
├── features/
│   ├── auth/                      # ✏️ Expandir
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx    # ✏️ Conectar à API real
│   │   │   └── RegisterScreen.tsx # ✏️ Conectar à API real
│   │   ├── hooks/
│   │   │   └── useAuth.ts         # ✏️ Expandir com login/logout/register
│   │   ├── services/
│   │   │   └── authApi.ts         # ✏️ Implementar chamadas reais
│   │   └── types/
│   ├── feed/                      # ✏️ Expandir
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx     # ✏️ Conectar queries + tabs For You/Explore
│   │   │   └── PostDetailScreen.tsx # 🆕 Novo
│   │   ├── hooks/
│   │   │   ├── useFeedItems.ts    # ✏️ Habilitar + adaptar para paginação infinita
│   │   │   ├── useExploreFeed.ts  # 🆕 GET /api/posts/explore
│   │   │   ├── usePostDetail.ts   # 🆕 GET /api/posts/:id
│   │   │   ├── useComments.ts     # 🆕 GET /api/posts/:postId/comments
│   │   │   └── useLikePost.ts     # 🆕 POST /api/posts/like|unlike
│   │   ├── services/
│   │   │   └── feedApi.ts         # ✏️ Expandir com explore, detail, comments, likes
│   │   ├── components/
│   │   │   ├── PostCard.tsx       # 🆕 Card reutilizável do post
│   │   │   ├── PostOptionSheet.tsx # 🆕 Bottom sheet de opções
│   │   │   └── CommentItem.tsx    # 🆕 Item de comentário
│   │   └── types/
│   ├── search/                    # 🆕 Novo módulo
│   │   ├── screens/
│   │   │   └── SearchScreen.tsx
│   │   ├── hooks/
│   │   │   ├── useUserSearch.ts   # GET /api/users/search
│   │   │   └── useUserSuggestions.ts # GET /api/users/suggestions
│   │   ├── services/
│   │   │   └── searchApi.ts
│   │   └── types/
│   ├── post/                      # 🆕 Novo módulo (create + edit)
│   │   ├── screens/
│   │   │   └── CreatePostScreen.tsx # create e edit mode via parâmetro postId?
│   │   ├── hooks/
│   │   │   ├── useCreatePost.ts   # POST /api/posts
│   │   │   ├── useEditPost.ts     # PUT /api/posts/:id
│   │   │   └── useUploadFile.ts   # POST /api/file/upload
│   │   ├── services/
│   │   │   └── postApi.ts
│   │   └── types/
│   └── profile/                   # 🆕 Novo módulo
│       ├── screens/
│       │   ├── ProfileScreen.tsx  # próprio + alheio (modo por parâmetro userId?)
│       │   ├── EditProfileScreen.tsx
│       │   └── EditPasswordScreen.tsx
│       ├── hooks/
│       │   ├── useProfile.ts      # GET /api/users/me | /api/users/:id
│       │   ├── useUserPosts.ts    # GET /api/users/:id/posts
│       │   ├── useFollowUser.ts   # POST /api/users/follow|unfollow
│       │   ├── useEditProfile.ts  # PUT /api/users/profile
│       │   └── useEditPassword.ts # PATCH /api/users/password
│       ├── services/
│       │   └── profileApi.ts
│       └── types/
├── navigation/
│   ├── RootNavigator.tsx          # sem mudança
│   ├── AuthNavigator.tsx          # sem mudança
│   ├── MainNavigator.tsx          # ✏️ Substituir stack por bottom tabs
│   └── types.ts                   # ✏️ Adicionar params das novas telas
├── services/
│   └── api/
│       ├── client.ts              # sem mudança
│       └── errors.ts              # 🆕 handleApiError — mapeia status → mensagem legível
├── store/
│   └── authStore.ts               # ✏️ Adicionar user data (id, username, fullName, avatar)
├── theme/                         # sem mudança (tokens já definidos)
└── shared/components/
    ├── RemoteImage.tsx             # sem mudança
    ├── SkeletonCard.tsx            # 🆕 Bloco skeleton reutilizável com animação shimmer
    ├── BottomSheet.tsx             # 🆕 Wrapper de modal/bottom sheet reutilizável
    ├── UserListItem.tsx            # 🆕 Linha de usuário (avatar + nome + handle)
    └── InfiniteList.tsx            # 🆕 FlashList com scroll infinito e skeleton integrado
```

---

## 2. Navegação

### Estrutura atual

```
RootNavigator
├── AuthNavigation (stack): Login, Register
└── MainNavigation (stack): Feed (único)
```

### Estrutura alvo

```
RootNavigator
├── AuthNavigation (stack): Login, Register
└── MainNavigation (bottom tabs):
    ├── Tab Home    → stack: HomeScreen → PostDetailScreen
    ├── Tab Search  → stack: SearchScreen → ProfileScreen (alheio)
    ├── Tab Create  → CreatePostScreen (parâmetro postId? para modo edição)
    └── Tab Profile → stack: ProfileScreen (próprio) → EditProfileScreen, EditPasswordScreen
```

**Decisões:**

- `MainNavigator` migra de `createNativeStackNavigator` para `createBottomTabNavigator`
- Cada tab com sub-navegação usa stack aninhado para manter back-button funcional
- `ProfileScreen` recebe `userId?: number`; ausente → `GET /api/users/me`; presente → `GET /api/users/:id`
- `CreatePostScreen` recebe `postId?: number`; presente → modo edição com dados pré-preenchidos

### Tipagem de navegação (`types.ts` — adições)

```typescript
type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Create: { postId?: number };
  Profile: { userId?: number };
};

type HomeStackParamList = {
  Feed: undefined;
  PostDetail: { postId: number };
};

type SearchStackParamList = {
  Search: undefined;
  UserProfile: { userId: number };
};

type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  EditPassword: undefined;
};
```

---

## 3. Estado Global — authStore

**Mudança:** além do `token`, persistir dados mínimos do `user` para:
- Identificar o owner de posts (exibir Delete/Edit no bottom sheet sem chamada extra)
- Disponibilizar `userId` para query keys de perfil

```typescript
type AuthUser = {
  id: number;
  username: string;
  fullName: string;
  avatar: string | null;
};

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string) => void;
  setUser: (user: AuthUser) => void;
  signOut: () => void;
};
// partialize para persistência: { token, user }
```

---

## 4. React Query — Query Keys & Cache

### Query Keys centralizados

```typescript
// src/services/api/queryKeys.ts  (🆕)
export const queryKeys = {
  feed:        () => ['feed', 'for-you'] as const,
  explore:     () => ['feed', 'explore'] as const,
  post:        (id: number) => ['post', id] as const,
  comments:    (postId: number) => ['post', postId, 'comments'] as const,
  likedPosts:  () => ['liked-posts'] as const,
  profile:     (userId: number | 'me') => ['profile', userId] as const,
  userPosts:   (userId: number) => ['profile', userId, 'posts'] as const,
  search:      (query: string) => ['search', 'users', query] as const,
  suggestions: () => ['search', 'suggestions'] as const,
};
```

### Estratégia de invalidação após mutações

| Mutação | Invalida |
|---|---|
| `POST /api/posts` (create) | `queryKeys.feed()` |
| `PUT /api/posts/:id` (edit) | `queryKeys.post(id)` + `queryKeys.feed()` |
| `DELETE /api/posts/:id` | `queryKeys.feed()` + `queryKeys.userPosts(userId)` |
| `POST /api/posts/like\|unlike` | optimistic update local; `queryKeys.likedPosts()` no settle |
| `POST /api/users/follow\|unfollow` | `queryKeys.feed()` + `queryKeys.profile(userId)` |
| `PUT /api/users/profile` | `queryKeys.profile('me')` |
| `PATCH /api/users/password` | nenhuma query — apenas feedback de sucesso |

### Paginação com `useInfiniteQuery`

```typescript
// padrão aplicado em: useFeedItems, useExploreFeed, useComments, useUserPosts
useInfiniteQuery({
  queryKey: queryKeys.feed(),
  queryFn: ({ pageParam }) => fetchFeed({ page: pageParam, limit: 10 }),
  initialPageParam: 0,
  getNextPageParam: (lastPage, allPages) =>
    lastPage.data.data.length < 10 ? undefined : allPages.length,
});
```

---

## 5. Padrões de Implementação

### Service layer (por feature)

```typescript
// Exemplo: feedApi.ts
export const fetchFeed = ({ page = 0, limit = 10 }) =>
  apiClient.get<{ ct: number; data: PostWithAuthor[] }>('/api/posts/feed', {
    params: { page, limit },
  });
```

### Optimistic update — like/unlike

`useLikePost` usa `useMutation` com:
- `onMutate`: atualiza o cache do post localmente (toggle estado liked + contador)
- `onError`: rollback para o valor anterior
- `onSettled`: invalida `queryKeys.likedPosts()`

### Upload de imagem — fluxo em 2 etapas

1. `useUploadFile` → `POST /api/file/upload` (multipart, campo `file`) → `{ filename }`
2. `useCreatePost` recebe `filename` e chama `POST /api/posts` com `{ image: filename, content }`

### Tratamento de erros de API

```typescript
// src/services/api/errors.ts  (🆕)
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    if (status === 401) return 'Sessão expirada. Faça login novamente.';
    if (status === 403) return 'Você não tem permissão para esta ação.';
    if (status === 404) return 'Conteúdo não encontrado.';
    if (message) return message;
  }
  return 'Ocorreu um erro. Tente novamente.';
}
```

---

## 6. Design Tokens (existentes em `src/theme/`)

Nenhuma mudança nos tokens. Novos componentes consomem valores já definidos:

| Token | Valor esperado | Uso |
|---|---|---|
| `colors.background` | `#000000` | Fundo de todas as telas |
| `colors.surface` | `#1C1C1E` | Cards, bottom sheets |
| `colors.textPrimary` | `#FFFFFF` | Títulos, texto principal |
| `colors.textSecondary` | `#8E8E93` | Handles, timestamps |
| `colors.border` | `#2C2C2E` | Separadores, bordas de input |
| `colors.destructive` | `#FF6B6B` | Delete, Sair, ações destrutivas |
| `colors.accent` | `#00BCD4` | Ícones ativos, FAB |
| `borderRadius.card` | `12` | Cards de post |
| `borderRadius.sheet` | `16` | Bottom sheets (topo) |
| `borderRadius.input` | `8` | Campos de formulário |

---

## 7. Decisões de NFR

| NFR | Decisão de implementação |
|---|---|
| NFR-01 Dark mode | Todos os `StyleSheet.create` consomem tokens de `src/theme/colors`; zero cor hardcoded |
| NFR-02 Skeleton | `SkeletonCard` com `Animated.loop`; checar `AccessibilityInfo.isReduceMotionEnabled` antes de animar |
| NFR-03 Fullscreen | `SafeAreaProvider` já presente; telas usam `useSafeAreaInsets` ou `SafeAreaView` |
| NFR-04 Scroll infinito | `useInfiniteQuery` + `FlashList` `onEndReached` com `onEndReachedThreshold={0.5}` |
| NFR-05 JWT | Interceptor do `apiClient` já injeta Bearer token; sem mudança |
| NFR-06 Erros de API | `handleApiError` centralizado em `src/services/api/errors.ts` |
| NFR-07 Touch targets | Todos os elementos interativos com `minHeight: 44`, `minWidth: 44` via tokens de `spacing` |
