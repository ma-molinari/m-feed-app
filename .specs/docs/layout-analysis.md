# M-Feed — Análise de Layouts

Documento de análise detalhada de cada tela do aplicativo M-Feed, com foco em princípios de UI Design, UX Architecture, acessibilidade, hierarquia visual e padrões de interação.

---

## Sumário

1. [layout-login](#layout-login)
2. [layout-home](#layout-home)
3. [layout-loading-home](#layout-loading-home)
4. [layout-loading-profile](#layout-loading-profile)
5. [layout-confirm-logout](#layout-confirm-logout)
6. [layout-post-detail](#layout-post-detail)
7. [layout-edit-profile](#layout-edit-profile)
8. [layout-private-profile](#layout-private-profile)
9. [layout-create-post](#layout-create-post)
10. [layout-edit-password](#layout-edit-password)
11. [layout-home-post-options-sheet](#layout-home-post-options-sheet)
12. [layout-public-profile](#layout-public-profile)
13. [layout-search-screen](#layout-search-screen)

---

## layout-login

**Arquivo:** `layout-login.png`

### Visão Geral

Tela de autenticação com padrão de **bottom sheet sobre imagem de fundo**, criando uma entrada visual imersiva e moderna. A identidade da marca (`M-FEED`) é ancorada no canto superior esquerdo sobre a imagem de fundo, estabelecendo reconhecimento imediato antes de qualquer interação.

### Hierarquia Visual

- **Nível 1 — Marca:** Logotipo `M-FEED` em bold branco no topo esquerdo, com alto contraste sobre a imagem de fundo escura. Peso visual máximo para reconhecimento de marca.
- **Nível 2 — Título do formulário:** `"Welcome back to M-Feed"` em tipografia display grande (≈24–30px), bold, preto — âncora principal da ação do usuário.
- **Nível 3 — Subtítulo:** `"Enter your credentials to access your account"` em texto regular menor (≈14px), cinza médio — suporte contextual sem competir com o título.
- **Nível 4 — Labels dos campos:** `"E-mail or Username"` e `"Password"` em peso semibold (≈14px), preto — guiam a ação de input.
- **Nível 5 — CTA principal:** Botão `Submit` preto full-width com texto branco bold — máximo contraste, área de toque generosa.
- **Nível 6 — CTA secundário:** `"Don't have an account? Sign Up"` com "Sign Up" em azul — link contextual de menor peso sem distrair o fluxo primário.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Background hero** | Imagem fotográfica de alto impacto visual, ligeiramente escurecida para permitir legibilidade do logotipo |
| **Bottom sheet** | Superfície branca com `border-radius` no topo (~16px), padrão universal mobile para formulários modais; inclui indicador de drag (pill cinza) |
| **Campos de input** | Bordas sutis, fundo branco, placeholder em cinza claro; satisfaz tamanho mínimo de toque (≥44px de altura) |
| **Botão Submit** | Retangular com bordas arredondadas, fundo preto, full-width — padrão de CTA primário de alto peso |

### UX e Fluxo

- O padrão **hero + bottom sheet** é eficaz em apps de estilo/lifestyle: engaja emocionalmente antes da fricção do login.
- A **ordem de foco** (campo e-mail → senha → submit) segue fluxo natural de cima para baixo, sem desvios.
- O link `Sign Up` está posicionado após o CTA primário, respeitando a jornada do usuário recorrente sem prejudicar a conversão.
- **Oportunidade de melhoria:** Ausência de opção de "Mostrar senha" no campo Password — adicionar ícone toggle de visibilidade melhoraria a usabilidade e reduziria erros.

### Sistema de Cores

- **Fundo:** Imagem fotográfica (tons escuros/cinza)
- **Superfície sheet:** Branco `#FFFFFF`
- **Texto primário:** Preto `#000000` / `#111111`
- **Texto secundário:** Cinza médio
- **CTA primário:** Preto `#000000` com texto branco
- **Link de ação:** Azul (`#007AFF` — padrão iOS)

### Acessibilidade

- Contraste do título sobre superfície branca: passa WCAG AA (ratio ≥4.5:1).
- Tamanho do botão Submit: full-width garante área de toque muito superior ao mínimo de 44px.
- **Ponto de atenção:** O logotipo branco sobre imagem pode não garantir contraste suficiente em todas as variações da foto de fundo — recomenda-se overlay escuro consistente.

---

## layout-home

**Arquivo:** `layout-home.png`

### Visão Geral

Feed principal do aplicativo, com tema escuro (`dark mode`), exibindo posts em formato de card vertical com imagem de destaque. Segue padrão de design amplamente consolidado em redes sociais visuais, com estrutura limpa e foco na imagem.

### Hierarquia Visual

- **Nível 1 — Tab Bar de conteúdo:** Seletor `"For you"` / `"Explore"` no topo, com `"For you"` ativo em pill cinza escuro e texto bold branco. `"Explore"` aparece em texto apagado — hierarquia clara de estado ativo/inativo.
- **Nível 2 — Card do post:** Unidade principal de conteúdo; a imagem do post é o elemento dominante de peso visual.
- **Nível 3 — Header do post:** Avatar circular do usuário (inicial "M" sobre cinza) + handle `@ma-molinari` + timestamp `"1 year"` + botão de opções `···`. Leitura natural da esquerda para direita.
- **Nível 4 — Ações do post:** Ícones de curtir (coração vermelho preenchido — ativo) e comentar (balão de fala vazio — inativo) posicionados abaixo da imagem.
- **Nível 5 — Navigation Bar inferior:** Ícones de Home, Search, Add (+), Profile — sem labels; usa iconografia universalmente reconhecida.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Card do post** | Superfície elevada em `#1C1C1E` (cinza escuro), bordas arredondadas (~12px), sem sombra explícita — elevação percebida pelo contraste com o fundo `#000000` |
| **Tab selector** | Pill com estado ativo definido por fundo e peso tipográfico; contraste adequado no modo dark |
| **Avatar** | Círculo 40px com inicial do usuário; substitui eficientemente foto ausente |
| **Ícone de curtir** | Coração vermelho sólido indica estado "curtido" — cor semântica imediata |
| **Bottom Nav** | 4 ícones equidistantes, full-width; ícone ativo (Home) com preenchimento distinto |

### UX e Fluxo

- O layout **card-based vertical scroll** é o padrão dominante de consumo de conteúdo em feeds; reduz carga cognitiva.
- A imagem ocupa ~70% da área do card, priorizando o conteúdo visual — coerente com a proposta do app.
- O segundo card começa a aparecer parcialmente no scroll, indicando que há mais conteúdo (`progressive disclosure`).
- **Oportunidade de melhoria:** Ausência de contador de curtidas/comentários visível no feed — adicionar métricas numéricas aumenta engajamento e feedback social.

### Sistema de Cores (Dark Mode)

- **Fundo:** Preto puro `#000000`
- **Superfície dos cards:** `#1C1C1E`
- **Texto primário:** Branco `#FFFFFF`
- **Texto secundário (timestamp):** Cinza `#8E8E93`
- **Curtida ativa:** Vermelho `#FF3B30`
- **Ícones inativos:** Branco com opacidade ~60%

### Acessibilidade

- Tema dark com texto branco: relação de contraste alta, passa WCAG AA.
- Ícones da bottom bar sem labels — boa prática para usuários experientes, mas pode ser um obstáculo para novos usuários. Considerar labels em texto abaixo dos ícones.
- Área de toque dos ícones de ação (curtir/comentar): deve ser garantida em ≥44px.

---

## layout-loading-home

**Arquivo:** `layout-loading-home.png`

### Visão Geral

Estado de carregamento (`loading state`) da tela home, implementado com o padrão **skeleton screen** em tema escuro. Exibe a estrutura visual da página antes dos dados reais chegarem, reduzindo a percepção de espera e eliminando a ansiedade do usuário frente a telas em branco.

### Hierarquia Visual e Estrutura do Skeleton

- **Header do app:** Nome "Pulse" em branco (real) + ícone de notificação em ciano — únicos elementos reais, estabelecendo ancoragem visual imediata.
- **Tab selector:** Três pills horizontais cinza escuro (~32px de altura, larguras variadas) representando as abas.
- **Cards de post (×3):**
  - Avatar: círculo cinza ~40px
  - Linhas de texto: retângulos cinza de altura e larguras variadas (simulam handle + timestamp)
  - Imagem: retângulo largo e alto, cinza médio
  - Ações: pequenos circles abaixo da imagem
- **FAB (Floating Action Button):** Círculo ciano no canto inferior direito — único elemento com cor de destaque, funcional mesmo durante o loading.
- **Bottom Navigation:** Barra com ícones reais (HOME em ciano ativo, demais em cinza).

### Princípios de Design Aplicados

| Princípio | Aplicação |
|---|---|
| **Skeleton screens vs. spinners** | Skeleton é preferível a spinners genéricos: mantém o layout estável, reduz CLS (Cumulative Layout Shift) e diminui percepção de latência |
| **Consistent layout structure** | O skeleton reflete fielmente a estrutura real da tela, sem surpresas no layout ao carregar |
| **Color hierarchy no loading** | Apenas o FAB e o ícone de notificação mantêm cor (ciano), preservando pontos de orientação funcional |
| **Progressive loading** | Três cards skeleton dão a entender que o conteúdo virá em múltiplas unidades |

### Sistema de Cores

- **Fundo:** Preto `#000000`
- **Skeleton base:** `#2C2C2E` (cinza muito escuro)
- **Skeleton shimmer (implícito):** Gradiente animado de `#2C2C2E` para `#3A3A3C`
- **Cor de destaque (FAB + notificação):** Ciano `#00CED1` / `#00BCD4` — cor de marca

### Acessibilidade e Performance

- O skeleton elimina o `layout shift` que causaria desorientação visual.
- O FAB acessível mesmo durante loading permite que usuários tentem publicar antes do feed carregar.
- **Recomendação:** Implementar animação de shimmer (brilho horizontal varrendo os blocos) para reforçar o estado de progresso e reduzir ainda mais a percepção de espera.

---

## layout-loading-profile

**Arquivo:** `layout-loading-profile.png`

### Visão Geral

Estado de carregamento da tela de perfil, também implementado com **skeleton screen** em tema escuro. Apresenta a estrutura completa do perfil — avatar, nome, estatísticas e grid de posts — em formato placeholder antes dos dados reais.

### Estrutura do Skeleton

- **Header do app:** "Pulse" + ícone de notificação (reais, visíveis).
- **Avatar:** Círculo grande (~80–100px) centralizado — reflete o avatar de destaque do perfil.
- **Nome e bio:** Duas linhas horizontais de largura decrescente, centralizadas.
- **Estatísticas:** Três retângulos menores em linha (Followers / Following / Posts) com labels invisíveis abaixo.
- **Grid de posts:** 3 colunas × 4 linhas de cards quadrados com bordas arredondadas — estrutura de galeria típica de perfis sociais.
- **Bottom Navigation:** Tab "Profile" em ciano ativo.

### Princípios de Design Aplicados

| Princípio | Aplicação |
|---|---|
| **Fidelidade estrutural** | O skeleton replica 1:1 o layout do perfil real (avatar centralizado, stats em 3 colunas, grid 3×N) |
| **Feedback de progresso** | O usuário sabe imediatamente que está em uma tela de perfil, não em um erro ou tela genérica |
| **Gradação de tamanho** | Blocos de texto com larguras decrescentes (nome > bio) imitam a natureza variável do texto real |
| **Consistência sistêmica** | Mesmo padrão de skeleton da home, criando linguagem coerente de estados de loading no app |

### Acessibilidade

- Animação de shimmer recomendada — mas deve respeitar `prefers-reduced-motion: reduce` (WCAG 2.3.3).
- A aba "Profile" destacada em ciano orienta o usuário quanto à seção atual mesmo durante o loading.

---

## layout-confirm-logout

**Arquivo:** `layout-confirm-logout.png`

### Visão Geral

Modal de confirmação de logout implementado como **bottom sheet destrutivo** sobre a tela de perfil escurecida (`overlay dim`). Padrão UX crítico para ações irreversíveis — exige confirmação explícita do usuário antes de executar.

### Hierarquia Visual

- **Fundo dimmed:** A tela de perfil ao fundo aparece escurecida (~70% opacidade preta), isolando o modal e direcionando total atenção ao conteúdo do sheet.
- **Ícone de ação:** Círculo vermelho escuro com ícone de logout (seta saindo de porta) — cor semântica de perigo/ação destrutiva.
- **Título:** `"Sair da conta?"` em bold branco, grande — pergunta direta e clara.
- **Subtítulo:** `"Tem certeza que deseja sair da sua conta?"` em cinza médio, menor — confirmação redundante positiva para evitar acidentes.
- **CTA destrutivo:** Botão `"Sair"` em vermelho/salmão full-width com bordas arredondadas — cor reforça a natureza destrutiva.
- **CTA de saída segura:** `"Cancelar"` em texto branco, sem fundo de destaque — menor peso visual, mas área de toque completa.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Bottom sheet** | Superfície `#1C1C1E`, bordas arredondadas no topo (~16px), pill de drag cinza no topo |
| **Ícone destrutivo** | Círculo com background vermelho escuro `#5C1A1A`, ícone salmão — paleta de perigo coerente |
| **Botão destrutivo** | Coral/salmão `#FF6B6B` — distinção clara do preto padrão; comunica risco sem usar vermelho puro |
| **Overlay** | Preto com opacidade ~70% — padrão `scrim` para modais |

### UX e Fluxo

- **Padrão de confirmação destrutiva:** Seguindo as diretrizes do Apple HIG e Material Design — sempre exigir confirmação para ações irreversíveis.
- A **hierarquia de CTAs** (destrutivo com cor > neutro sem cor) orienta o usuário a reconhecer a gravidade da ação sem precisar ler o texto.
- `"Cancelar"` posicionado abaixo do `"Sair"` é intencional: usuário em dúvida tende a parar e ler, reduzindo logouts acidentais.
- **Oportunidade de melhoria:** O botão `"Cancelar"` poderia ter uma borda sutil (`stroke`) para aumentar a área de toque percebida e evitar cliques perdidos no fundo.

### Sistema de Cores

- **Ícone de logout:** Fundo `#4A1010`, ícone `#FF6B6B`
- **Botão Sair:** `#FF6B6B` (coral/salmão)
- **Texto Cancelar:** Branco `#FFFFFF`
- **Sheet:** `#1C1C1E`
- **Overlay:** `rgba(0,0,0,0.7)`

### Acessibilidade

- Contraste do título branco sobre `#1C1C1E`: ≥7:1, excelente.
- Contraste do botão Sair: texto branco sobre coral — requer verificação do ratio exato (coral pode ficar próximo do limite 4.5:1).
- Tamanho dos botões: full-width garante alvos de toque superiores a 44px.

---

## layout-post-detail

**Arquivo:** `layout-post-detail.png`

### Visão Geral

Tela de detalhe de um post com imagem de destaque e seção de comentários, em tema escuro. Combina visualização de conteúdo e interação social em um único fluxo vertical.

### Hierarquia Visual

- **Nível 1 — Navegação:** `"< Back"` em branco à esquerda + título centrado `"M-Feed"` + ícone de compartilhamento à direita — estrutura de navegação 3-partes (padrão iOS).
- **Nível 2 — Imagem do post:** Imagem de paisagem larga e de alto impacto, com bordas arredondadas. Ícone de coração (outline, não preenchido) posicionado inline na imagem no canto inferior esquerdo — indica estado "não curtido".
- **Nível 3 — Seção de comentários:** Label `"Comments"` em bold branco (~18px) como separador de seção.
- **Nível 4 — Lista de comentários:** Cards de comentário com avatar letra + username bold + texto do comentário + timestamp relativo ("2h ago").
- **Nível 5 — Input de comentário:** Campo full-width na parte inferior com placeholder `"Add a comment..."` e ícone de envio à direita.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Navigation bar** | Estilo iOS nativo com botão "Back" textual, título centralizado e ação contextual |
| **Imagem do post** | Apresentada sem padding lateral, edge-to-edge; bordas arredondadas suaves |
| **Ícone de curtida na imagem** | Overlay semitransparente sobre a imagem — padrão eficaz para ações inline em mídia |
| **Linha de comentário** | Avatar 40px + nome bold + comentário em regular + timestamp em cinza — hierarquia dentro do item clara |
| **Input de comentário** | Sticky no bottom, separado visualmente da lista por linha divisória sutil |

### UX e Fluxo

- O fluxo de leitura é linear: navega da foto → ler comentários → adicionar comentário.
- O **timestamp relativo** ("2h ago", "1d ago") reduz carga cognitiva em comparação a datas absolutas.
- O ícone de curtida sobreposto na imagem é um padrão reconhecível de redes sociais visuais.
- **Oportunidade de melhoria:** Contador de curtidas ausente visualmente. Adicionar o número de curtidas próximo ao coração aumentaria o contexto social do post.
- **Oportunidade de melhoria:** Campo de comentário sticky ao fundo pode conflitar com o teclado em iOS/Android — garantir que o input sobe com o teclado (keyboard avoidance).

### Sistema de Cores

- **Fundo:** Preto `#000000`
- **Superfície dos comentários:** `#1C1C1E`
- **Avatar de comentário:** Cinza `#3A3A3C` com letra inicial branca
- **Username:** Branco bold
- **Timestamp:** Cinza `#8E8E93`
- **Ícone curtida (outline):** Branco

### Acessibilidade

- Contraste dos comentários: texto branco/cinza sobre superfície escura — passa WCAG AA.
- Input de comentário: placeholder com contraste adequado necessário (cinza muito claro pode falhar).
- Botão de envio: verificar tamanho mínimo de 44×44px.

---

## layout-edit-profile

**Arquivo:** `layout-edit-profile.png`

### Visão Geral

Tela de edição de perfil com campos de formulário minimalistas, em tema escuro. Apresenta fluxo direto para alterar foto, nome e bio do usuário.

### Hierarquia Visual

- **Nível 1 — Navegação:** `"Cancel"` em branco à esquerda (texto puro, sem borda) + `"Edit Profile"` centralizado bold + `"Save"` à direita em botão branco com borda — diferenciação clara entre ação destrutiva/neutra (Cancel) e ação construtiva (Save).
- **Nível 2 — Avatar editável:** Círculo grande (~80px) com inicial "M" sobre fundo cinza escuro, centralizado.
- **Nível 3 — "Change Photo":** Link azul abaixo do avatar — ação secundária de alteração de foto sem poluir o layout.
- **Nível 4 — Campos de formulário:** Labels acima dos inputs, campos com bordas sutis visíveis; campo Bio com altura expandida (textarea).

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Navigation actions** | Cancel (texto puro) vs. Save (botão com borda branca) — diferenciação de peso adequada |
| **Avatar interativo** | Avatar clicável com link "Change Photo" — padrão amplamente adotado (ex: iOS Contacts) |
| **Campo Name** | Input single-line com valor preenchido ("Matheus Molinari"); borda sutil visível |
| **Campo Bio** | Textarea multi-linha com texto de exemplo; altura maior sugere espaço para conteúdo longo |
| **Link "Change Photo"** | Azul `#007AFF` (link semântico iOS) — reconhecível como ação clicável |

### UX e Fluxo

- Layout **centrado verticalmente no conteúdo** com avatar como ponto focal principal — enfatiza a identidade visual do usuário.
- A separação visual entre avatar (parte superior) e campos de texto (parte inferior) cria dois blocos cognitivos distintos: "identidade visual" e "identidade textual".
- **Oportunidade de melhoria:** Ausência de feedback de validação nos campos (erro de campo vazio, limite de caracteres para Bio). Adicionar contador de caracteres no campo Bio e mensagens de erro inline melhoraria a experiência.
- **Oportunidade de melhoria:** O botão `"Save"` deveria ficar desabilitado enquanto não houver alterações, para evitar submissões desnecessárias.

### Sistema de Cores

- **Fundo:** `#0D0D0D` / `#000000`
- **Avatar fundo:** `#3A3A3C`
- **Link Change Photo:** Azul `#007AFF`
- **Labels:** Cinza claro
- **Inputs — borda:** Cinza escuro `#3A3A3C`
- **Botão Save:** Fundo branco, texto preto

### Acessibilidade

- Contraste dos labels sobre fundo escuro: requer atenção (cinza muito escuro pode não passar WCAG AA).
- Campo de Bio sem contador de caracteres pode frustrar usuários com leitores de tela.
- Botão `"Save"` com borda branca sobre fundo escuro: contraste suficiente.

---

## layout-private-profile

**Arquivo:** `layout-private-profile.png`

### Visão Geral

Tela de perfil do próprio usuário (perfil autenticado/"privado"), com acesso a edições e visualização completa do grid de posts. É a visão proprietária do perfil, distinta do perfil público.

### Hierarquia Visual

- **Nível 1 — Ação de logout:** Ícone de power/logout no canto superior direito — ação destrutiva contextual discreta mas acessível.
- **Nível 2 — Avatar:** Círculo grande (~80px) com inicial "M", centralizado.
- **Nível 3 — Identidade:** Nome em bold grande (`"Matheus Molinari"`) + handle `@ma-molinari` em cinza + bio em texto regular.
- **Nível 4 — Estatísticas:** Três valores numéricos bold em linha separados por divisórias verticais: Followers | Following | Posts.
- **Nível 5 — CTAs de edição:** Dois botões lado a lado: `"Edit Profile"` e `"Edit Password"` — bordas brancas, fundo transparente.
- **Nível 6 — Grid de posts:** Galeria 2×2 (imagens em tamanhos variados, tipo masonry parcial) com bordas arredondadas.
- **Nível 7 — Bottom Navigation:** 5 ícones; ícone de usuário ativo com borda quadrada ao redor.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Estatísticas em linha** | Três métricas com divisória vertical — padrão Instagram/Twitter consolidado |
| **Botões de edição duplos** | Lado a lado com peso visual igual — usuário tem acesso aos dois sem hierarquia entre eles |
| **Grid de posts** | Layout 2 colunas com imagens em tamanhos variados (canto superior esquerdo + inferior esquerdo menores vs. direita maior) — cria dinamismo visual |
| **Ícone de logout** | Power icon no canto superior direito — discreto para não atrapalhar a navegação, mas acessível |
| **Bottom Nav com 5 ícones** | Home, Search, Add (+), Bell (notificações), Profile — 5 itens é o limite recomendado |

### UX e Fluxo

- A diferenciação entre perfil próprio (Edit Profile + Edit Password) e perfil alheio (Follow) é clara e intuitiva.
- As **métricas de engajamento** (Followers/Following/Posts) são clickáveis implicitamente — devem navegar para listas correspondentes.
- O grid de posts com tamanhos misturados sugere um layout **masonry-like** que cria dinamismo mas pode dificultar scannability.
- **Oportunidade de melhoria:** O ícone de logout no canto superior direito, sem label, pode não ser intuitivo para todos os usuários — considerar um menu de configurações (`···` ou engrenagem) como intermediário.

### Sistema de Cores

- **Fundo:** `#000000`
- **Texto primário (nome):** Branco bold
- **Texto secundário (handle, bio):** Cinza `#8E8E93`
- **Estatísticas:** Branco bold para números, cinza para labels
- **Botões outline:** Borda branca, fundo transparente
- **Ícone Profile ativo:** Contorno de borda branca quadrada

---

## layout-create-post

**Arquivo:** `layout-create-post.png`

### Visão Geral

Modal de criação de novo post implementado como **bottom sheet** sobre o feed. Combina campo de título textual e área de upload de imagem em um formulário compacto e direto.

### Hierarquia Visual

- **Fundo:** Feed da home visível ao fundo (conteúdo parcialmente visível e escurecido) — contexto claro de sobreposição.
- **Nível 1 — Título da ação:** `"Upload your new feed image"` em bold grande (~20px), branco — ação principal clara e direta.
- **Nível 2 — Subtítulo:** `"Share a moment with the community by uploading your image."` em cinza, menor (~14px) — contexto motivacional.
- **Nível 3 — Campo Title:** Label + input single-line com placeholder.
- **Nível 4 — Área de upload:** Zona de drag-and-drop com borda pontilhada, ícone de upload (seta para cima), texto instrucional e botão `"Choose"`.
- **Nível 5 — CTAs de formulário:** `"Cancel"` e `"Save"` no rodapé — ações de confirmação/abandono.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Bottom sheet** | Superfície `#1C1C1E`, pill de drag, bordas arredondadas no topo (~16px) |
| **Área de upload (dropzone)** | Borda pontilhada (dashed), ícone centralizado, texto instrucional, botão secundário `"Choose"` — padrão web/mobile de upload file |
| **Hint de formato** | `"PNG, JPEG (Max 5 MB)"` em cinza abaixo do ícone — informação técnica necessária sem poluir visualmente |
| **Botões rodapé** | `"Cancel"` (outline) + `"Save"` (fundo branco) — diferenciação de hierarquia |

### UX e Fluxo

- O padrão **bottom sheet para criação** é eficiente: mantém o contexto do feed visível ao fundo, reduzindo a sensação de "sair do app".
- O drag-and-drop visual (borda pontilhada) comunica imediatamente a funcionalidade sem necessidade de instrução extra.
- A informação de formatos e tamanho máximo (`PNG, JPEG, Max 5MB`) reduz erros antes da submissão.
- **Oportunidade de melhoria:** Preview da imagem selecionada dentro da dropzone após escolha do arquivo melhoraria o feedback pré-submissão.
- **Oportunidade de melhoria:** Estado de loading/progresso durante o upload é essencial para evitar múltiplos cliques acidentais em `"Save"`.

### Acessibilidade

- Botão `"Choose"` deve ser acessível via teclado/VoiceOver.
- O texto instrucional dentro da dropzone deve ter contraste adequado sobre o fundo escuro.
- Tamanho dos botões de rodapé: verificar se atingem 44px de altura.

---

## layout-edit-password

**Arquivo:** `layout-edit-password.png`

### Visão Geral

Tela dedicada à alteração de senha, com layout minimalista e foco na tarefa. Apresenta apenas os dois campos necessários (senha atual e nova senha) sem distrações.

### Hierarquia Visual

- **Nível 1 — Navegação:** `"← Cancel"` com botão outline branco à esquerda + `"Save changes"` com botão outline branco à direita — estrutura simétrica de navegação destrutiva/construtiva.
- **Nível 2 — Instrução:** `"Update your password. Click save when you're done."` em cinza claro — instrução funcional direta.
- **Nível 3 — Campo Password:** Label bold + input com valor mascarado (bullets ••••••••), borda visível.
- **Nível 4 — Campo New Password:** Label bold + input mascarado, borda menos evidente.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Campos de senha** | Inputs com `type="password"`, valores mascarados com dots — padrão de segurança |
| **Borda dos inputs** | Campo "Password" com borda mais clara (ativa/focada?); "New Password" com borda mais sutil — diferenciação de estado |
| **Espaço negativo** | Metade inferior da tela vazia — escolha de design minimalista que mantém foco nos campos |
| **Botões simétricos** | Cancel e Save Changes com mesmo peso visual (ambos outline) — incomum, normalmente Save teria destaque maior |

### UX e Fluxo

- O design minimalista (apenas 2 campos) reduz a carga cognitiva ao máximo para uma tarefa sensível.
- **Ponto de atenção:** Ambos os botões (Cancel e Save changes) têm o mesmo peso visual — idealmente, `"Save changes"` deveria ter maior destaque (ex: fundo branco sólido) para orientar a ação primária.
- **Oportunidade de melhoria:** Ausência de terceiro campo "Confirm new password" — recomendado para evitar erros de digitação em campos mascarados.
- **Oportunidade de melhoria:** Ausência de toggle "Mostrar senha" — essencial em campos de senha para acessibilidade e redução de erros (WCAG 1.3.5).
- **Oportunidade de melhoria:** Indicador de força da senha (password strength meter) abaixo do campo "New Password" aumentaria a segurança percebida.

### Acessibilidade

- Campos de senha com `type="password"` devem ter `autocomplete="current-password"` e `autocomplete="new-password"` para gerenciadores de senha.
- Ausência de toggle de visibilidade da senha pode dificultar para usuários com deficiências motoras.

---

## layout-home-post-options-sheet

**Arquivo:** `layout-home-post-options-sheet.png`

### Visão Geral

Bottom sheet de opções contextuais de um post, sobreposto ao feed. Apresenta ações de gestão do post (Delete, Edit, Go to post) em formato de lista simples e clara.

### Hierarquia Visual

- **Fundo:** Feed parcialmente visível e escurecido — contexto de origem mantido.
- **Nível 1 — Título do sheet:** `"Options"` em bold branco, centralizado — identificação do contexto.
- **Nível 2 — Ação destrutiva:** `"Delete"` em vermelho/coral — cor semântica de perigo imediato.
- **Nível 3 — Ações neutras:** `"Edit"` e `"Go to post"` em branco — ações construtivas/navegacionais de mesmo peso.
- **Separadores:** Linhas divisórias horizontais sutis entre cada opção — separam claramente as ações.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Bottom sheet** | Superfície `#1C1C1E`, pill de drag, bordas arredondadas (~16px) |
| **Lista de opções** | Cada item ocupa full-width com padding generoso (~20px vertical) — alvos de toque amplos |
| **Cor destrutiva** | Vermelho/coral para "Delete" — padrão de design móvel universal para ações irreversíveis |
| **Divisórias** | Linhas `#2C2C2E` separando as opções — estrutura clara sem caixas individuais |

### UX e Fluxo

- A ordenação das opções é deliberada: **Delete primeiro** (mais perigosa), seguida de Edit e Go to post. Considerar mover Delete para baixo (convenção Apple/Google: ação destrutiva no final, próxima ao Cancel).
- Ausência de botão `"Cancel"` explícito — o usuário precisa swipe-down ou tocar fora para fechar. Adicionar `"Cancel"` como última opção seria mais acessível.
- O sheet é **contextual do post do usuário** — `"Delete"` e `"Edit"` só aparecem para posts próprios, o que é a implementação correta de permissões na UI.

### Acessibilidade

- Área de toque de cada opção: full-width com padding vertical ≥20px garante alvos de toque superiores a 44px.
- Cor vermelha para Delete deve ser acompanhada de ícone ou texto semântico (não confiar apenas na cor — WCAG 1.4.1).

---

## layout-public-profile

**Arquivo:** `layout-public-profile.png`

### Visão Geral

Tela de perfil de outro usuário (visão pública), com foco na identidade do usuário e possibilidade de seguir. Distinta do perfil próprio: substitui os botões de edição pelo botão `"Follow"`.

### Hierarquia Visual

- **Nível 1 — Navegação:** `"<"` (voltar) no canto superior esquerdo — navegação simples sem título de página, pois o nome do usuário serve como identificador.
- **Nível 2 — Avatar:** Círculo grande centralizado com inicial "M" sobre cinza.
- **Nível 3 — Identidade:** Nome bold grande + handle cinza + bio texto regular.
- **Nível 4 — Estatísticas:** Três valores em linha (1 Follower | 1 Following | 3 Posts).
- **Nível 5 — CTA principal:** Botão `"Follow"` full-width, fundo branco, texto preto bold — maior destaque do que os botões de edição do perfil próprio.
- **Nível 6 — Grid de posts:** 3 colunas iguais de posts, bordas arredondadas.
- **Nível 7 — Bottom Nav:** 5 ícones; ícone de perfil com avatar "M" no último slot.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Botão Follow** | Full-width, fundo branco sólido, texto preto — CTA primário de alto peso; contrasta com o fundo escuro |
| **Grid 3 colunas** | Layout uniforme, diferente do perfil próprio (masonry) — mais convencional e scannável |
| **Avatar no Bottom Nav** | Miniatura do avatar do usuário logado no slot Profile — reforça identidade pessoal na navegação |
| **Ausência de edit buttons** | A troca dos botões Edit por Follow comunica claramente que é um perfil alheio |

### UX e Fluxo

- A **diferenciação entre perfil próprio e alheio** é executada com maestria: mesmo layout base, CTA completamente diferente no lugar dos botões de edição.
- O botão `"Follow"` com fundo branco sólido (vs. botões outline do perfil próprio) tem mais destaque — correto, pois é a ação desejada na visão pública.
- Grid 3 colunas uniforme facilita browsing dos posts do usuário.
- **Oportunidade de melhoria:** Estado "Following" quando já seguindo o usuário — o botão deveria mudar para `"Following"` (com possibilidade de unfollow) ao ser clicado.

---

## layout-search-screen

**Arquivo:** `layout-search-screen.png`

### Visão Geral

Tela de busca de usuários com barra de pesquisa e lista de resultados, em tema escuro. Apresenta dois estados visíveis: resultados de busca (topo) e uma lista de sugestões/recentes (abaixo).

### Hierarquia Visual

- **Nível 1 — Barra de busca:** Campo full-width com ícone de lupa à esquerda, placeholder `"Search"` e botão `"Go"` à direita — estrutura padrão iOS de busca.
- **Nível 2 — Resultados de busca:** Lista de 3 usuários com avatar-letra + nome bold + handle cinza.
- **Nível 3 — Instrução de busca:** `"Try searching for people or username."` em cinza centralizado — mensagem auxiliar de orientação (empty state parcial).
- **Nível 4 — Lista de sugestões/recentes:** Segunda lista de usuários abaixo, com a mesma estrutura visual da lista de resultados.
- **Nível 5 — Bottom Nav:** Ícone de busca (lupa) ativo em branco.

### Componentes e Design

| Componente | Descrição |
|---|---|
| **Search bar** | Fundo `#2C2C2E`, bordas arredondadas, ícone de lupa inline, botão "Go" como texto — padrão iOS nativo |
| **Lista de usuários** | Avatar-inicial 40px + nome bold + handle regular cinza — hierarquia dentro do item clara |
| **Divisórias sutis** | Linhas entre itens da lista — separação sem peso visual excessivo |
| **Mensagem auxiliar** | Texto centralizado em cinza entre as duas listas — comunica que há dois estados/seções distintos |

### UX e Fluxo

- A tela parece mostrar um estado **misto**: resultados de uma busca anterior no topo + lista de usuários sugeridos/recentes abaixo. A mensagem `"Try searching for people or username."` entre as duas seções é confusa — poderia ser interpretada como estado vazio, mas há resultados acima dela.
- **Oportunidade de melhoria:** Separar as seções com headers explícitos: `"Results"` e `"Suggestions"` ou `"Recent"` para clareza.
- **Oportunidade de melhoria:** Estado vazio real (sem nenhum resultado) deveria ter ilustração + mensagem encorajadora, não apenas texto.
- O botão `"Go"` ao lado da barra de busca é redundante com o `Return` do teclado, mas válido como affordance visual para usuários menos familiarizados.

### Sistema de Cores

- **Fundo:** `#000000`
- **Search bar:** `#2C2C2E`
- **Avatares:** `#3A3A3C` com inicial branca
- **Nome:** Branco bold
- **Handle:** Cinza `#8E8E93`
- **Texto auxiliar:** Cinza `#636366`

### Acessibilidade

- Contraste dos handles (`#8E8E93` sobre `#000000`): ~4.6:1 — passa WCAG AA para texto normal ≥14px.
- Tamanho das linhas da lista: deve garantir altura mínima de 44px por item para toque confortável.
- Status bar visível (11:30, wifi, bateria) indica tela real de dispositivo capturada.

---

## Sumário de Padrões Globais

### Design System Identificado

| Token | Valor Identificado |
|---|---|
| **Tema principal** | Dark mode (`#000000` fundo, `#1C1C1E` superfícies) |
| **Cor de destaque** | Ciano `#00BCD4` (ícones ativos, FAB, bottom nav ativo na loading) |
| **Cor de ação destrutiva** | Vermelho/coral `#FF6B6B` |
| **Cor de link** | Azul `#007AFF` (padrão iOS) |
| **Superfícies elevadas** | `#1C1C1E` (cards, sheets) |
| **Texto primário** | Branco `#FFFFFF` |
| **Texto secundário** | Cinza `#8E8E93` |
| **Bordas/divisórias** | Cinza escuro `#2C2C2E` / `#3A3A3C` |
| **Border radius — cards** | ~12px |
| **Border radius — inputs** | ~8px |
| **Border radius — sheets** | ~16px no topo |

### Padrões de Interação Recorrentes

- **Bottom sheets** para ações modais e criação de conteúdo
- **Skeleton screens** para estados de loading (padrão consistente em todo o app)
- **Avatares com iniciais** como fallback universal para usuários sem foto
- **Confirmação obrigatória** para ações destrutivas (logout, delete)
- **Bottom navigation de 4–5 ícones** com estado ativo claramente diferenciado

### Oportunidades Globais de Melhoria

1. **Toggle de visibilidade de senha** ausente em todas as telas com campos de senha.
2. **Labels na bottom navigation** poderiam melhorar onboarding de novos usuários.
3. **Contadores de curtidas/comentários** ausentes no feed aumentariam o engajamento.
4. **Animações de shimmer** no skeleton screen devem respeitar `prefers-reduced-motion`.
5. **Ações destrutivas** (Delete) deveriam sempre estar no final das listas de opções, não no topo.
6. **Confirmação de nova senha** ausente na tela de edição de senha.
