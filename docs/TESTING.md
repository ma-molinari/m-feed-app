# Testing Infrastructure

## Test Frameworks

**Unit / component:** Jest ^29.7 with `jest-expo` ~54.0.0 preset  
**E2E:** Not configured (sem Detox / Maestro no repositório)  
**Coverage:** `collectCoverageFrom`: `src/**/*.{ts,tsx}`; `yarn test:ci` roda `jest --ci --coverage`. Há `coverageThreshold` em `jest.config.js` para arquivos críticos: `src/services/api/client.ts` e `src/store/authStore.ts`.

## Test Organization

**Location:** `__tests__/` na raiz do repositório  
**Naming:** `*.test.ts` / `*.test.tsx`  
**Helpers:** `__tests__/helpers/` (ex.: `axiosLikeError.ts` para erros no formato Axios em telas de auth)

## Suites atuais

| Arquivo                   | Escopo                                                                                                                                                          |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `App.test.tsx`            | Smoke do `QueryClientProvider`                                                                                                                                  |
| `LoginScreen.test.tsx`    | Formulário, navegação para Register, sucesso e erros de API                                                                                                     |
| `RegisterScreen.test.tsx` | Fluxo de registro e erros                                                                                                                                       |
| `authApi.test.ts`         | `login()` — validação de envelope e `InvalidLoginResponseError`                                                                                                 |
| `apiClient.test.ts`       | Interceptors: Bearer, 401 → `signOut`, `skipGlobal401Handler` (axios stub em `__tests__/mocks/axiosStub.js` para evitar o adapter fetch do axios sob Jest/Expo) |
| `RootNavigator.test.tsx`  | Com token / sem token → árvore principal vs auth (navegadores mockados)                                                                                         |
| `authStore.test.ts`       | `setSession` e `signOut` no estado Zustand                                                                                                                      |

## Testing Patterns

**Componentes:** `@testing-library/react-native`, `SafeAreaProvider` com métricas fixas onde necessário, `jest.mock` de navegação e de serviços (`authApi` nas telas de login/register).

**Globais:** `jest.setup.js` — mock de `react-native-mmkv`, `@shopify/flash-list` → `FlatList`, `expo-image` → `View`.

## Comandos

- `yarn test` — Jest local
- `yarn test:ci` — modo CI com cobertura e thresholds nos arquivos listados acima

**Configuração:** `jest.config.js` — `testMatch`, `setupFilesAfterEnv`, `coverageThreshold`.

## Limitações (alinhado a `docs/CONCERNS.md`)

- Cobertura geral do `src/` continua baixa fora dos módulos acima; feed, profile e search dependem sobretudo de testes manuais ou futura camada E2E.
- Não há E2E automatizado; regressões de navegação real ou binários nativos não são validadas no CI atual.
