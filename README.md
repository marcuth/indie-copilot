# 🚀 Indie Copilot

Copiloto de IA para **indie hackers**, em formato desktop. Planeje, valide e lance seu produto — **localmente, com privacidade e com o LLM que você quiser**.

## ✨ Funcionalidades

- **Local-first:** seus dados ficam no seu computador (SQLite), sem servidores de terceiros.
- **Multi-LLM:** qualquer provedor compatível com a API da OpenAI (OpenAI, DeepSeek, Groq, OpenRouter) ou modelos locais (Ollama, LM Studio), inclusive offline.
- **Chat com o Copilot:** converse com a IA tendo o contexto do seu projeto.
- **Planejamento estruturado**, em seções:
    - Visão geral e identidade
    - Problema e solução
    - Concorrência
    - Público-alvo e persona
    - Aquisição de usuários
    - Modelo de negócio
    - Marketing e lançamento
    - Roadmap e equipe
    - Infraestrutura
    - Finanças, riscos e SWOT
    - Notas
- **Temas** claro/escuro e configuração de provedores de IA nas configurações.

Mais detalhes de arquitetura em [`INDIE_COPILOT_SPEC.md`](./INDIE_COPILOT_SPEC.md).

## 🛠 Tech Stack

- **Desktop:** [Tauri v2](https://tauri.app/) (Rust)
- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build:** [Vite 7](https://vite.dev/)
- **Estilo:** [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Validação:** [Zod 4](https://zod.dev/) e [React Hook Form](https://react-hook-form.com/)
- **IA:** SDK [`openai`](https://github.com/openai/openai-node) com `baseURL` configurável
- **Ícones:** `react-icons` (Lucide)

## 📋 Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install)
- [Dependências do Tauri](https://tauri.app/start/prerequisites/) para o seu sistema operacional

## 🏎 Começando

```bash
# Instalar dependências
npm install

# Ambiente de desenvolvimento (app desktop)
npm run tauri dev

# Build de produção
npm run tauri build
```

Ao abrir o app, configure seu provedor de IA em **Configurações** (URL base, chave de API e modelo).

## 📁 Estrutura

```
src/
├── components/
│   ├── copilot/    # Chat com a IA
│   ├── layout/     # Sidebar e páginas de boas-vindas
│   ├── project/    # Seções de planejamento
│   ├── settings/   # Configurações e provedores de IA
│   └── ui/         # Componentes base (shadcn/ui)
├── contexts/       # Projeto ativo, tema e configurações de IA
├── hooks/          # Hooks customizados
├── lib/            # Cliente de IA, prompts e banco de dados
├── schemas/        # Schemas Zod
└── types/          # Tipos globais
src-tauri/          # Backend Rust (Tauri)
```

## 📜 Convenções

- Indentação de 4 espaços, sem ponto e vírgula, aspas duplas.
- Imports ordenados por tamanho de linha (descendente).
- Arquivos em `kebab-case`.
- Componentes de UI adicionados apenas via `npx shadcn@latest add <componente>`.

Veja o [`AGENTS.md`](./AGENTS.md) para as diretrizes completas.

## 🤖 Scripts

| Comando               | Descrição                         |
| --------------------- | --------------------------------- |
| `npm run dev`         | Servidor de desenvolvimento Vite  |
| `npm run tauri dev`   | App Tauri em modo desenvolvimento |
| `npm run build`       | Compila TypeScript e gera o build |
| `npm run lint`        | Verifica erros com ESLint         |
| `npm run lint:fix`    | Corrige problemas de lint         |
| `npm run format`      | Formata o código com Prettier     |

## 🧪 Testes (Backend)

```bash
cd src-tauri
cargo test
cargo tarpaulin   # cobertura (requer cargo-tarpaulin)
```

## 📄 Licença

[MIT](./LICENSE) © [Marcuth](https://marcuth.dev)

---

Feito com ❤️ por Marcuth.
