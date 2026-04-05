# Concerns

Riscos e gaps com respaldo em código ou config; itens sem evidência foram omitidos.

---

## Medium — expo-sqlite declarado sem uso

**Evidência:** `expo-sqlite` em `package.json` e `app.json` `plugins`; nenhum import em `src/`.  
**Impacto:** Superfície nativa desnecessária (maior binário, tempo de build, manutenção).  
**Fix:** Remover plugin e dependência até que um banco local seja de fato necessário, ou implementar a persistência planejada.

---

## Medium — Cobertura de testes muito baixa para a base atual

**Evidência:** Apenas `__tests__/LoginScreen.test.tsx` e `__tests__/App.test.tsx`; sem testes para os novos navigators (`TabNavigator`, `MainNavigator`), `apiClient`, feed, create, profile ou search.  
**Impacto:** Regressões em roteamento, mutações otimistas ou fluxos de API podem passar despercebidas.  
**Fix:** Adicionar testes de integração com MSW ou Axios mockado para as mutações do feed (`useFeedMutations`) e o handler de 401; testes rasps para o split de autenticação no `RootNavigator`.

---

## Medium — Tabs com cor hardcoded fora do sistema de tokens

**Evidência:** `TabNavigator.tsx` usa `'#000000'`, `'#FFFFFF'` e `'rgba(255,255,255,0.4)'` diretamente em `tabBarStyle` e `screenOptions`.  
**Impacto:** Se o tema mudar, a tab bar fica desalinhada com as demais telas.  
**Fix:** Substituir por `colors.dark.background` (já disponível em `@theme/colors`) e tokens equivalentes para tint/inactive.

---

## Low — `useAuth` hook é um pass-through

**Evidência:** `src/features/auth/hooks/useAuth.ts` apenas re-exporta `useAuthStore`.  
**Impacto:** Indireção mínima; pode esconder lógica futura de orquestração se não for expandida.  
**Fix:** Ou consolidar callers em `@store/authStore`, ou crescer o hook com login/logout via API.

---

## Low — Base URL vazia produz URLs relativas silenciosamente

**Evidência:** `apiClient` usa `baseURL: env.apiUrl || undefined`; configuração incorreta resulta em URLs relativas ou falhas de request dependendo da plataforma.  
**Impacto:** Falhas sutis em runtime se `EXPO_PUBLIC_API_URL` / native config estiver ausente.  
**Fix:** Asserção ou log de inicialização opcional quando `apiUrl` estiver vazio em builds que não sejam de teste.

---

## Low — Dual lockfiles

**Evidência:** `package-lock.json` e `yarn.lock` presentes na raiz do projeto.  
**Impacto:** Instalações inconsistentes entre máquinas e CI.  
**Fix:** Escolher npm ou Yarn, remover o lockfile do outro, e documentar a escolha no onboarding.

---

## Resolvido ✓ — Auth real implementada

_(Anteriormente High)_ `authApi.ts` e `LoginScreen` agora chamam `POST /public/login`; token e `user` são persistidos via `useAuthStore.setSession`.

## Resolvido ✓ — Feed wired com API real

_(Anteriormente High)_ `useFeed` / `useExploreFeed` são queries infinitas ativas; `FeedScreen` consome `useFeed()`, `useLikedPosts()` e `useFeedMutations()` com optimistic updates.
