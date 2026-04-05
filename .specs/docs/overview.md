# M-Feed — Product Requirements Document (PRD)

| Campo | Valor |
|---|---|
| **Produto** | M-Feed — Mobile Social Feed App |
| **Versão do documento** | 1.0 |
| **Status** | Em desenvolvimento |
| **Última atualização** | Abril 2026 |
| **Referências** | `.spec/docs/layout-analysis.md` · `.spec/docs/endpoints-disponiveis.md` |

---

## 1. Visão Geral do Produto

O **M-Feed** é um aplicativo mobile de feed social que permite a usuários autenticados publicar, descobrir e interagir com postagens de imagem. O produto combina um feed personalizado (pessoas seguidas) com um modo de descoberta (novos usuários), sistema de perfis e mecanismo de busca — tudo em uma experiência visual mobile-first com design em dark mode.

---

## 2. Problema & Oportunidade

Usuários de redes sociais visuais buscam uma experiência fluida e focada para consumir e publicar conteúdo de imagem, seguir pessoas de interesse e descobrir novos criadores. O M-Feed endereça essa necessidade com uma interface minimalista, fluxo de autenticação seguro e timeline contextualizada (seguindo vs. descoberta).

---

## 3. Objetivos do Produto

| # | Objetivo | Indicador de Sucesso |
|---|---|---|
| O1 | Permitir autenticação segura de usuários | Login e cadastro funcionais com JWT; taxa de erro de auth < 1% |
| O2 | Entregar timeline personalizada e de descoberta | Usuário consegue distinguir e navegar entre as tabs For You e Explore |
| O3 | Habilitar criação e gestão de posts com imagem | Upload, edição e exclusão de posts sem erros em fluxo completo |
| O4 | Oferecer busca de usuários por nome ou nickname | Resultados exibidos com debounce em < 300 ms após parada da digitação |
| O5 | Permitir follow/unfollow e visualização de perfis | Ação de follow reflete na timeline For You na próxima atualização |
| O6 | Garantir experiência visual consistente em dark mode | Todas as telas com paleta dark mode; sem elementos com fundo branco exposto |

---

## 4. Usuários-Alvo

| Persona | Descrição | Comportamento principal |
|---|---|---|
| **Criador de conteúdo** | Usuário que publica imagens regularmente | Cria posts, responde comentários, gerencia perfil |
| **Consumidor social** | Usuário que consome feed e descobre perfis | Navega timeline, segue novos usuários, curte e comenta |
| **Usuário recorrente** | Já tem conta, usa o app diariamente | Login rápido, acesso imediato ao feed For You |

---

## 5. Escopo & Funcionalidades

### 5.1 Autenticação

O fluxo de entrada do aplicativo é composto por uma tela de login e cadastro. O usuário deve preencher corretamente os campos obrigatórios para se autenticar e acessar as features da aplicação.

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| AUTH-01 | A tela de login deve conter campos para e-mail/username e senha |
| AUTH-02 | A tela de cadastro deve conter os campos obrigatórios para criação de conta |
| AUTH-03 | Campos obrigatórios devem ser validados antes do envio do formulário |
| AUTH-04 | Após autenticação bem-sucedida, o usuário deve ser redirecionado para a tela Home |
| AUTH-05 | Erros de autenticação devem ser exibidos com mensagem legível ao usuário |
| AUTH-06 | O token JWT retornado deve ser persistido localmente para sessões subsequentes |

**Referências:** `POST /public/login` · `POST /public/register` · `layout-login`

---

### 5.2 Estrutura de Navegação Principal

Após o login, o usuário é redirecionado para o interior da aplicação. Todas as telas são fullscreen sem header nativo. A navegação principal é composta por **4 bottom tabs**:

| Tab | Ícone | Tela de destino |
|---|---|---|
| **Home** | Feed icon | Timeline de posts |
| **Search** | Lupa | Busca de usuários |
| **Create** | "+" | Criação de novo post |
| **Profile** | Avatar | Perfil do usuário logado |

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| NAV-01 | A bottom navigation bar deve estar visível em todas as telas principais |
| NAV-02 | A tab ativa deve ter indicação visual de estado selecionado |
| NAV-03 | A navegação entre tabs deve ser instantânea sem reload de sessão |

---

### 5.3 Home — Timeline

A tela Home é composta por uma timeline dividida em **duas tabs**:

#### Tab: For You
Representa uma timeline composta pelos posts de pessoas que o usuário logado está seguindo e seus próprios posts, exibidos em **ordem cronológica decrescente**.

#### Tab: Explore
Voltada para posts de usuários que o usuário logado ainda não segue e pode se interessar em seguir.

**Estrutura do Post (card na timeline):**

| Seção | Conteúdo |
|---|---|
| **Header** | Avatar, nome e nickname do autor; botão de "mais opções" (⋯) |
| **Conteúdo** | Imagem publicada pelo usuário via upload |
| **Ações** | Like/Unlike · Ícone de comentários (abre detalhes do post) |

**Comportamentos do Header do Post:**
- Clicar nas informações do usuário → redireciona para a tela de Profile daquele usuário
- Clicar no ícone "mais opções" → exibe Bottom Sheet com ações contextuais:
  - **Delete** e **Edit** (visíveis somente se o usuário for o owner do post)
  - **Go to post** (redireciona para os detalhes do post)

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| HOME-01 | A timeline deve exibir posts em ordem cronológica decrescente |
| HOME-02 | A tab For You deve conter posts do usuário logado e de quem ele segue |
| HOME-03 | A tab Explore deve conter posts de usuários que o logado ainda não segue |
| HOME-04 | O like/unlike deve ser persistido via API e refletir contagem atualizada |
| HOME-05 | O ícone de comentários deve abrir a tela de detalhes com foco na seção de comentários |
| HOME-06 | A bottom sheet de "mais opções" deve exibir Delete e Edit apenas para o owner do post |
| HOME-07 | A timeline deve suportar scroll infinito com paginação via `limit` e `page` |
| HOME-08 | Skeleton loading deve ser exibido enquanto os dados são carregados |

**Referências:** `GET /api/posts/feed` · `GET /api/posts/explore` · `layout-home` · `layout-home-post-options-sheet`

---

### 5.4 Detalhes do Post

Tela de visualização completa de um post individual, composta por três seções:

| Seção | Conteúdo |
|---|---|
| **Header** | Botão "Voltar" (←) · Ícone de compartilhar post |
| **Conteúdo** | Título/descrição do post · Imagem enviada pelo usuário |
| **Comentários** | Lista cronológica de comentários com scroll infinito · Campo para adicionar novo comentário |

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| POST-01 | A seção de comentários deve exibir comentários em ordem cronológica |
| POST-02 | O scroll de comentários deve ser infinito com carregamento paginado |
| POST-03 | O usuário deve conseguir adicionar um novo comentário via campo de input |
| POST-04 | O botão de compartilhar deve disparar o mecanismo de compartilhamento nativo do SO |
| POST-05 | Skeleton loading deve ser exibido enquanto os dados são carregados |

**Referências:** `GET /api/posts/:id` · `GET /api/posts/:id/comments` · `POST /api/posts/:id/comments` · `layout-post-detail`

---

### 5.5 Search — Busca de Usuários

Tela dedicada para pesquisa de outros usuários pelo nome completo ou nickname.

**Componentes:**
- Input de busca com **debounce na digitação** (evita requisições excessivas)
- Lista de resultados exibida quando o input retorna usuários, com cada item contendo:
  - Avatar do usuário
  - Nome completo
  - Nickname (@username)

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| SEARCH-01 | O campo de busca deve implementar debounce de no mínimo 300 ms |
| SEARCH-02 | A busca deve funcionar por nome completo ou nickname |
| SEARCH-03 | A lista de resultados deve exibir avatar, nome completo e nickname de cada usuário |
| SEARCH-04 | Clicar em um item da lista deve redirecionar para a tela de Profile daquele usuário |
| SEARCH-05 | Estado vazio deve ser exibido quando não há resultados para o termo pesquisado |
| SEARCH-06 | Skeleton loading deve ser exibido enquanto os resultados são carregados |

**Referências:** `GET /api/users/search?q=` · `layout-search-screen`

---

### 5.6 Create Post — Criação e Edição de Post

Tela de formulário para criação de um novo post. Ao ser preenchido corretamente, um novo post é adicionado e a timeline é atualizada.

**Campos do formulário:**

| Campo | Tipo | Obrigatório |
|---|---|---|
| **Title** | Texto curto | Sim |
| **Description / Content** | Texto longo | Não |
| **Image** | Upload de arquivo de imagem | Sim |

**Ações disponíveis:**
- **Cancelar** — descarta o formulário e retorna à tela anterior
- **Salvar** — valida os campos, realiza o upload da imagem e cria o post

**Modo de edição:**
O mesmo formulário é utilizado para editar um post existente, porém com todos os campos **pré-preenchidos** com os valores atuais.

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| CREATE-01 | Campos obrigatórios devem ser validados antes do envio |
| CREATE-02 | O upload de imagem deve ser suportado e enviado ao backend antes de criar o post |
| CREATE-03 | Após criação bem-sucedida, a timeline deve ser invalidada e recarregada |
| CREATE-04 | O modo de edição deve pré-preencher todos os campos com os valores atuais do post |
| CREATE-05 | O botão Cancelar deve exibir confirmação antes de descartar alterações não salvas |

**Referências:** `POST /api/posts` · `PATCH /api/posts/:id` · `POST /api/upload` · `layout-create-post`

---

### 5.7 Profile — Tela de Perfil

Tela de perfil disponível em **duas versões** conforme o contexto de acesso:

#### Versão 1: Perfil do Usuário Logado
#### Versão 2: Perfil de Outro Usuário

**Estrutura comum:**

| Seção | Conteúdo |
|---|---|
| **Header** | Botão Voltar (←) · Botão Sair (somente no perfil próprio) |
| **Informações da Conta** | Avatar · Nome completo · Nickname · Bio · Contadores: Followers, Following, Total de Posts |
| **Grid de Posts** | Grade de posts do usuário no estilo Instagram (3 colunas) |

**Diferenças por versão:**

| Elemento | Perfil próprio | Perfil de outro usuário |
|---|---|---|
| Botão de ação | **Edit Profile** + **Edit Password** (inline) | **Follow / Unfollow** |
| Botão Sair | Visível — abre bottom sheet de confirmação | Não visível |

**Fluxos de edição (perfil próprio):**
- **Edit Profile** → abre tela de formulário (mesmos padrões da tela de Create Post) com dados do usuário pré-preenchidos
- **Edit Password** → abre tela de formulário exclusivo para alteração de senha
- **Sair** → exibe bottom sheet de confirmação antes de encerrar a sessão

**Requisitos funcionais:**

| ID | Requisito |
|---|---|
| PROFILE-01 | O grid de posts deve seguir o padrão de 3 colunas estilo Instagram |
| PROFILE-02 | Os contadores de Followers, Following e Posts devem ser exibidos e atualizados via API |
| PROFILE-03 | O botão Follow/Unfollow deve estar disponível apenas em perfis de outros usuários |
| PROFILE-04 | A ação de Follow deve refletir na tab For You na próxima atualização da timeline |
| PROFILE-05 | O botão Sair deve exibir bottom sheet de confirmação antes de encerrar a sessão |
| PROFILE-06 | A edição de perfil e senha deve usar formulários com campos pré-preenchidos |
| PROFILE-07 | Skeleton loading deve ser exibido enquanto os dados são carregados |

**Referências:** `GET /api/users/:id` · `PATCH /api/users/:id` · `POST /api/users/:id/follow` · `DELETE /api/users/:id/follow` · `layout-private-profile` · `layout-public-profile` · `layout-edit-profile` · `layout-edit-password` · `layout-confirm-logout`

---

## 6. Requisitos Não-Funcionais

| ID | Categoria | Requisito |
|---|---|---|
| NFR-01 | **Design** | Todas as telas devem utilizar **dark mode** como tema único do aplicativo |
| NFR-02 | **Loading State** | Todas as telas que dependem de dados do backend devem implementar **loading skeleton** durante o carregamento |
| NFR-03 | **UX Mobile** | Todas as telas são **fullscreen** sem header nativo do sistema operacional |
| NFR-04 | **Performance** | Listas longas (timeline, comentários, grid de posts) devem usar scroll infinito com paginação |
| NFR-05 | **Segurança** | Todas as rotas autenticadas devem enviar o token JWT no header `Authorization: Bearer <token>` |
| NFR-06 | **Feedback de Erro** | Erros de API (400, 401, 403, 404, 500) devem ser tratados e exibidos de forma legível ao usuário |
| NFR-07 | **Acessibilidade** | Áreas de toque de botões e itens interativos devem respeitar o mínimo de 44px de altura/largura |

---

## 7. Fora do Escopo (Out of Scope)

- Notificações push (SSE de `/api/notifications` não será implementado na versão inicial por limitação do `EventSource` com JWT)
- Stories, vídeos ou formatos de mídia além de imagem estática
- Feed algorítmico (a ordenação é estritamente cronológica)
- Sistema de mensagens diretas (DM)
- Moderação de conteúdo

---

## 8. Dependências & Referências

| Documento | Finalidade |
|---|---|
| `.spec/docs/layout-analysis.md` | Análise detalhada de cada layout de tela: hierarquia visual, componentes, UX e paleta de cores |
| `.spec/docs/endpoints-disponiveis.md` | Contrato de API: endpoints, tipos de dados, paginação, autenticação e observações de implementação |
| `docs/ARCHITECTURE.md` | Arquitetura do app: navegação, estado global, React Query, fluxo de autenticação |
| `docs/INTEGRATIONS.md` | Configuração do cliente HTTP, variáveis de ambiente, headers e persistência |
| `docs/CONVENTIONS.md` | Padrões de código, nomenclatura e organização de arquivos |
