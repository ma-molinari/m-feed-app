# M-Feed

> App mobile (Expo / React Native) de feed social: autenticação, posts, comentários, likes, perfis e busca de usuários, integrado a uma API REST configurável.

## Por que existe

O M-Feed é o cliente iOS/Android (e web opcional) para consumir o backend documentado no repositório: sessão com Bearer token, feed paginado, criação de posts com upload de mídia e fluxos de perfil e descoberta. O código é organizado por **features** (`auth`, `feed`, `create`, `profile`, `search`) com serviços e estado compartilhados.

## Screenshots

<img src="assets/screenshots/login.png" alt="Login - M-Feed" width="400">
<img src="assets/screenshots/home.png" alt="Home - M-Feed" width="400">

## Pré-requisitos

- **Node.js** compatível com Expo SDK 54 (recomendado: LTS atual)
- **npm** ou **Yarn** — o repositório pode conter mais de um lockfile; escolha um gerenciador e use só o lockfile correspondente para evitar instalações divergentes (ver [docs/CONCERNS.md](docs/CONCERNS.md))
- Para builds nativos locais: Xcode (iOS) e/ou Android SDK (Android)
- **Conta Expo / EAS** (opcional) para perfis de build em [eas.json](eas.json)

## Início rápido

```bash
git clone <url-do-repositorio>
cd m-feed-app
npm install
# ou: yarn install
```

Configure a URL da API (obrigatório para chamadas HTTP) e, se o backend servir mídia em outro host ou path, a base de imagens:

1. Crie um arquivo `.env` na raiz (os padrões `.env*` estão no `.gitignore`).
2. Defina pelo menos a API; opcionalmente a base de URLs de imagem dos posts:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
# Base para caminhos relativos de imagens (ex.: arquivos estáticos). Se vazio, o app usa a URL da API.
EXPO_PUBLIC_IMAGE_URL=https://api.example.com/static
```

Um modelo comentado está em [`.env.example`](.env.example).

3. Suba o bundler com cache limpo após mudar variáveis:

```bash
npx expo start -c
```

No **emulador Android**, use `http://10.0.2.2:<porta>` em vez de `localhost`. Em **produção**, a URL vazia faz o app falhar na inicialização por design (evita release sem backend). Detalhes em [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

## Scripts

| Comando                     | Descrição                             |
| --------------------------- | ------------------------------------- |
| `npm run start`             | Metro / Expo dev server               |
| `npm run ios`               | Build e execução iOS (`expo run:ios`) |
| `npm run android`           | Build e execução Android              |
| `npm run web`               | Expo para web                         |
| `npm run prebuild`          | `expo prebuild` (nativo)              |
| `npm run lint` / `lint:fix` | ESLint                                |
| `npm run format`            | Prettier (write)                      |
| `npm run typecheck`         | TypeScript `--noEmit`                 |
| `npm test`                  | Jest                                  |
| `npm run test:ci`           | Jest em CI com cobertura              |

Hooks Git (Husky + lint-staged) rodam lint e format em arquivos staged.

## Stack (resumo)

- **Expo ~54**, **React Native 0.81**, **React 19**, **TypeScript** (strict)
- **Navegação:** React Navigation 7 (stack estático, tabs, modais sobre tabs)
- **Estado:** Zustand + persistência MMKV; **servidor:** TanStack React Query
- **HTTP:** Axios com interceptors (Bearer, 401 → logout)
- **UI:** tokens em `src/theme/`, FlashList, expo-image

Lista completa e versões em [docs/STACK.md](docs/STACK.md).

## Onde está o quê

- **`App.tsx`** — entrada; providers (Query Client, safe area) e `RootNavigator`
- **`src/features/*`** — telas, hooks e APIs por domínio
- **`src/navigation/*`** — auth vs app autenticado, tabs e stack modal
- **`src/services/api/`** — cliente HTTP e erros tipados
- **`src/store/`** — auth persistida (`authStore`, MMKV)

Árvore detalhada e arquivos-chave em [docs/STRUCTURE.md](docs/STRUCTURE.md). Padrões de navegação, auth e React Query em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Documentação do repositório

| Documento                                    | Conteúdo                                  |
| -------------------------------------------- | ----------------------------------------- |
| [docs/STACK.md](docs/STACK.md)               | Versões, dependências, ferramentas        |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Navegação, estado, padrões de API e cache |
| [docs/STRUCTURE.md](docs/STRUCTURE.md)       | Pastas, módulos e “onde fica X”           |
| [docs/CONVENTIONS.md](docs/CONVENTIONS.md)   | Estilo e organização de código            |
| [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) | Env, API, EAS, MMKV, endpoints usados     |
| [docs/TESTING.md](docs/TESTING.md)           | Jest, RTL, estrutura de testes            |
| [docs/CONCERNS.md](docs/CONCERNS.md)         | Riscos conhecidos e dívida técnica        |

Especificações de produto, layouts e contratos de referência ficam em **`.specs/`** (por exemplo `.specs/docs/overview.md` e `.specs/features/m-feed-app/`). Não entram no bundle do app.

## Testes

Testes vivem em `__tests__/`. Comandos: `npm test` e `npm run test:ci` (cobertura e thresholds em arquivos críticos da API e auth). Ver [docs/TESTING.md](docs/TESTING.md).

## Build e release

Perfis EAS em `eas.json` (`development`, `preview`, `production`). Metadados e plugins nativos em `app.json` / `app.config.js`. Fluxo completo em [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).

---

**Nome no app:** M-Feed (`app.json`). **Pacote:** `m-feed-app` (privado).
