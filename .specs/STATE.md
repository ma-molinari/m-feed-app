# State

**Last Updated:** 2026-04-01
**Current Work:** M-Feed App — Setup spec-driven workflow (Specify phase)

---

## Recent Decisions (Last 60 days)

### AD-001: Feature-oriented source layout (2026-04-01)

**Decision:** Manter o padrão de módulos por feature em `src/features/<domain>/` com infraestrutura compartilhada em `src/services`, `src/store`, `src/theme`.  
**Reason:** Já estabelecido na codebase; coesão por domínio facilita onboarding e manutenção.  
**Trade-off:** Alguma duplicação de utilitários entre features em troca de menor acoplamento.  
**Impact:** Novas features devem seguir o padrão `screens/`, `hooks/`, `services/`, `types/` dentro de `src/features/<nome>/`.

### AD-002: TanStack Query como camada de cache remoto (2026-04-01)

**Decision:** React Query (TanStack Query) para toda comunicação com a API — sem chamadas diretas a `apiClient` em componentes.  
**Reason:** Já configurado com `QueryClientProvider` no `App.tsx`; oferece cache, invalidação e estados de loading/error.  
**Trade-off:** Curva de aprendizado em estratégias de invalidação.  
**Impact:** Cada feature deve definir query keys estáveis e invalidar queries relacionadas após mutações.

### AD-003: Spec único cobrindo o app inteiro (2026-04-01)

**Decision:** Um único `spec.md` em `.specs/features/m-feed-app/` cobrindo todos os domínios funcionais do app.  
**Reason:** O PRD (`.spec/docs/overview.md`) já consolida todos os requisitos em um documento; fragmentar em specs por feature seria redundante neste momento.  
**Trade-off:** Spec mais extenso; compensado por rastreabilidade centralizada dos IDs de requisito.  
**Impact:** design.md e tasks.md também serão únicos, organizados por domínio.

---

## Active Blockers

### B-001: Autenticação não conectada à API real

**Discovered:** 2026-04-01  
**Impact:** Alto — `LoginScreen` chama `setToken('demo-token')` diretamente; backend JWT não é exercitado.  
**Workaround:** Fluxo de login funciona visualmente mas não autentica de fato.  
**Resolution:** Implementar `login(payload)` em `authApi.ts`, conectar em `LoginScreen` ou hook dedicado, tratar erros e persistir token retornado.

### B-002: Feed query desabilitada e UI desconectada da API

**Discovered:** 2026-04-01  
**Impact:** Alto — `useFeedItems.ts` tem `enabled: false`; `FeedScreen` usa array placeholder vazio.  
**Workaround:** Tela de feed renderiza, mas sempre vazia.  
**Resolution:** Habilitar query quando token e `apiUrl` existirem; mapear `FeedItem` para o FlashList; implementar loading/error states.

---

## Lessons Learned

_Nenhuma lição registrada ainda._

---

## Deferred Ideas

- [ ] Notificações push via SSE (`/api/notifications`) — capturado do PRD seção 7 (Out of Scope v1)
- [ ] Feed algorítmico (não-cronológico) — capturado do PRD seção 7
- [ ] Stories, vídeos, formatos além de imagem estática — capturado do PRD seção 7
- [ ] Sistema de mensagens diretas (DM) — capturado do PRD seção 7

---

## Todos

- [ ] Remover `expo-sqlite` do `package.json` e `app.json` (sem uso em `src/`)
- [ ] Resolver dual lockfiles: escolher npm ou Yarn e deletar o outro
- [ ] Expandir cobertura de testes: navegadores, `apiClient`, feed
- [ ] Adicionar assertion/log de startup quando `EXPO_PUBLIC_API_URL` estiver vazio
