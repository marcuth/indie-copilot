import {
    BACKUP_FORMAT,
    BACKUP_VERSION,
    countBackup,
    normalizeBackupData,
    type BackupCounts,
    type BackupData,
    type BackupFile,
} from "../../schemas/backup"
import type {
    AiProvider,
    AppSettings,
    Project,
    ProjectCategory,
    ChatSession,
    ChatMessage,
    ProjectNote,
    ProjectNoteCategory,
} from "../../types"
import {
    dbBatch,
    dbSelect,
    insertIgnoreStatement,
    upsertStatement,
    type SqlRow,
    type SqlStatement,
    type SqlValue,
} from "./sqlite"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): string {
    return new Date().toISOString()
}

function generateId(): string {
    return crypto.randomUUID()
}

function clone<T>(value: T): T {
    return structuredClone(value)
}

function text(value: unknown): string | undefined {
    return typeof value === "string" ? value : undefined
}

function requiredText(value: unknown): string {
    return typeof value === "string" ? value : ""
}

function optional(value: string | undefined): string | null {
    return value ?? null
}

// ─── Cache em memória ─────────────────────────────────────────────────────────
//
// O SQLite é a fonte de verdade. Na inicialização (initDatabase) tudo é lido
// para a memória, o que mantém a API abaixo síncrona. Cada escrita atualiza o
// cache e grava no banco imediatamente, em ordem, através de uma fila.

interface Cache {
    settings: AppSettings | null
    providers: AiProvider[]
    projects: Project[]
    sessions: ChatSession[]
    messages: ChatMessage[]
    notes: ProjectNote[]
}

const cache: Cache = {
    settings: null,
    providers: [],
    projects: [],
    sessions: [],
    messages: [],
    notes: [],
}

let writeQueue: Promise<void> = Promise.resolve()

function persist(statements: SqlStatement[]): void {
    if (statements.length === 0) return

    writeQueue = writeQueue
        .then(() => dbBatch(statements))
        .catch((error: unknown) => {
            console.error("Falha ao gravar no banco de dados", error)
        })
}

/** Aguarda todas as gravações pendentes terminarem. */
export function flushDatabase(): Promise<void> {
    return writeQueue
}

// ─── Mapeamento linha <-> objeto ──────────────────────────────────────────────

const PLANNING_COLUMNS = [
    ["problemSolution", "problem_solution"],
    ["targetAudience", "target_audience"],
    ["businessModel", "business_model"],
    ["userAcquisition", "user_acquisition"],
    ["marketing", "marketing"],
    ["competition", "competition"],
    ["team", "team"],
    ["roadmap", "roadmap"],
    ["infrastructure", "infrastructure"],
    ["risks", "risks"],
    ["swot", "swot"],
    ["financials", "financials"],
] as const

function projectToRow(project: Project): Record<string, SqlValue> {
    const row: Record<string, SqlValue> = {
        id: project.id,
        name: project.name,
        description: optional(project.description),
        website: optional(project.website),
        slogan: optional(project.slogan),
        already_exists: project.alreadyExists ? 1 : 0,
        logo: optional(project.logo),
        category_id: optional(project.categoryId),
        created_at: project.createdAt,
        updated_at: project.updatedAt,
    }

    for (const [field, column] of PLANNING_COLUMNS) {
        row[column] = optional(project[field])
    }

    return row
}

function rowToProject(row: SqlRow): Project {
    const categoryId = text(row.category_id)

    const project: Project = {
        id: requiredText(row.id),
        name: requiredText(row.name),
        description: text(row.description),
        website: text(row.website),
        slogan: text(row.slogan),
        alreadyExists: Number(row.already_exists) === 1,
        logo: text(row.logo),
        categoryId,
        category: resolveCategory(DEFAULT_CATEGORIES, categoryId),
        createdAt: requiredText(row.created_at),
        updatedAt: requiredText(row.updated_at),
    }

    for (const [field, column] of PLANNING_COLUMNS) {
        project[field] = text(row[column])
    }

    return project
}

function providerToRow(provider: AiProvider): Record<string, SqlValue> {
    return {
        id: provider.id,
        name: provider.name,
        base_url: provider.baseUrl,
        api_key: optional(provider.apiKey),
        default_model: provider.defaultModel,
        is_default: provider.isDefault ? 1 : 0,
        created_at: provider.createdAt,
        updated_at: provider.updatedAt,
    }
}

function rowToProvider(row: SqlRow): AiProvider {
    return {
        id: requiredText(row.id),
        name: requiredText(row.name),
        baseUrl: requiredText(row.base_url),
        apiKey: text(row.api_key),
        defaultModel: requiredText(row.default_model),
        isDefault: Number(row.is_default) === 1,
        createdAt: requiredText(row.created_at),
        updatedAt: requiredText(row.updated_at),
    }
}

function sessionToRow(session: ChatSession): Record<string, SqlValue> {
    return {
        id: session.id,
        project_id: session.projectId,
        title: session.title,
        created_at: session.createdAt,
        updated_at: session.updatedAt,
    }
}

function rowToSession(row: SqlRow): ChatSession {
    return {
        id: requiredText(row.id),
        projectId: requiredText(row.project_id),
        title: requiredText(row.title),
        createdAt: requiredText(row.created_at),
        updatedAt: requiredText(row.updated_at),
        messages: [],
    }
}

function messageToRow(message: ChatMessage): Record<string, SqlValue> {
    return {
        id: message.id,
        session_id: message.sessionId,
        role: message.role,
        content: message.content,
        context_used: optional(message.contextUsed),
        model_used: optional(message.modelUsed),
        created_at: message.createdAt,
    }
}

function rowToMessage(row: SqlRow): ChatMessage {
    return {
        id: requiredText(row.id),
        sessionId: requiredText(row.session_id),
        role: requiredText(row.role) as ChatMessage["role"],
        content: requiredText(row.content),
        contextUsed: text(row.context_used),
        modelUsed: text(row.model_used),
        createdAt: requiredText(row.created_at),
    }
}

function noteToRow(note: ProjectNote): Record<string, SqlValue> {
    return {
        id: note.id,
        project_id: note.projectId,
        content: note.content,
        category_id: optional(note.categoryId),
        created_at: note.createdAt,
        updated_at: note.updatedAt,
    }
}

function rowToNote(row: SqlRow): ProjectNote {
    const categoryId = text(row.category_id)

    return {
        id: requiredText(row.id),
        projectId: requiredText(row.project_id),
        content: requiredText(row.content),
        categoryId,
        category: resolveNoteCategory(DEFAULT_NOTE_CATEGORIES, categoryId),
        createdAt: requiredText(row.created_at),
        updatedAt: requiredText(row.updated_at),
    }
}

// ─── Inicialização e migração do localStorage ────────────────────────────────

const LEGACY_KEYS = {
    SETTINGS: "indie-copilot:settings",
    PROVIDERS: "indie-copilot:providers",
    PROJECTS: "indie-copilot:projects",
    SESSIONS: "indie-copilot:sessions",
    MESSAGES: "indie-copilot:messages",
    NOTES: "indie-copilot:notes",
} as const

const MIGRATION_FLAG = "indie-copilot:sqlite-migrated-at"
const SETTINGS_KEY = "app"

export interface MigrationReport extends BackupCounts {
    skipped: number
}

function readLegacy<T>(key: string): T | null {
    try {
        const raw = localStorage.getItem(key)
        return raw ? (JSON.parse(raw) as T) : null
    } catch {
        return null
    }
}

function asArray<T>(value: T[] | null): T[] {
    return Array.isArray(value) ? value : []
}

/** Instruções INSERT OR IGNORE para todos os dados (a ordem respeita as chaves estrangeiras). */
function buildInsertStatements(data: BackupData): SqlStatement[] {
    const statements: SqlStatement[] = [
        ...data.projects.map((p) =>
            insertIgnoreStatement("projects", projectToRow(p)),
        ),
        ...data.providers.map((p) =>
            insertIgnoreStatement("ai_providers", providerToRow(p)),
        ),
        ...data.sessions.map((s) =>
            insertIgnoreStatement("chat_sessions", sessionToRow(s)),
        ),
        ...data.messages.map((m) =>
            insertIgnoreStatement("chat_messages", messageToRow(m)),
        ),
        ...data.notes.map((n) =>
            insertIgnoreStatement("project_notes", noteToRow(n)),
        ),
    ]

    if (data.settings) {
        statements.push(
            insertIgnoreStatement("settings", {
                key: SETTINGS_KEY,
                value: JSON.stringify(data.settings),
            }),
        )
    }

    return statements
}

/**
 * Copia os dados que estavam no localStorage para o SQLite.
 *
 * - Nunca apaga nem altera o localStorage (ele continua como cópia de segurança).
 * - Tudo é gravado em uma única transação com INSERT OR IGNORE: se algo falhar
 *   nada é gravado e a migração roda de novo na próxima abertura, sem duplicar.
 */
async function migrateFromLocalStorage(): Promise<MigrationReport | null> {
    if (localStorage.getItem(MIGRATION_FLAG)) return null

    const { data, skipped } = normalizeBackupData({
        projects: asArray(readLegacy<Project[]>(LEGACY_KEYS.PROJECTS)),
        providers: asArray(readLegacy<AiProvider[]>(LEGACY_KEYS.PROVIDERS)),
        sessions: asArray(readLegacy<ChatSession[]>(LEGACY_KEYS.SESSIONS)),
        messages: asArray(readLegacy<ChatMessage[]>(LEGACY_KEYS.MESSAGES)),
        notes: asArray(readLegacy<ProjectNote[]>(LEGACY_KEYS.NOTES)),
        settings: readLegacy<AppSettings>(LEGACY_KEYS.SETTINGS),
    })

    const statements = buildInsertStatements(data)
    if (statements.length > 0) {
        await dbBatch(statements)
    }

    localStorage.setItem(MIGRATION_FLAG, now())

    return { ...countBackup(data), skipped }
}

async function loadCache(): Promise<void> {
    const [settings, providers, projects, sessions, messages, notes] =
        await Promise.all([
            dbSelect("SELECT value FROM settings WHERE key = ?1", [
                SETTINGS_KEY,
            ]),
            dbSelect("SELECT * FROM ai_providers ORDER BY created_at"),
            dbSelect("SELECT * FROM projects ORDER BY created_at"),
            dbSelect("SELECT * FROM chat_sessions ORDER BY created_at"),
            dbSelect("SELECT * FROM chat_messages ORDER BY created_at, rowid"),
            dbSelect("SELECT * FROM project_notes ORDER BY created_at"),
        ])

    cache.settings = settings[0]
        ? (JSON.parse(requiredText(settings[0].value)) as AppSettings)
        : null
    cache.providers = providers.map(rowToProvider)
    cache.projects = projects.map(rowToProject)
    cache.sessions = sessions.map(rowToSession)
    cache.messages = messages.map(rowToMessage)
    cache.notes = notes.map(rowToNote)
}

let initialization: Promise<MigrationReport | null> | null = null

/**
 * Abre o banco, migra os dados antigos do localStorage (uma única vez por
 * origem) e carrega tudo para a memória. Deve ser aguardada antes de renderizar.
 */
export function initDatabase(): Promise<MigrationReport | null> {
    initialization ??= (async () => {
        const report = await migrateFromLocalStorage()
        await loadCache()

        if (report) {
            console.info("Dados migrados do localStorage para o SQLite", report)
        }

        return report
    })()

    return initialization
}

// ─── Backup e restauração ────────────────────────────────────────────────────

function withoutCategory<T extends { category?: unknown }>(item: T): T {
    const copy = { ...item }
    delete copy.category
    return copy
}

/** Backup completo, espelhando as tabelas do banco. */
export function exportBackup(): BackupFile {
    return {
        format: BACKUP_FORMAT,
        version: BACKUP_VERSION,
        exportedAt: now(),
        data: {
            settings: cache.settings ? clone(cache.settings) : null,
            providers: getProviders(),
            // a categoria é derivada de categoryId, então não vai no arquivo
            projects: getProjects().map(withoutCategory),
            sessions: cache.sessions.map((session) => ({
                ...clone(session),
                messages: [],
            })),
            messages: getMessages(),
            notes: getNotes().map(withoutCategory),
        },
    }
}

/**
 * Substitui TODOS os dados do banco pelos do backup, em uma única transação:
 * se algo falhar, os dados atuais permanecem intactos.
 */
export async function restoreBackup(data: BackupData): Promise<void> {
    await flushDatabase()

    await dbBatch([
        // sessões, mensagens e notas saem em cascata junto com os projetos
        { sql: "DELETE FROM projects" },
        { sql: "DELETE FROM ai_providers" },
        { sql: "DELETE FROM settings" },
        ...buildInsertStatements(data),
    ])

    await loadCache()
}

// ─── AppSettings ──────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
    if (cache.settings) return clone(cache.settings)

    return {
        id: "default",
        theme: "system",
        language: "pt-BR",
        createdAt: now(),
        updatedAt: now(),
    }
}

export function saveSettings(
    data: Partial<Omit<AppSettings, "id" | "createdAt">>,
): AppSettings {
    const current = getSettings()
    const updated: AppSettings = { ...current, ...data, updatedAt: now() }
    cache.settings = updated
    persist([
        upsertStatement(
            "settings",
            { key: SETTINGS_KEY, value: JSON.stringify(updated) },
            "key",
        ),
    ])
    return clone(updated)
}

// ─── AiProvider ───────────────────────────────────────────────────────────────

export function getProviders(): AiProvider[] {
    return clone(cache.providers)
}

function persistProviders(): void {
    persist(
        cache.providers.map((provider) =>
            upsertStatement("ai_providers", providerToRow(provider)),
        ),
    )
}

export function createProvider(
    data: Omit<AiProvider, "id" | "createdAt" | "updatedAt">,
): AiProvider {
    const provider: AiProvider = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
    }
    if (data.isDefault) {
        cache.providers.forEach((p) => (p.isDefault = false))
    }
    cache.providers.push(provider)
    persistProviders()
    return clone(provider)
}

export function updateProvider(
    id: string,
    data: Partial<Omit<AiProvider, "id" | "createdAt">>,
): AiProvider | null {
    const idx = cache.providers.findIndex((p) => p.id === id)
    if (idx === -1) return null
    if (data.isDefault) {
        cache.providers.forEach((p) => (p.isDefault = false))
    }
    cache.providers[idx] = {
        ...cache.providers[idx],
        ...data,
        updatedAt: now(),
    }
    persistProviders()
    return clone(cache.providers[idx])
}

export function deleteProvider(id: string): void {
    cache.providers = cache.providers.filter((p) => p.id !== id)
    persist([{ sql: "DELETE FROM ai_providers WHERE id = ?1", params: [id] }])
}

export function getDefaultProvider(): AiProvider | undefined {
    return getProviders().find((p) => p.isDefault)
}

// ─── ProjectCategory ──────────────────────────────────────────────────────────

export const DEFAULT_CATEGORIES: ProjectCategory[] = [
    { id: "ia", name: "IA", slug: "ia" },
    { id: "finances", name: "Finanças", slug: "finances" },
    { id: "productivity", name: "Produtividade", slug: "productivity" },
    { id: "marketing", name: "Marketing", slug: "marketing" },
    { id: "developers", name: "Desenvolvedores", slug: "developers" },
    { id: "security", name: "Segurança", slug: "security" },
    { id: "data", name: "Dados", slug: "data" },
    { id: "ecommerce", name: "Ecommerce", slug: "ecommerce" },
    { id: "sustainability", name: "Sustentabilidade", slug: "sustainability" },
    { id: "trips", name: "Viagens", slug: "trips" },
    { id: "relationship", name: "Relacionamento", slug: "relationship" },
    { id: "family", name: "Família", slug: "family" },
    { id: "management", name: "Gestão", slug: "management" },
    { id: "other", name: "Outro", slug: "other" },
    { id: "education", name: "Educação", slug: "education" },
    { id: "health", name: "Saúde", slug: "health" },
    { id: "wellbeing", name: "Bem-estar", slug: "wellbeing" },
    { id: "hr", name: "RH", slug: "hr" },
    { id: "sales", name: "Vendas", slug: "sales" },
    {
        id: "customer-support",
        name: "Atendimento ao Cliente",
        slug: "customer-support",
    },
    { id: "automation", name: "Automação", slug: "automation" },
    { id: "integrations", name: "Integrações", slug: "integrations" },
    { id: "apis", name: "APIs", slug: "apis" },
    { id: "no-code", name: "No-code / Low-code", slug: "no-code" },
    { id: "analytics", name: "Analytics", slug: "analytics" },
    { id: "monitoring", name: "Monitoramento", slug: "monitoring" },
    { id: "infrastructure", name: "Infraestrutura", slug: "infrastructure" },
    { id: "cloud", name: "Cloud", slug: "cloud" },
    { id: "documentation", name: "Documentação", slug: "documentation" },
    { id: "communication", name: "Comunicação", slug: "communication" },
    { id: "social-media", name: "Redes Sociais", slug: "social-media" },
    { id: "content", name: "Conteúdo", slug: "content" },
    { id: "seo", name: "SEO", slug: "seo" },
    { id: "legal", name: "Jurídico", slug: "legal" },
    { id: "real-estate", name: "Imobiliário", slug: "real-estate" },
    { id: "logistics", name: "Logística", slug: "logistics" },
    { id: "events", name: "Eventos", slug: "events" },
    { id: "subscriptions", name: "Assinaturas", slug: "subscriptions" },
    { id: "payments", name: "Pagamentos", slug: "payments" },
    { id: "community", name: "Comunidade", slug: "community" },
    { id: "gamification", name: "Gamificação", slug: "gamification" },
    { id: "feedback", name: "Pesquisa e Feedback", slug: "feedback" },
]

export function getCategories(): ProjectCategory[] {
    return DEFAULT_CATEGORIES
}

// ─── ProjectNoteCategory ──────────────────────────────────────────────────────

export const DEFAULT_NOTE_CATEGORIES: ProjectNoteCategory[] = [
    { id: "future-ideas", name: "Ideias Futuras", slug: "future-ideas" },
    {
        id: "random-thoughts",
        name: "Pensamentos Aleatórios",
        slug: "random-thoughts",
    },
    { id: "inspirations", name: "Inspirações", slug: "inspirations" },
    { id: "references", name: "Referências", slug: "references" },
    { id: "comments", name: "Comentários", slug: "comments" },
]

export function getNoteCategories(): ProjectNoteCategory[] {
    return DEFAULT_NOTE_CATEGORIES
}

// ─── Project ──────────────────────────────────────────────────────────────────

export function getProjects(): Project[] {
    return clone(cache.projects)
}

export function getProjectById(id: string): Project | undefined {
    return getProjects().find((p) => p.id === id)
}

function resolveCategory(
    categories: ProjectCategory[],
    categoryId?: string,
): ProjectCategory | undefined {
    if (!categoryId) return undefined
    return categories.find((c) => c.id === categoryId || c.slug === categoryId)
}

export function createProject(
    data: Pick<Project, "name"> &
        Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>,
): Project {
    const project: Project = {
        name: data.name,
        description: data.description,
        website: data.website,
        slogan: data.slogan,
        alreadyExists: data.alreadyExists ?? false,
        logo: data.logo,
        categoryId: data.categoryId,
        category: resolveCategory(getCategories(), data.categoryId),
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
    }
    cache.projects.push(project)
    persist([upsertStatement("projects", projectToRow(project))])
    return clone(project)
}

export function updateProject(
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt">>,
): Project | null {
    const idx = cache.projects.findIndex((p) => p.id === id)
    if (idx === -1) return null
    const patch = { ...data }
    if (patch.categoryId !== undefined) {
        patch.category = resolveCategory(getCategories(), patch.categoryId)
    }
    cache.projects[idx] = { ...cache.projects[idx], ...patch, updatedAt: now() }
    persist([upsertStatement("projects", projectToRow(cache.projects[idx]))])
    return clone(cache.projects[idx])
}

export function deleteProject(id: string): void {
    const sessionIds = new Set(
        cache.sessions.filter((s) => s.projectId === id).map((s) => s.id),
    )
    cache.projects = cache.projects.filter((p) => p.id !== id)
    cache.sessions = cache.sessions.filter((s) => s.projectId !== id)
    cache.messages = cache.messages.filter((m) => !sessionIds.has(m.sessionId))
    cache.notes = cache.notes.filter((n) => n.projectId !== id)
    // sessões, mensagens e notas saem em cascata (ON DELETE CASCADE)
    persist([{ sql: "DELETE FROM projects WHERE id = ?1", params: [id] }])
}

// ─── ChatSession ──────────────────────────────────────────────────────────────

function withMessages(session: ChatSession): ChatSession {
    return {
        ...clone(session),
        messages: clone(
            cache.messages.filter((m) => m.sessionId === session.id),
        ),
    }
}

export function getChatSessions(projectId?: string): ChatSession[] {
    const sessions = projectId
        ? cache.sessions.filter((s) => s.projectId === projectId)
        : cache.sessions
    return sessions.map(withMessages)
}

export function createChatSession(
    projectId: string,
    title?: string,
): ChatSession {
    const session: ChatSession = {
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        title: title ?? "Nova conversa",
        projectId,
        messages: [],
    }
    cache.sessions.push(session)
    persist([upsertStatement("chat_sessions", sessionToRow(session))])
    return clone(session)
}

export function renameChatSession(id: string, title: string): void {
    const session = cache.sessions.find((s) => s.id === id)
    if (!session) return
    session.title = title
    session.updatedAt = now()
    persist([upsertStatement("chat_sessions", sessionToRow(session))])
}

export function deleteChatSession(id: string): void {
    cache.sessions = cache.sessions.filter((s) => s.id !== id)
    cache.messages = cache.messages.filter((m) => m.sessionId !== id)
    persist([{ sql: "DELETE FROM chat_sessions WHERE id = ?1", params: [id] }])
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

export function getMessages(sessionId?: string): ChatMessage[] {
    const messages = sessionId
        ? cache.messages.filter((m) => m.sessionId === sessionId)
        : cache.messages
    return clone(messages)
}

export function addMessage(
    data: Pick<ChatMessage, "role" | "content" | "sessionId"> &
        Partial<Pick<ChatMessage, "contextUsed" | "modelUsed">>,
): ChatMessage {
    const message: ChatMessage = {
        id: generateId(),
        createdAt: now(),
        role: data.role,
        content: data.content,
        contextUsed: data.contextUsed,
        modelUsed: data.modelUsed,
        sessionId: data.sessionId,
    }
    cache.messages.push(message)

    const statements: SqlStatement[] = [
        upsertStatement("chat_messages", messageToRow(message)),
    ]

    // atualiza o updatedAt da sessão
    const session = cache.sessions.find((s) => s.id === data.sessionId)
    if (session) {
        session.updatedAt = now()
        statements.push(upsertStatement("chat_sessions", sessionToRow(session)))
    }

    persist(statements)
    return clone(message)
}

// ─── ProjectNote ──────────────────────────────────────────────────────────────

export function getNotes(projectId?: string): ProjectNote[] {
    const notes = projectId
        ? cache.notes.filter((n) => n.projectId === projectId)
        : cache.notes
    return clone(notes)
}

function resolveNoteCategory(
    categories: ProjectNoteCategory[],
    categoryId?: string,
): ProjectNoteCategory | undefined {
    if (!categoryId) return undefined
    return categories.find((c) => c.id === categoryId || c.slug === categoryId)
}

export function createNote(
    data: Pick<ProjectNote, "content" | "projectId"> &
        Partial<Pick<ProjectNote, "categoryId">>,
): ProjectNote {
    const note: ProjectNote = {
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        content: data.content,
        projectId: data.projectId,
        categoryId: data.categoryId,
        category: resolveNoteCategory(getNoteCategories(), data.categoryId),
    }
    cache.notes.push(note)
    persist([upsertStatement("project_notes", noteToRow(note))])
    return clone(note)
}

export function updateNote(
    id: string,
    data: Partial<Pick<ProjectNote, "content" | "categoryId">>,
): ProjectNote | null {
    const idx = cache.notes.findIndex((n) => n.id === id)
    if (idx === -1) return null
    const updatedCategory =
        data.categoryId !== undefined
            ? resolveNoteCategory(getNoteCategories(), data.categoryId)
            : cache.notes[idx].category
    cache.notes[idx] = {
        ...cache.notes[idx],
        ...data,
        category: updatedCategory,
        updatedAt: now(),
    }
    persist([upsertStatement("project_notes", noteToRow(cache.notes[idx]))])
    return clone(cache.notes[idx])
}

export function deleteNote(id: string): void {
    cache.notes = cache.notes.filter((n) => n.id !== id)
    persist([{ sql: "DELETE FROM project_notes WHERE id = ?1", params: [id] }])
}
