1. Metadados da API
   Item Valor
   Host padrão http://<host>:8080 (ver src/index.ts)
   Prefixo público /public — sem JWT
   Prefixo autenticado /api — exige sessão válida
   Auth Header Authorization: Bearer <JWT> (middleware authSession)
   401 { message: "Unauthorized" } quando o token falta ou é inválido
   Arquivos estáticos @fastify/static em /static/ → arquivos em ./uploads/; após upload, URL típica: /static/<filename>
   Rate limit global 100 req / minuto (src/index.ts)
   Rate limit auth Login e register: 5 req / minuto (router.ts)
   Paginação (limit, page)
   Query opcional: limit (string), page (string).
   Padrões no código: limit = "10", page = "0".
   Cálculo: take = parseInt(limit) \|\| 0, skip = (parseInt(page) \|\| 0) \* take (paginationProps).
   Respostas paginadas costumam trazer ct (total/count) + data (lista).
   Erros comuns no corpo
   400 / 403 / 404 / 500: em geral { message: string }.
   500 em alguns handlers: pode incluir error (ex.: updateProfile, deletePost).
   Observações de implementação (úteis para o frontend)
   GET /api/users/:id e GET /api/posts/:id: em hit de cache, o handler às vezes devolve um objeto “cru” sem reply.code(200) explícito — o cliente deve tratar como sucesso com corpo JSON { data: ... } (comportamento atual do Fastify).
   GET /api/users/:id/followers e .../followings: mesmo padrão possível ao retornar { ct, data } sem reply.send em alguns caminhos — validar na prática com o cliente HTTP.
   SSE em /api/notifications: a rota está atrás do mesmo hook de auth que exige Authorization. O EventSource do browser não envia header Authorization por padrão; pode ser necessário proxy, extensão do servidor ou outro mecanismo para produção.
2. Tipos reutilizáveis (referência)
   // User (público em respostas — sem password)
   type UserPublic = {
   id: number;
   email: string;
   username: string;
   fullName: string;
   bio: string | null;
   avatar: string | null;
   createdAt: string; // ISO DateTime do JSON
   updatedAt: string;
   };
   // User em listagens enxutas (ex.: search)
   type UserSearchItem = Pick<UserPublic, "id" | "username" | "fullName" | "avatar">;
   // Post com autor resumido (varia por rota)
   type PostAuthorSnippet = Pick<UserPublic, "id" | "username" | "fullName" | "avatar">;
   type PostWithAuthor = {
   id: number;
   userId: number;
   content: string | null;
   image: string;
   createdAt: string;
   updatedAt: string;
   user: PostAuthorSnippet; // getUserPosts usa include user completo do Prisma
   total_likes?: number;
   total_comments?: number;
   };
   type CommentWithUser = {
   id: number;
   userId: number;
   postId: number;
   content: string;
   createdAt: string;
   updatedAt: string;
   user: PostAuthorSnippet;
   };
3. Rotas públicas (/public/\*)
   POST /public/login
   Descrição Autentica por e-mail ou username no campo email + senha; devolve JWT.
   Body (JSON) { email: string, password: string } — schema obrigatório
   200 { data: { token: string, user: { id, email, username, fullName } } }
   400 Campos obrigatórios
   401 Credenciais inválidas
   POST /public/register
   Descrição Cria usuário (senha com hash).
   Body (JSON) { email: string (format email), username: string (min 3), fullName: string (min 1), password: string (min 6) }
   201 { message: "ok" }
   400 Campos faltando / e-mail ou username já usados
4. Rotas privadas (/api/\*)
   Todas exigem Authorization: Bearer <token> salvo indicação contrária.

4.1 Notificações (SSE)
GET /api/notifications
Descrição Server-Sent Events: conexão longa; primeiro evento connect, depois eventos de domínio.
Params / body Nenhum
Headers Accept: text/event-stream; na prática o auth atual exige Bearer (ver observação acima).
Stream Linhas data: <json>\n\n
Payloads { event: "connect" } e { event: SSE_EVENTS, data: Record<string, unknown> } com event em: create-post, delete-post, create-comment, delete-comment (src/modules/notification.ts). data espelha o objeto enviado pelo servidor (post completo no create, etc.).
4.2 Usuário autenticado / perfil
GET /api/users/me
Descrição Perfil do usuário do token + contagens.
Query —
200 { data: UserPublic & { followers: number, following: number, posts: number } } — followers/following são tamanhos dos conjuntos (Redis/DB fallback), posts é count no banco.
GET /api/users/me/liked-posts
Descrição IDs dos posts que o usuário curtiu (cache/DB).
200 { data: number[] } — cada item é postId
PUT /api/users/profile
Descrição Atualiza perfil; invalida cache do usuário; remove avatar antigo do disco se avatar mudar.
Body (JSON) Opcional por campo: email?, username?, fullName?, bio?, avatar? (todos validados pelo schema se presentes)
200 { data: { ...sessão anterior..., ...body } } — merge do user da sessão com o body (não é necessariamente o registro fresco do DB).
400 E-mail/username duplicado
PATCH /api/users/password
Descrição Troca senha.
Body (JSON) { password: string (atual), newPassword: string (min 6) }
200 { message: "ok" }
400 Senha atual incorreta / nova igual à antiga
4.3 Usuários (por id / social / busca)
GET /api/users/:id
Descrição Perfil público + contagens de seguidores/seguindo/posts.
Params id — string numérica (^\d+$)
200 { data: { id, avatar, username, fullName, bio, email, createdAt, followers, following, posts } } — contagens como em /me
404 Usuário não encontrado
GET /api/users/:id/posts
Descrição Posts do usuário, paginado; cada post inclui user e total_likes / total_comments.
Params id (numérico)
Query limit?, page?
200 { ct: number, data: PostWithAuthor[] }
404 Usuário não existe
GET /api/users/:id/followers
Descrição Lista paginada de usuários que seguem :id.
Params / Query id; limit?, page?
200 { ct: number, data: UserPublic[] } (select sem password)
GET /api/users/:id/followings
Descrição Lista paginada de usuários que :id segue.
Params / Query Idem followers
200 { ct: number, data: UserPublic[] }
GET /api/users/search
Descrição Busca por substring em fullName ou username; exclui o próprio usuário.
Query query? (default ""), limit? (default "20" no handler)
200 { ct: number, data: UserSearchItem[] }
GET /api/users/suggestions
Descrição Até 5 usuários que o caller não segue (e não é ele), ordenados por quantidade de posts.
200 { data: Array<{ id, username, fullName, avatar, \_count: { posts: number } }> }
POST /api/users/follow
Descrição Usuário autenticado segue userId.
Body { userId: number }
200 { message: "OK" }
400 Já seguindo / seguir a si / userId obrigatório
404 Usuário alvo não existe
POST /api/users/unfollow
Descrição Deixa de seguir userId.
Body { userId: number }
200 { message: "OK" }
400 Relação não existe
4.4 Posts
POST /api/posts
Descrição Cria post; dispara SSE create-post com o objeto do post (include user); não devolve o post no JSON de resposta.
Body { image: string, content: string } — image costuma ser o filename retornado pelo upload + uso em /static/...
201 { message: "ok" }
400 Falta content ou image
GET /api/posts/:id
Descrição Detalhe do post + totais de likes e comentários.
Params id numérico
200 { data: Post & { user: PostAuthorSnippet, total_likes: number, total_comments: number } }
404 Post não encontrado
PUT /api/posts/:id
Descrição Atualiza apenas content; só o dono.
Params id
Body { content: string (min 1) }
200 { message: "ok" }
403 Não é o autor
404 Post não existe
DELETE /api/posts/:id
Descrição Remove post, arquivo de imagem, caches; SSE delete-post.
Params id
200 { message: "ok" }
403 / 404 Conforme regra
POST /api/posts/like
Descrição Curtir post (persistido em DB + Redis).
Body { postId: number }
200 { message: "OK" }
400 Já curtido
404 Post não existe
POST /api/posts/unlike
Descrição Remover curtida.
Body { postId: number }
200 { message: "OK" }
GET /api/posts/:id/users-likes
Descrição Usuários que curtiram o post :id (param de rota é o id do post).
Params id (post)
Query limit?, page?
200 { ct: number, data: UserPublic[] }
404 Post não existe
GET /api/posts/feed
Descrição Feed: posts de quem o usuário segue + os próprios; ordenado por id desc; cada item tem total_likes (sem total_comments no handler).
Query limit?, page?
200 { ct: number, data: PostWithAuthor[] }
GET /api/posts/explore
Descrição Posts de quem o usuário não segue (e não é ele); total_likes em cada item.
Query limit?, page?
200 { ct: number, data: PostWithAuthor[] }
4.5 Comentários
POST /api/posts/:postId/comments
Descrição Cria comentário; SSE create-comment com o objeto comment.
Params postId numérico
Body { content: string (min 1) }
201 { message: "ok" }
404 Post não existe
GET /api/posts/:postId/comments
Descrição Lista comentários do post, paginada, com autor.
Params postId
Query limit?, page?
200 { ct: number, data: CommentWithUser[] }
PUT /api/posts/:postId/comments/:commentId
Descrição Atualiza texto; só o autor.
Params postId, commentId
Body { content: string (min 1) }
200 { message: "ok" }
403 / 404 Conforme regra
DELETE /api/posts/:postId/comments/:commentId
Descrição Remove comentário; SSE delete-comment.
Params postId, commentId
200 { message: "ok" }
4.6 Upload
POST /api/file/upload
Descrição Upload multipart de um arquivo; grava em uploads/ com nome {timestamp}-{originalName}.
Body multipart/form-data — campo arquivo via request.file() (cliente: enviar como file field padrão do Fastify multipart).
200 { filename: string, mimetype: string }
400 Arquivo > 5 MB
Uso típico Passar filename como image em POST /api/posts e montar URL {origin}/static/{filename} 5. Mapa rápido método + path (LLM)
POST /public/login
POST /public/register
GET /api/notifications (SSE)
GET /api/users/me
GET /api/users/me/liked-posts
GET /api/users/:id
GET /api/users/:id/posts
GET /api/users/:id/followers
GET /api/users/:id/followings
PUT /api/users/profile
PATCH /api/users/password
GET /api/users/search
GET /api/users/suggestions
POST /api/users/follow
POST /api/users/unfollow
POST /api/posts
GET /api/posts/:id
PUT /api/posts/:id
DELETE /api/posts/:id
POST /api/posts/like
POST /api/posts/unlike
GET /api/posts/:id/users-likes
GET /api/posts/feed
GET /api/posts/explore
POST /api/posts/:postId/comments
GET /api/posts/:postId/comments
PUT /api/posts/:postId/comments/:commentId
DELETE /api/posts/:postId/comments/:commentId
POST /api/file/upload
GET /static/:filename (sem prefixo /api)
