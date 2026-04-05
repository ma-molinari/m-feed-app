# External Integrations

## Backend REST API

**Service:** Application backend (URL configurável via env)  
**Purpose:** Autenticação, feed, posts, comentários, likes, upload de arquivos, perfis de usuário e busca.  
**Implementation:**

- HTTP client: `src/services/api/client.ts` (Axios, 15s timeout, JSON headers)
- Chaves React Query do feed / post / comentários / grid de posts: `src/features/feed/queryKeys.ts` (`feedKeys`, `userPostsQueryKey`)
- Erros tipados: `src/services/api/errors.ts`

**Configuration:**

- `app.config.js` expõe `extra.apiUrl` via `process.env.EXPO_PUBLIC_API_URL` (fallback `''`)
- `src/constants/env.ts` resolve `env.apiUrl` como: `native.API_URL` (react-native-config) → `extra.apiUrl` → `''`

**Arquivo `.env` local (não versionado):** os padrões `.env`, `.env.development` e `.env.production` estão no `.gitignore`. Crie um `.env` na raiz do projeto com pelo menos:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

Reinicie o Metro com cache limpo após alterar (`npx expo start -c`). No emulador Android, use `http://10.0.2.2:<porta>` em vez de `localhost`.

**Comportamento quando a URL da API está vazia:**

- Em desenvolvimento (`__DEV__`): aviso no console; o `apiClient` rejeita qualquer requisição com `MissingApiUrlError` (mensagem amigável via `getApiErrorMessage`) antes de ir à rede.
- Em build de produção (`!__DEV__`): o módulo `env.ts` lança na inicialização se `apiUrl` continuar vazio, para evitar app em produção sem backend configurado.

**Authentication:** Header Bearer via `useAuthStore.getState().token`; respostas 401 disparam `signOut()`.  
Requests com `skipGlobal401Handler: true` (login/register) ignoram esse interceptor.

### Endpoints usados

| Área              | Método | Endpoint                    | Localização                      |
| ----------------- | ------ | --------------------------- | -------------------------------- |
| Auth              | POST   | `/public/login`             | `auth/services/authApi.ts`       |
| Auth              | POST   | `/public/register`          | `auth/services/authApi.ts`       |
| Feed (For You)    | GET    | `/api/posts/feed`           | `feed/services/feedApi.ts`       |
| Feed (Explore)    | GET    | `/api/posts/explore`        | `feed/services/feedApi.ts`       |
| Post detalhe      | GET    | `/api/posts/:id`            | `feed/services/feedApi.ts`       |
| Posts curtidos    | GET    | `/api/users/me/liked-posts` | `feed/services/feedApi.ts`       |
| Like              | POST   | `/api/posts/like`           | `feed/services/feedApi.ts`       |
| Unlike            | POST   | `/api/posts/unlike`         | `feed/services/feedApi.ts`       |
| Delete post       | DELETE | `/api/posts/:id`            | `feed/services/feedApi.ts`       |
| Comentários       | GET    | `/api/posts/:id/comments`   | `feed/services/feedApi.ts`       |
| Criar comentário  | POST   | `/api/posts/:id/comments`   | `feed/services/feedApi.ts`       |
| Upload arquivo    | POST   | `/api/file/upload`          | `create/services/createApi.ts`   |
| Criar post        | POST   | `/api/posts`                | `create/services/createApi.ts`   |
| Editar post       | PUT    | `/api/posts/:id`            | `create/services/createApi.ts`   |
| Meu perfil        | GET    | `/api/users/me`             | `profile/services/profileApi.ts` |
| Perfil por ID     | GET    | `/api/users/:id`            | `profile/services/profileApi.ts` |
| Posts de usuário  | GET    | `/api/users/:id/posts`      | `profile/services/profileApi.ts` |
| Atualizar perfil  | PUT    | `/api/users/profile`        | `profile/services/profileApi.ts` |
| Alterar senha     | PATCH  | `/api/users/password`       | `profile/services/profileApi.ts` |
| Follow            | POST   | `/api/users/follow`         | `profile/services/profileApi.ts` |
| Unfollow          | POST   | `/api/users/unfollow`       | `profile/services/profileApi.ts` |
| Sugestões         | GET    | `/api/users/suggestions`    | `search/services/searchApi.ts`   |
| Busca de usuários | GET    | `/api/users/search?query=`  | `search/services/searchApi.ts`   |

### Envelopes de resposta

- **Login:** `{ data: { token, user } }` — `authApi.login` exige `token` string não vazia e `user.id` truthy; caso contrário lança `InvalidLoginResponseError` (mensagem via `getApiErrorMessage`), sem persistir sessão no caller.
- **Feed / explore / posts de usuário:** `{ ct: number, data: Post[] }` (sem wrapper extra — Axios `data` já é o objeto)
- **Liked posts / sugestões / busca / perfil / post detalhe:** `{ data: T }`
- **Comentários:** `{ ct: number, data: Comment[] }` (acesso direto, sem envelope extra)
- **Mutations (like/unlike/follow etc.):** sem body de resposta relevante

---

## Expo Application Services

**Service:** Expo / EAS  
**Purpose:** Build e release pipelines.  
**Implementation:** Profiles em `eas.json`: `development` (dev client), `preview`, `production` (auto increment).  
**Configuration:** `app.json` / `app.config.js` para metadata, ícones, splash e new architecture flag.

---

## Local Persistence

**Service:** MMKV (via `react-native-mmkv` + Nitro modules)  
**Purpose:** Storage rápido para Zustand persist (token + user auth).  
**Implementation:** `src/store/mmkvStorage.ts` — instance id `app-storage`; fallback in-memory se módulo nativo indisponível.

**Service:** react-native-config (opcional, nativo)  
**Purpose:** `API_URL` / `ENV` em cenários de dev client / prebuild.  
**Implementation:** `require` dinâmico com try/catch em `env.ts` quando módulo ausente (ex.: Expo Go).

---

## Media & UI Libraries

**Service:** expo-image  
**Purpose:** Imagens em cache; `RemoteImage` wrapper e hero do login.  
**Implementation:** `src/shared/components/RemoteImage.tsx`.

**Service:** expo-image-picker  
**Purpose:** Seleção de imagem da galeria na tela de criação de post.  
**Implementation:** `src/features/create/screens/CreateScreen.tsx` e `hooks/useCreatePost.ts`.

**Service:** @shopify/flash-list  
**Purpose:** Lista virtualizada no feed e no perfil.  
**Implementation:** `FeedScreen.tsx`, `PostDetailScreen.tsx` (comentários).

**Service:** @expo/vector-icons (Ionicons)  
**Purpose:** Ícones da tab bar (home, search, add-circle, person).  
**Implementation:** `src/navigation/TabNavigator.tsx`.

---

## Declared but Unused in Application Code

**Service:** expo-sqlite  
**Purpose:** Banco SQL local (cache offline / persistência local).  
**Configuration:** Listado em `package.json` e `app.json` → `expo.plugins`.  
**Implementation:** Nenhum import em `src/` — integração **declarada apenas**.

---

## Webhooks

Nenhum identificado (cliente mobile apenas).

## Background Jobs

Nenhum identificado; sem fila ou task runner além do runtime do app.
