# M-Feed App — Especificação Geral

## Problem Statement

Usuários de redes sociais visuais precisam de uma experiência fluida e focada para publicar
e consumir conteúdo de imagem, seguir pessoas de interesse e descobrir novos criadores.
O M-Feed endereça essa necessidade com uma interface dark mode, fluxo de autenticação
seguro via JWT e timeline contextualizada (seguindo vs. descoberta).

## Goals

- [x] Autenticação funcional conectada ao backend JWT com taxa de erro < 1%
- [ ] Timeline personalizada (For You) e de descoberta (Explore) navegáveis
- [ ] Criação e edição de posts com upload de imagem sem erros
- [ ] Busca de usuários por nome ou nickname com debounce ≤ 300 ms
- [ ] Follow/unfollow com reflexo na tab For You na próxima atualização
- [ ] Experiência visual consistente em dark mode em todas as telas

## Out of Scope

| Feature | Reason |
|---|---|
| Notificações push (SSE `/api/notifications`) | `EventSource` não envia header JWT por padrão; excluído da v1 |
| Stories, vídeos, mídia além de imagem estática | Fora do escopo de produto v1 |
| Feed algorítmico | Ordenação é estritamente cronológica (id desc) |
| Sistema de mensagens diretas (DM) | Fora do escopo de produto v1 |
| Moderação de conteúdo | Fora do escopo de produto v1 |

---

## User Stories

### P1: AUTH-LOGIN — Login de usuário existente

**User Story:** Como usuário recorrente, quero fazer login com e-mail/username e senha para
acessar meu feed imediatamente.

**Why P1:** Porta de entrada obrigatória; sem login funcional nada mais opera.

**Layout Ref:** `layout-analysis.md#layout-login`

**Acceptance Criteria:**

1. WHEN o usuário preenche e-mail (ou username) e senha válidos e submete THEN o sistema
   SHALL chamar `POST /public/login` com `{ email, password }`
2. WHEN a API retorna 200 com `{ data: { token, user } }` THEN o sistema SHALL persistir
   o token JWT via MMKV e redirecionar para a tela Home
3. WHEN a API retorna 401 THEN o sistema SHALL exibir mensagem "Credenciais inválidas"
4. WHEN a API retorna 400 THEN o sistema SHALL exibir a mensagem de erro retornada
5. WHEN qualquer campo obrigatório estiver vazio THEN o sistema SHALL bloquear o submit
   e exibir validação inline
6. WHEN o app é reiniciado com token persistido THEN o sistema SHALL redirecionar
   diretamente para Home sem re-login

**Independent Test:** Informar credenciais válidas → app navega para Home e token
gravado no MMKV.

**Tasks (implementação)**

- [x] **AUTH-T1** — Tipos + `login()` em `src/features/auth/services/authApi.ts` (`POST /public/login`, unwrap `data`, Axios com status).
- [x] **AUTH-T2** — Estender `src/store/authStore.ts`: `user`, `setSession`, `signOut` limpa token + user; `partialize` com `token` e `user`.
- [x] **AUTH-T3** — Helper `src/services/api/errors.ts` (401 → AC3; 400 → corpo; rede/500 → genérico).
- [x] **AUTH-T4** — `LoginScreen.tsx`: loading, erros, validação vazios; submit async; botão desabilitado na request.
- [x] **AUTH-T5** — `__tests__/LoginScreen.test.tsx`.
- [x] **AUTH-T6** — Traceability AUTH-01…06 + `docs/INTEGRATIONS.md`.

---

### P1: AUTH-REGISTER — Cadastro de novo usuário

**Status:** Done (tasks REGISTER-T1…T6 concluídas).

**User Story:** Como novo usuário, quero criar uma conta para acessar o app.

**Why P1:** Sem cadastro não há base de usuários.

**Layout Ref:** `layout-analysis.md#layout-login` (link "Sign Up" abre cadastro)

**Acceptance Criteria:**

- [x] WHEN o usuário preenche email, username (≥ 3 chars), fullName (≥ 1 char) e password
  (≥ 6 chars) e submete THEN o sistema SHALL chamar `POST /public/register`
- [x] WHEN a API retorna 201 THEN o sistema SHALL redirecionar para a tela de Login com
  mensagem de sucesso
- [x] WHEN a API retorna 400 (e-mail ou username já usados) THEN o sistema SHALL exibir
  mensagem de erro legível
- [x] WHEN qualquer campo obrigatório estiver inválido THEN o sistema SHALL bloquear o submit
  e exibir validação inline

**Independent Test:** Cadastrar usuário com dados únicos → redireciona para Login.

**Tasks (implementação)**

- [x] **REGISTER-T1** — `RegisterPayload` + `register()` em `authApi.ts` (`POST /public/register`, `skipGlobal401Handler`).
- [x] **REGISTER-T2** — `AuthStackParamList`: `Login` aceita `successMessage?`.
- [x] **REGISTER-T3** — `RegisterScreen.tsx`: 4 campos, validação inline, loading, erro API, navigate com successMessage.
- [x] **REGISTER-T4** — `LoginScreen.tsx`: banner de sucesso via `route.params?.successMessage`.
- [x] **REGISTER-T5** — `__tests__/RegisterScreen.test.tsx`.
- [x] **REGISTER-T6** — Traceability + `docs/INTEGRATIONS.md`.

---

### P1: NAV-BOTTOMTABS — Navegação principal por bottom tabs

**Status:** Done (tasks NAV-T1…T6 concluídas).

**User Story:** Como usuário autenticado, quero navegar entre as 4 áreas principais do app
via bottom tab bar.

**Why P1:** Estrutura de navegação é prerequisito de todas as demais telas.

**Layout Ref:** `layout-analysis.md#layout-home` (bottom nav visível; 4 ícones: Home,
Search, Add, Profile)

**Tasks:**

- [x] **NAV-T1** — Instalar `@react-navigation/bottom-tabs` e `@expo/vector-icons`.
- [x] **NAV-T2** — `types.ts`: `TabParamList` + `MainStackParamList` com rota `Tabs`.
- [x] **NAV-T3a** — `SearchScreen.tsx` (placeholder).
- [x] **NAV-T3b** — `CreateScreen.tsx` (placeholder).
- [x] **NAV-T3c** — `ProfileScreen.tsx` (placeholder).
- [x] **NAV-T4** — `TabNavigator.tsx` (4 tabs, Ionicons, estilo dark).
- [x] **NAV-T5** — `MainNavigator.tsx`: stack com `Tabs` → `MainTabNavigator`.
- [x] **NAV-T6** — Traceability + spec (este bloco).

**Acceptance Criteria:**

1. WHEN o usuário está autenticado THEN o sistema SHALL exibir bottom tab bar com 4 tabs:
   Home, Search, Create (+), Profile
2. WHEN o usuário toca em uma tab THEN o sistema SHALL navegar instantaneamente sem
   reload de sessão
3. WHEN uma tab está ativa THEN o sistema SHALL exibir indicação visual de estado
   selecionado
4. WHEN o usuário está em qualquer tela principal THEN o sistema SHALL manter a bottom
   tab bar visível

**Independent Test:** Tocar em cada tab → navega corretamente e indicador visual muda.

---

### P1: HOME-FORYOU — Timeline For You

**Status:** Done (FeedScreen, `feedApi` / hooks, PostCard, PostOptionsSheet; traceability HOME-01, HOME-02, HOME-04…HOME-08).

**User Story:** Como usuário autenticado, quero ver os posts de quem sigo e os meus
próprios em ordem cronológica decrescente.

**Why P1:** Core value proposition do app.

**Layout Ref:** `layout-analysis.md#layout-home` · `layout-analysis.md#layout-loading-home`
(skeleton state) · `layout-analysis.md#layout-home-post-options-sheet` (opções do post)

**Acceptance Criteria:**

1. WHEN o usuário acessa a tab Home THEN o sistema SHALL exibir a tab For You ativa por
   padrão e chamar `GET /api/posts/feed` com `limit` e `page`
2. WHEN os dados carregam THEN o sistema SHALL renderizar posts com: avatar + nome +
   nickname do autor, imagem do post, ícones de like e comentário
3. WHEN o usuário rola até o fim da lista THEN o sistema SHALL carregar a próxima página
   (scroll infinito via `limit`/`page`)
4. WHEN os dados estão carregando THEN o sistema SHALL exibir skeleton loading conforme
   `layout-loading-home`
5. WHEN o usuário toca em like num post não curtido THEN o sistema SHALL chamar
   `POST /api/posts/like` com `{ postId }` e refletir o estado localmente
6. WHEN o usuário toca em unlike num post curtido THEN o sistema SHALL chamar
   `POST /api/posts/unlike` com `{ postId }` e refletir o estado localmente
7. WHEN o usuário toca no avatar ou nome do autor THEN o sistema SHALL navegar para o
   perfil daquele usuário
8. WHEN o usuário toca em "⋯" (mais opções) THEN o sistema SHALL exibir bottom sheet
   conforme `layout-home-post-options-sheet`
9. WHEN o usuário é owner do post THEN o bottom sheet SHALL exibir Delete, Edit e
   Go to post
10. WHEN o usuário não é owner do post THEN o bottom sheet SHALL exibir apenas Go to post
11. WHEN o usuário toca em Delete THEN o sistema SHALL chamar `DELETE /api/posts/:id`,
    remover o post da lista e invalidar o cache do feed
12. WHEN o usuário toca em Edit THEN o sistema SHALL navegar para formulário de edição
    pré-preenchido
13. WHEN o usuário toca no ícone de comentários THEN o sistema SHALL navegar para os
    detalhes do post

**Independent Test:** Login com usuário que segue outros → For You exibe posts desses
usuários.

---

### P1: HOME-EXPLORE — Timeline Explore

**User Story:** Como usuário autenticado, quero descobrir posts de usuários que ainda
não sigo.

**Why P1:** Mecanismo de descoberta e crescimento da rede social.

**Layout Ref:** `layout-analysis.md#layout-home` (mesma estrutura de card, tab "Explore")

**Acceptance Criteria:**

1. WHEN o usuário toca na tab Explore THEN o sistema SHALL chamar
   `GET /api/posts/explore` com `limit` e `page`
2. WHEN os dados carregam THEN o sistema SHALL renderizar posts de usuários não seguidos
   com a mesma estrutura de card da tab For You
3. WHEN o usuário rola até o fim THEN o sistema SHALL carregar a próxima página

**Independent Test:** Trocar para Explore → exibe posts de usuários diferentes dos
seguidos.

---

### P1: POST-DETAIL — Detalhes do post com comentários

**User Story:** Como usuário, quero ver o post completo com todos os comentários e poder
adicionar o meu.

**Why P1:** Interação social fundamental além do like.

**Layout Ref:** `layout-analysis.md#layout-post-detail`

**Acceptance Criteria:**

1. WHEN o usuário acessa os detalhes de um post THEN o sistema SHALL chamar
   `GET /api/posts/:id` e exibir: imagem, content, total de likes e comentários
2. WHEN a tela carrega THEN o sistema SHALL chamar `GET /api/posts/:postId/comments`
   com paginação e exibir comentários em ordem cronológica com avatar, username, texto
   e timestamp relativo
3. WHEN o usuário rola os comentários THEN o sistema SHALL carregar mais via scroll
   infinito
4. WHEN o usuário digita no campo de comentário e submete THEN o sistema SHALL chamar
   `POST /api/posts/:postId/comments` com `{ content }` e adicionar o comentário
   à lista localmente
5. WHEN o usuário toca no botão de compartilhar THEN o sistema SHALL disparar o
   mecanismo de compartilhamento nativo do SO
6. WHEN os dados estão carregando THEN o sistema SHALL exibir skeleton loading

**Independent Test:** Abrir detalhe de post → conteúdo + comentários visíveis +
consegue adicionar comentário.

---

### P1: SEARCH-USERS — Busca de usuários

**User Story:** Como usuário, quero encontrar outros usuários pelo nome ou nickname e
descobrir sugestões antes de digitar.

**Why P1:** Mecanismo de descoberta e conexão social.

**Layout Ref:** `layout-analysis.md#layout-search-screen`

**Acceptance Criteria:**

1. WHEN o campo de busca está vazio THEN o sistema SHALL chamar
   `GET /api/users/suggestions` e exibir até 5 usuários sugeridos com avatar, fullName
   e username
2. WHEN o usuário digita no campo de busca THEN o sistema SHALL ocultar sugestões e
   aguardar ≥ 300 ms de inatividade antes de chamar
   `GET /api/users/search?query=<termo>`
3. WHEN a API retorna resultados THEN o sistema SHALL exibir lista com avatar, fullName
   e username de cada usuário
4. WHEN o usuário toca em um item da lista (resultado ou sugestão) THEN o sistema SHALL
   navegar para o perfil daquele usuário
5. WHEN a busca retorna lista vazia THEN o sistema SHALL exibir estado vazio com mensagem
6. WHEN os resultados estão carregando THEN o sistema SHALL exibir skeleton loading
7. WHEN o usuário limpa o campo de busca THEN o sistema SHALL retornar a exibir sugestões

**Independent Test:** Campo vazio → sugestões aparecem; digitar nome → resultados de
busca aparecem.

---

### P1: CREATE-POST — Criação de novo post

**User Story:** Como criador de conteúdo, quero publicar um novo post com imagem e
descrição.

**Why P1:** Sem criação de conteúdo o feed fica vazio.

**Layout Ref:** `layout-analysis.md#layout-create-post`

**Acceptance Criteria:**

1. WHEN o usuário acessa a tab Create THEN o sistema SHALL exibir formulário com campos:
   content (texto, opcional) e área de upload de imagem (obrigatória)
2. WHEN o usuário seleciona uma imagem THEN o sistema SHALL fazer upload via
   `POST /api/file/upload` (multipart, campo `file`) e guardar o `filename` retornado
3. WHEN o formulário é válido e submetido THEN o sistema SHALL chamar `POST /api/posts`
   com `{ image: filename, content }`
4. WHEN a API retorna 201 THEN o sistema SHALL invalidar as queries de feed e navegar
   de volta para Home
5. WHEN a imagem não for selecionada e o usuário tentar submeter THEN o sistema SHALL
   bloquear o submit e exibir validação
6. WHEN o usuário toca em Cancelar com alterações não salvas THEN o sistema SHALL exibir
   confirmação antes de descartar
7. WHEN o arquivo de imagem exceder 5 MB THEN o sistema SHALL exibir erro antes de
   realizar o upload

**Independent Test:** Criar post com imagem e texto → aparece na tab For You após
voltar para Home.

---

### P1: CREATE-EDIT — Edição de post existente

**User Story:** Como criador de conteúdo, quero editar o content de um post já publicado.

**Why P1:** Necessário para corrigir erros em posts publicados.

**Layout Ref:** `layout-analysis.md#layout-create-post` (mesmo formulário, modo edição)

**Acceptance Criteria:**

1. WHEN o usuário toca em Edit no bottom sheet de um post THEN o sistema SHALL navegar
   para o formulário pré-preenchido com o `content` atual do post
2. WHEN o usuário salva THEN o sistema SHALL chamar `PUT /api/posts/:id` com
   `{ content }` atualizado
3. WHEN a API retorna 200 THEN o sistema SHALL invalidar a query do post e retornar
   à tela anterior com dados atualizados
4. WHEN a API retorna 403 THEN o sistema SHALL exibir mensagem de erro de permissão

**Note:** `PUT /api/posts/:id` suporta apenas atualização de `content`; a imagem não
pode ser alterada após criação.

**Independent Test:** Editar content de um post próprio → texto atualizado na timeline.

---

### P1: PROFILE-OWN — Perfil do usuário logado

**User Story:** Como usuário, quero ver meu perfil com meus posts, seguidores e opções
de edição.

**Why P1:** Gestão da própria identidade no app.

**Layout Ref:** `layout-analysis.md#layout-private-profile` · `layout-analysis.md#layout-edit-profile`
· `layout-analysis.md#layout-edit-password` · `layout-analysis.md#layout-confirm-logout`
· `layout-analysis.md#layout-loading-profile` (skeleton state)

**Acceptance Criteria:**

1. WHEN o usuário acessa a tab Profile THEN o sistema SHALL chamar `GET /api/users/me`
   e exibir: avatar, fullName, username, bio, contadores de followers/following/posts
2. WHEN os dados carregam THEN o sistema SHALL exibir grid de posts em layout masonry
   (2 colunas com tamanhos variados) via `GET /api/users/:id/posts`
3. WHEN os dados estão carregando THEN o sistema SHALL exibir skeleton conforme
   `layout-loading-profile`
4. WHEN o usuário toca em Edit Profile THEN o sistema SHALL navegar para formulário
   pré-preenchido conforme `layout-edit-profile`
5. WHEN o usuário salva o perfil THEN o sistema SHALL chamar `PUT /api/users/profile`
   com os campos alterados (email?, username?, fullName?, bio?, avatar?)
6. WHEN o usuário toca em Edit Password THEN o sistema SHALL navegar para formulário
   conforme `layout-edit-password`
7. WHEN o usuário salva nova senha THEN o sistema SHALL chamar
   `PATCH /api/users/password` com `{ password, newPassword }`
8. WHEN o usuário toca no ícone de logout THEN o sistema SHALL exibir bottom sheet de
   confirmação conforme `layout-confirm-logout`
9. WHEN o usuário confirma Sair THEN o sistema SHALL limpar token e redirecionar para
   Login

**Independent Test:** Acessar Profile → exibe dados corretos e grid de posts do
usuário logado.

---

### P1: PROFILE-OTHER — Perfil de outro usuário

**User Story:** Como usuário, quero visitar perfis de outros usuários e poder
segui-los ou deixar de segui-los.

**Why P1:** Mecanismo de conexão social.

**Layout Ref:** `layout-analysis.md#layout-public-profile` · `layout-analysis.md#layout-loading-profile`
(skeleton state)

**Acceptance Criteria:**

1. WHEN o usuário navega para o perfil de outro usuário THEN o sistema SHALL chamar
   `GET /api/users/:id` e exibir: avatar, fullName, username, bio, contadores
2. WHEN os dados carregam THEN o sistema SHALL exibir grid de posts em 3 colunas
   uniformes via `GET /api/users/:id/posts`
3. WHEN o usuário não segue o outro THEN o sistema SHALL exibir botão Follow (fundo
   branco sólido, texto preto)
4. WHEN o usuário toca em Follow THEN o sistema SHALL chamar
   `POST /api/users/follow` com `{ userId }` e atualizar o botão para Unfollow
5. WHEN o usuário toca em Unfollow THEN o sistema SHALL chamar
   `POST /api/users/unfollow` com `{ userId }` e atualizar o botão para Follow
6. WHEN os dados estão carregando THEN o sistema SHALL exibir skeleton loading
7. WHEN o usuário toca no botão Voltar THEN o sistema SHALL retornar à tela anterior

**Independent Test:** Visitar perfil de outro usuário → Follow funciona e tab For You
inclui posts dele na próxima atualização.

---

## Edge Cases

- WHEN a API retorna 401 em qualquer rota autenticada THEN o sistema SHALL limpar o
  token e redirecionar para Login
- WHEN a API retorna 500 THEN o sistema SHALL exibir mensagem genérica de erro sem
  expor detalhes técnicos
- WHEN o arquivo de imagem exceder 5 MB THEN o sistema SHALL exibir erro antes do upload
- WHEN não há conexão de rede THEN o sistema SHALL exibir mensagem de erro de
  conectividade
- WHEN o feed For You está vazio (sem seguidos) THEN o sistema SHALL exibir estado
  vazio com orientação para Explore
- WHEN a paginação chega ao fim dos resultados THEN o sistema SHALL parar de requisitar
  novas páginas

---

## Requirement Traceability

| Requirement ID | Story | Layout Ref | Status |
|---|---|---|---|
| AUTH-01 | AUTH-LOGIN | layout-login | Done |
| AUTH-02 | AUTH-LOGIN | layout-login | Done |
| AUTH-03 | AUTH-LOGIN / AUTH-REGISTER | layout-login | Done |
| AUTH-04 | AUTH-LOGIN | layout-login | Done |
| AUTH-05 | AUTH-LOGIN / AUTH-REGISTER | layout-login | Done |
| AUTH-06 | AUTH-LOGIN | — | Done |
| NAV-01 | NAV-BOTTOMTABS | layout-home | Done |
| NAV-02 | NAV-BOTTOMTABS | layout-home | Done |
| NAV-03 | NAV-BOTTOMTABS | layout-home | Done |
| HOME-01 | HOME-FORYOU / HOME-EXPLORE | layout-home | Done |
| HOME-02 | HOME-FORYOU | layout-home | Done |
| HOME-03 | HOME-EXPLORE | layout-home | Pending |
| HOME-04 | HOME-FORYOU | layout-home | Done |
| HOME-05 | HOME-FORYOU | layout-home | Done |
| HOME-06 | HOME-FORYOU | layout-home-post-options-sheet | Done |
| HOME-07 | HOME-FORYOU / HOME-EXPLORE | layout-home | Done |
| HOME-08 | HOME-FORYOU / HOME-EXPLORE | layout-loading-home | Done |
| POST-01 | POST-DETAIL | layout-post-detail | Pending |
| POST-02 | POST-DETAIL | layout-post-detail | Pending |
| POST-03 | POST-DETAIL | layout-post-detail | Pending |
| POST-04 | POST-DETAIL | layout-post-detail | Pending |
| POST-05 | POST-DETAIL | layout-post-detail | Pending |
| SEARCH-01 | SEARCH-USERS | layout-search-screen | Pending |
| SEARCH-02 | SEARCH-USERS | layout-search-screen | Pending |
| SEARCH-03 | SEARCH-USERS | layout-search-screen | Pending |
| SEARCH-04 | SEARCH-USERS | layout-search-screen | Pending |
| SEARCH-05 | SEARCH-USERS | layout-search-screen | Pending |
| SEARCH-06 | SEARCH-USERS | layout-search-screen | Pending |
| CREATE-01 | CREATE-POST | layout-create-post | Pending |
| CREATE-02 | CREATE-POST | layout-create-post | Pending |
| CREATE-03 | CREATE-POST | layout-create-post | Pending |
| CREATE-04 | CREATE-POST | layout-create-post | Pending |
| CREATE-05 | CREATE-POST / CREATE-EDIT | layout-create-post | Pending |
| PROFILE-01 | PROFILE-OWN / PROFILE-OTHER | layout-private-profile / layout-public-profile | Pending |
| PROFILE-02 | PROFILE-OWN / PROFILE-OTHER | layout-private-profile / layout-public-profile | Pending |
| PROFILE-03 | PROFILE-OTHER | layout-public-profile | Pending |
| PROFILE-04 | PROFILE-OTHER | layout-public-profile | Pending |
| PROFILE-05 | PROFILE-OWN | layout-confirm-logout | Pending |
| PROFILE-06 | PROFILE-OWN | layout-edit-profile / layout-edit-password | Pending |
| PROFILE-07 | PROFILE-OWN / PROFILE-OTHER | layout-loading-profile | Pending |
| NFR-01 | All | All layouts | Pending |
| NFR-02 | All data-dependent | layout-loading-home / layout-loading-profile | Pending |
| NFR-03 | All | All layouts | Pending |
| NFR-04 | HOME, POST-DETAIL, PROFILE | layout-home / layout-post-detail / layout-private-profile | Pending |
| NFR-05 | All authenticated | — | Pending |
| NFR-06 | All | — | Pending |
| NFR-07 | All | All layouts | Pending |

**Coverage:** 46 requisitos mapeados · 0 não mapeados

---

## API Discrepancies (vs PRD / Layout)

| Fonte | Layout/PRD | API Real | Decisão |
|---|---|---|---|
| layout-create-post | Campo "Title" explícito no formulário | `POST /api/posts` aceita só `{ image, content }` — sem title | **Sem campo Title** — spec adota contrato real da API |
| overview.md | Edição atualiza campos completos | `PUT /api/posts/:id` só atualiza `content`; imagem inalterável | **Só content editável** — spec reflete limitação da API |
| overview.md | `GET /api/users/search?q=` | Parâmetro real é `query`, não `q` | **Usar `query`** conforme API real |

---

## Success Criteria

- [ ] Fluxo completo cadastro → login → criar post → ver no feed em < 5 min
- [ ] Timeline For You exibe apenas posts de seguidos + próprios
- [ ] Busca retorna resultado correto em < 300 ms após parada de digitação
- [ ] Nenhuma tela exibe fundo branco exposto (dark mode consistente)
- [ ] Zero crashes em fluxo de auth com credenciais inválidas
- [ ] Follow de usuário reflete na tab For You na próxima atualização
