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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function now(): string {
    return new Date().toISOString()
}

function generateId(): string {
    return crypto.randomUUID()
}

// ─── Storage Keys ─────────────────────────────────────────────────────────────

const KEYS = {
    SETTINGS: "indie-copilot:settings",
    PROVIDERS: "indie-copilot:providers",
    CATEGORIES: "indie-copilot:categories",
    NOTE_CATEGORIES: "indie-copilot:note-categories",
    PROJECTS: "indie-copilot:projects",
    SESSIONS: "indie-copilot:sessions",
    MESSAGES: "indie-copilot:messages",
    NOTES: "indie-copilot:notes",
} as const

// ─── Generic helpers ──────────────────────────────────────────────────────────

function load<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key)
        if (!raw) return fallback
        return JSON.parse(raw) as T
    } catch {
        return fallback
    }
}

function save<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value))
}

// ─── AppSettings ──────────────────────────────────────────────────────────────

export function getSettings(): AppSettings {
    return load<AppSettings>(KEYS.SETTINGS, {
        id: "default",
        theme: "system",
        language: "pt-BR",
        createdAt: now(),
        updatedAt: now(),
    })
}

export function saveSettings(
    data: Partial<Omit<AppSettings, "id" | "createdAt">>,
): AppSettings {
    const current = getSettings()
    const updated: AppSettings = { ...current, ...data, updatedAt: now() }
    save(KEYS.SETTINGS, updated)
    return updated
}

// ─── AiProvider ───────────────────────────────────────────────────────────────

export function getProviders(): AiProvider[] {
    return load<AiProvider[]>(KEYS.PROVIDERS, [])
}

export function createProvider(
    data: Omit<AiProvider, "id" | "createdAt" | "updatedAt">,
): AiProvider {
    const providers = getProviders()
    const provider: AiProvider = {
        ...data,
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
    }
    if (data.isDefault) {
        providers.forEach((p) => (p.isDefault = false))
    }
    providers.push(provider)
    save(KEYS.PROVIDERS, providers)
    return provider
}

export function updateProvider(
    id: string,
    data: Partial<Omit<AiProvider, "id" | "createdAt">>,
): AiProvider | null {
    const providers = getProviders()
    const idx = providers.findIndex((p) => p.id === id)
    if (idx === -1) return null
    if (data.isDefault) {
        providers.forEach((p) => (p.isDefault = false))
    }
    providers[idx] = { ...providers[idx], ...data, updatedAt: now() }
    save(KEYS.PROVIDERS, providers)
    return providers[idx]
}

export function deleteProvider(id: string): void {
    const providers = getProviders().filter((p) => p.id !== id)
    save(KEYS.PROVIDERS, providers)
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
    const raw = localStorage.getItem(KEYS.CATEGORIES)
    if (!raw) {
        save(KEYS.CATEGORIES, DEFAULT_CATEGORIES)
        return DEFAULT_CATEGORIES
    }
    try {
        const parsed = JSON.parse(raw) as ProjectCategory[]
        if (
            Array.isArray(parsed) &&
            parsed.length >= DEFAULT_CATEGORIES.length
        ) {
            return parsed
        }
    } catch {
        // fallback
    }
    save(KEYS.CATEGORIES, DEFAULT_CATEGORIES)
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
    const raw = localStorage.getItem(KEYS.NOTE_CATEGORIES)
    if (!raw) {
        save(KEYS.NOTE_CATEGORIES, DEFAULT_NOTE_CATEGORIES)
        return DEFAULT_NOTE_CATEGORIES
    }
    try {
        const parsed = JSON.parse(raw) as ProjectNoteCategory[]
        if (
            Array.isArray(parsed) &&
            parsed.length >= DEFAULT_NOTE_CATEGORIES.length
        ) {
            return parsed
        }
    } catch {
        // fallback
    }
    save(KEYS.NOTE_CATEGORIES, DEFAULT_NOTE_CATEGORIES)
    return DEFAULT_NOTE_CATEGORIES
}

// ─── Project ──────────────────────────────────────────────────────────────────

export function getProjects(): Project[] {
    return load<Project[]>(KEYS.PROJECTS, [])
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
    const projects = getProjects()
    const categories = getCategories()
    const project: Project = {
        name: data.name,
        description: data.description,
        website: data.website,
        slogan: data.slogan,
        alreadyExists: data.alreadyExists ?? false,
        logo: data.logo,
        categoryId: data.categoryId,
        category: resolveCategory(categories, data.categoryId),
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
    }
    projects.push(project)
    save(KEYS.PROJECTS, projects)
    return project
}

export function updateProject(
    id: string,
    data: Partial<Omit<Project, "id" | "createdAt">>,
): Project | null {
    const projects = getProjects()
    const categories = getCategories()
    const idx = projects.findIndex((p) => p.id === id)
    if (idx === -1) return null
    if (data.categoryId !== undefined) {
        data.category = resolveCategory(categories, data.categoryId)
    }
    projects[idx] = { ...projects[idx], ...data, updatedAt: now() }
    save(KEYS.PROJECTS, projects)
    return projects[idx]
}

export function deleteProject(id: string): void {
    const projects = getProjects().filter((p) => p.id !== id)
    save(KEYS.PROJECTS, projects)
    // cascade delete sessions, notes
    const sessions = getChatSessions().filter((s) => s.projectId !== id)
    save(KEYS.SESSIONS, sessions)
    const notes = getNotes().filter((n) => n.projectId !== id)
    save(KEYS.NOTES, notes)
}

// ─── ChatSession ──────────────────────────────────────────────────────────────

export function getChatSessions(projectId?: string): ChatSession[] {
    const sessions = load<ChatSession[]>(KEYS.SESSIONS, [])
    if (projectId) return sessions.filter((s) => s.projectId === projectId)
    return sessions
}

export function createChatSession(
    projectId: string,
    title?: string,
): ChatSession {
    const sessions = getChatSessions()
    const session: ChatSession = {
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        title: title ?? "Nova conversa",
        projectId,
        messages: [],
    }
    sessions.push(session)
    save(KEYS.SESSIONS, sessions)
    return session
}

export function renameChatSession(id: string, title: string): void {
    const sessions = getChatSessions()
    const idx = sessions.findIndex((s) => s.id === id)
    if (idx === -1) return
    sessions[idx].title = title
    sessions[idx].updatedAt = now()
    save(KEYS.SESSIONS, sessions)
}

export function deleteChatSession(id: string): void {
    const sessions = getChatSessions().filter((s) => s.id !== id)
    save(KEYS.SESSIONS, sessions)
    const messages = getMessages().filter((m) => m.sessionId !== id)
    save(KEYS.MESSAGES, messages)
}

// ─── ChatMessage ──────────────────────────────────────────────────────────────

export function getMessages(sessionId?: string): ChatMessage[] {
    const messages = load<ChatMessage[]>(KEYS.MESSAGES, [])
    if (sessionId) return messages.filter((m) => m.sessionId === sessionId)
    return messages
}

export function addMessage(
    data: Pick<ChatMessage, "role" | "content" | "sessionId"> &
        Partial<Pick<ChatMessage, "contextUsed" | "modelUsed">>,
): ChatMessage {
    const messages = getMessages()
    const message: ChatMessage = {
        id: generateId(),
        createdAt: now(),
        role: data.role,
        content: data.content,
        contextUsed: data.contextUsed,
        modelUsed: data.modelUsed,
        sessionId: data.sessionId,
    }
    messages.push(message)
    save(KEYS.MESSAGES, messages)
    // update session updatedAt
    const sessions = getChatSessions()
    const idx = sessions.findIndex((s) => s.id === data.sessionId)
    if (idx !== -1) {
        sessions[idx].updatedAt = now()
        sessions[idx].messages = getMessages(data.sessionId)
        save(KEYS.SESSIONS, sessions)
    }
    return message
}

// ─── ProjectNote ──────────────────────────────────────────────────────────────

export function getNotes(projectId?: string): ProjectNote[] {
    const notes = load<ProjectNote[]>(KEYS.NOTES, [])
    if (projectId) return notes.filter((n) => n.projectId === projectId)
    return notes
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
    const notes = getNotes()
    const categories = getNoteCategories()
    const note: ProjectNote = {
        id: generateId(),
        createdAt: now(),
        updatedAt: now(),
        content: data.content,
        projectId: data.projectId,
        categoryId: data.categoryId,
        category: resolveNoteCategory(categories, data.categoryId),
    }
    notes.push(note)
    save(KEYS.NOTES, notes)
    return note
}

export function updateNote(
    id: string,
    data: Partial<Pick<ProjectNote, "content" | "categoryId">>,
): ProjectNote | null {
    const notes = getNotes()
    const categories = getNoteCategories()
    const idx = notes.findIndex((n) => n.id === id)
    if (idx === -1) return null
    const updatedCategory =
        data.categoryId !== undefined
            ? resolveNoteCategory(categories, data.categoryId)
            : notes[idx].category
    notes[idx] = {
        ...notes[idx],
        ...data,
        category: updatedCategory,
        updatedAt: now(),
    }
    save(KEYS.NOTES, notes)
    return notes[idx]
}

export function deleteNote(id: string): void {
    const notes = getNotes().filter((n) => n.id !== id)
    save(KEYS.NOTES, notes)
}
