# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Indie Copilot is a local-first desktop app (Tauri v2 + React 19 + TypeScript + Vite 7 + Tailwind 4) that helps indie hackers plan a product and chat with an LLM that knows the project. The UI is in Brazilian Portuguese; keep new user-facing strings in pt-BR.

## Commands

```bash
npm run tauri dev        # the real app (Vite on fixed port 1420 + Rust backend)
npm run tauri build      # production bundle (.exe/.msi/etc.)
npm run build            # tsc + vite build (frontend only; also the CI build check)
npm run lint             # eslint .        (npm run lint:fix to autofix)
npm run format           # prettier --write .
npm run ci               # lint + prettier --check

cd src-tauri && cargo test                                   # all Rust tests
cd src-tauri && cargo test --lib db::tests::batch_commits_all_statements   # one test
cd src-tauri && cargo clippy -- -D warnings                  # CI runs this
cd src-tauri && cargo fmt
```

- There is no frontend test framework. Rust tests live next to the code (`src-tauri/src/db.rs`, `files.rs`) and the project aims for full coverage of the Rust backend.
- `npm run dev` alone (plain browser) cannot work: the app needs Tauri's `invoke` to open the database and will show the "Não foi possível abrir o banco de dados" screen. Always use `npm run tauri dev`.
- CI (`.github/workflows/ci.yml`) runs `lint:fix`, `format` and `cargo fmt` and pushes a `chore: auto format and lint fix [skip ci]` commit to the branch, so the remote is often one commit ahead. `git pull --rebase` before pushing.

## Conventions

- **Formatting** (Prettier, see `.prettierrc`): 4 spaces, no semicolons, double quotes, trailing commas, imports sorted by line length descending (third-party first, then relative). Run `npm run format` before committing, along with `npm run lint` and `npm run build`.
- **TypeScript** is strict with `noUnusedLocals/Parameters`: no `any` (use `unknown`), explicit return types on functions, `interface` for object shapes, no `I` prefix.
- **Naming**: files in kebab-case (hooks too, e.g. `use-copilot-chat.ts`), components in PascalCase, constants and enum values in SCREAMING_SNAKE_CASE.
- **React**: functional components; `useCallback`/`useMemo` only when there is a measurable benefit. Context providers live in `src/contexts/`.
- **Validation**: external data (backup files, forms) is validated with Zod v4 schemas in `src/schemas/`.
- **Icons**: `react-icons/lu` (Lucide) in app code. **Styling**: Tailwind 4 utilities, custom CSS only in `App.css`.
- **Rust**: snake_case, Tauri v2 plugins for system integration.

## Architecture

### Data layer: SQLite behind a synchronous in-memory cache

- **Rust** (`src-tauri/src/db.rs`, `lib.rs`): a single `rusqlite` connection (bundled SQLite, WAL, `foreign_keys=ON`) in the app data dir (`indie-copilot.db`). The schema is the `SCHEMA` constant (`CREATE TABLE IF NOT EXISTS` plus `PRAGMA user_version`); there is no migration framework, so adding a column to an existing table needs an explicit `ALTER TABLE` step in `db::init`. Tauri commands: `db_select`, `db_execute`, `db_batch` (one transaction, all-or-nothing) and `save_text_file`.
- **Frontend** (`src/lib/db/database-client.ts`, `sqlite.ts`): the whole database is loaded into an in-memory cache by `initDatabase()`, which `src/main.tsx` awaits before rendering anything. The exported API (`getProjects`, `createNote`, ...) stays **synchronous**; every write updates the cache and is persisted through an ordered promise queue (`persist`, `flushDatabase`). Getters return clones, so callers can mutate results freely. Use upsert (`ON CONFLICT DO UPDATE`), never `INSERT OR REPLACE`: replacing a project row would cascade-delete its sessions, messages and notes.
- Row <-> object mapping (`projectToRow`/`rowToProject`, ...) lives in `database-client.ts`. Categories are not stored: `DEFAULT_CATEGORIES` / `DEFAULT_NOTE_CATEGORIES` are resolved from `categoryId` at read time.
- **Legacy migration**: data used to live in `localStorage` (`indie-copilot:*` keys). On first launch per origin, `migrateFromLocalStorage` copies it into SQLite in one `INSERT OR IGNORE` transaction, sets `indie-copilot:sqlite-migrated-at`, and never deletes the localStorage data. `tauri dev` (origin `http://localhost:1420`) and the built app (`tauri.localhost`) have different localStorage, but share the same SQLite file.
- **Backup/restore** (`src/schemas/backup.ts`, `backup-file.ts`, `components/settings/backup-settings.tsx`): versioned JSON mirroring the tables, validated with Zod; also accepts the legacy `indie-copilot:*` backup format. Restore replaces everything in a single transaction. Saving uses the native "Save as" dialog (`tauri-plugin-dialog`) plus `save_text_file`.

### Planning sections

A project's planning content is stored as **JSON strings in columns of the `projects` table** (`problemSolution`, `targetAudience`, `competition`, `swot`, `businessModel`, `financials`, `risks`, `userAcquisition`, `marketing`, `roadmap`, `team`, `infrastructure`). Each page under `src/components/project/<section>/` renders through `SectionPage` (`section-page.tsx`), which owns the edit/save state and receives the section's `fieldKey`; the page parses/serializes its own JSON and validates with the Zod schemas in `src/schemas/planning.ts` (types in `src/types/index.ts`).

`src/lib/planning.ts` is the single source for planning categories (sidebar grouping) and the progress calculation (`isPlanningSectionFilled` ignores values the UI fills automatically, such as `currencyCode`). Adding a section touches: the `Project` type and `PLANNING_COLUMNS` mapping + `projects` schema column, `src/lib/planning.ts`, the route in `App.tsx`, `planning-pages.tsx`, the Copilot prompt (`lib/ai/prompt-builder.ts`), and `ReferencePageKey` in `src/lib/references.ts`.

### Copilot chat

`hooks/use-copilot-chat.ts` streams from the `openai` SDK with a configurable `baseURL` (`lib/ai/client-factory.ts`), so any OpenAI-compatible or local provider works. The system prompt (`lib/ai/prompt-builder.ts`) embeds the whole project, with planning sections as raw JSON. It deliberately tells the model **not** to answer with JSON blocks, since the app has no place to paste them. Replies render through `components/copilot/markdown-content.tsx` (react-markdown + GFM, links opened via the Tauri opener). The chat panel is a `Sheet` that can expand into a `Dialog` while keeping state.

### Other pieces worth knowing

- **References** (`lib/references.ts`, `components/project/references-sheet.tsx`): a static, hand-edited map of links per page. YouTube links get a thumbnail and play in an iframe inside the expanded dialog.
- **Project logos** (`lib/logo.ts`): only square PNG/JPG/WebP images are accepted; they are resized to 256x256 WebP and stored as a data URL in `projects.logo`.
- **Providers/settings**: AI providers (including API keys, stored in plain text) and theme live in SQLite; `contexts/` holds the active project, theme and AI-settings providers.
- **UI components** in `src/components/ui` were ported to this project's design system and intentionally differ from what `npx shadcn@latest add` generates (e.g. `Button` only has the `default | sm | lg | icon` sizes). Match the existing components rather than regenerating them. The app-level custom ones (`bubble`, `message`, `message-scroller`, `input-group`, `tag-input`) are not part of that set.

## Gotchas

- The `tauri` crate and `@tauri-apps/api` must be on the same major.minor, or `tauri build` refuses to run (currently 2.12). Bump them together, including plugin crates/packages.
- After changing npm dependencies while `tauri dev` is running, restart it: Vite otherwise answers `504 Outdated Optimize Dep` for the new bundle and the window stays blank.
- `src-tauri/target/debug` grows fast across dependency bumps (it reached 11 GB and filled the disk). `cargo clean --profile dev` is safe to run when space gets tight.
- Tauri's webview has no CSP configured (`csp: null`) and the app calls LLM providers directly from the browser context (`dangerouslyAllowBrowser`); keep that in mind before adding code that renders untrusted HTML.
