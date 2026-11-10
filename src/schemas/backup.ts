import type {
    AiProvider,
    AppSettings,
    ChatMessage,
    ChatSession,
    Project,
    ProjectNote,
} from "@/types"
import { z } from "zod"

export const BACKUP_FORMAT = "indie-copilot-backup"
/** Versão do arquivo de backup. Sobe quando o formato deixa de ser compatível. */
export const BACKUP_VERSION = 1

export class BackupError extends Error {
    constructor(message: string) {
        super(message)
        this.name = "BackupError"
    }
}

// ─── Dados (espelham as tabelas do banco) ─────────────────────────────────────

export interface BackupData {
    settings: AppSettings | null
    providers: AiProvider[]
    projects: Project[]
    /** Sessões sem mensagens: elas ficam em `messages`. */
    sessions: ChatSession[]
    messages: ChatMessage[]
    notes: ProjectNote[]
}

export interface BackupFile {
    format: typeof BACKUP_FORMAT
    version: number
    exportedAt: string
    data: BackupData
}

export interface BackupCounts {
    projects: number
    providers: number
    sessions: number
    messages: number
    notes: number
}

export interface ParsedBackup {
    data: BackupData
    counts: BackupCounts
    /** Registros descartados por apontarem para algo que não existe mais. */
    skipped: number
    exportedAt?: string
    /** "backup": formato atual · "legacy": backup antigo (chaves indie-copilot:*) */
    source: "backup" | "legacy"
}

export interface BackupInput {
    settings?: AppSettings | null
    providers?: AiProvider[]
    projects?: Project[]
    /** Pode trazer `messages` embutidas (formato antigo). */
    sessions?: ChatSession[]
    messages?: ChatMessage[]
    notes?: ProjectNote[]
}

// ─── Normalização ─────────────────────────────────────────────────────────────

function uniqueById<T extends { id: string }>(items: T[]): T[] {
    const seen = new Map<string, T>()
    for (const item of items) {
        if (!seen.has(item.id)) seen.set(item.id, item)
    }
    return [...seen.values()]
}

/**
 * Garante dados consistentes com o banco: ids únicos, mensagens embutidas nas
 * sessões unidas à lista global e nenhum registro apontando para um pai que não
 * existe (o banco rejeitaria, por causa das chaves estrangeiras).
 */
export function normalizeBackupData(input: BackupInput): {
    data: BackupData
    skipped: number
} {
    const projects = uniqueById(input.projects ?? [])
    const sessions = uniqueById(input.sessions ?? [])

    const messages = [...(input.messages ?? [])]
    for (const session of sessions) {
        for (const message of session.messages ?? []) {
            messages.push({
                ...message,
                sessionId: message.sessionId ?? session.id,
            })
        }
    }

    const projectIds = new Set(projects.map((project) => project.id))
    const validSessions = sessions
        .filter((session) => projectIds.has(session.projectId))
        .map((session) => ({ ...session, messages: [] }))
    const sessionIds = new Set(validSessions.map((session) => session.id))

    const uniqueMessages = uniqueById(messages)
    const validMessages = uniqueMessages.filter((message) =>
        sessionIds.has(message.sessionId),
    )

    const uniqueNotes = uniqueById(input.notes ?? [])
    const validNotes = uniqueNotes.filter((note) =>
        projectIds.has(note.projectId),
    )

    const skipped =
        sessions.length -
        validSessions.length +
        (uniqueMessages.length - validMessages.length) +
        (uniqueNotes.length - validNotes.length)

    return {
        data: {
            settings: input.settings ?? null,
            providers: uniqueById(input.providers ?? []),
            projects,
            sessions: validSessions,
            messages: validMessages,
            notes: validNotes,
        },
        skipped,
    }
}

export function countBackup(data: BackupData): BackupCounts {
    return {
        projects: data.projects.length,
        providers: data.providers.length,
        sessions: data.sessions.length,
        messages: data.messages.length,
        notes: data.notes.length,
    }
}

// ─── Validação do arquivo ─────────────────────────────────────────────────────

const optionalText = z
    .string()
    .nullish()
    .transform((value) => value ?? undefined)

const messageSchema = z.object({
    id: z.string().min(1),
    sessionId: z.string().optional(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
    contextUsed: optionalText,
    modelUsed: optionalText,
    createdAt: z.string(),
})

const sessionSchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    title: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    messages: z.array(messageSchema).optional(),
})

const projectSchema = z.object({
    id: z.string().min(1),
    name: z.string(),
    description: optionalText,
    website: optionalText,
    slogan: optionalText,
    alreadyExists: z.boolean().default(false),
    logo: optionalText,
    categoryId: optionalText,
    problemSolution: optionalText,
    targetAudience: optionalText,
    businessModel: optionalText,
    userAcquisition: optionalText,
    marketing: optionalText,
    competition: optionalText,
    team: optionalText,
    roadmap: optionalText,
    infrastructure: optionalText,
    risks: optionalText,
    swot: optionalText,
    financials: optionalText,
    createdAt: z.string(),
    updatedAt: z.string(),
})

const providerSchema = z.object({
    id: z.string().min(1),
    name: z.string(),
    baseUrl: z.string(),
    apiKey: optionalText,
    defaultModel: z.string(),
    isDefault: z.boolean().default(false),
    createdAt: z.string(),
    updatedAt: z.string(),
})

const noteSchema = z.object({
    id: z.string().min(1),
    projectId: z.string().min(1),
    content: z.string(),
    categoryId: optionalText,
    createdAt: z.string(),
    updatedAt: z.string(),
})

const settingsSchema = z.object({
    id: z.string().default("default"),
    theme: z.enum(["dark", "light", "system"]).catch("system"),
    activeModelId: optionalText,
    activeProviderId: optionalText,
    language: z.string().default("pt-BR"),
    createdAt: z.string(),
    updatedAt: z.string(),
})

const backupFileSchema = z.object({
    format: z.literal(BACKUP_FORMAT),
    version: z.number().int().positive(),
    exportedAt: z.string().optional(),
    data: z.object({
        settings: settingsSchema.nullish(),
        providers: z.array(providerSchema).default([]),
        projects: z.array(projectSchema).default([]),
        sessions: z.array(sessionSchema).default([]),
        messages: z.array(messageSchema).default([]),
        notes: z.array(noteSchema).default([]),
    }),
})

// Backups antigos: um objeto com as chaves do localStorage.
const legacyBackupSchema = z.object({
    "indie-copilot:settings": settingsSchema.nullish(),
    "indie-copilot:providers": z.array(providerSchema).default([]),
    "indie-copilot:projects": z.array(projectSchema).default([]),
    "indie-copilot:sessions": z.array(sessionSchema).default([]),
    "indie-copilot:messages": z.array(messageSchema).default([]),
    "indie-copilot:notes": z.array(noteSchema).default([]),
})

function describeIssue(error: z.ZodError): string {
    const issue = error.issues[0]
    const location = issue.path.length > 0 ? issue.path.join(".") : "arquivo"
    return `Backup inválido em "${location}": ${issue.message}`
}

function toInput(parsed: {
    settings?: unknown
    providers: unknown[]
    projects: unknown[]
    sessions: unknown[]
    messages: unknown[]
    notes: unknown[]
}): BackupInput {
    // Os schemas já garantem a forma; o `sessionId` das mensagens embutidas é
    // preenchido por normalizeBackupData.
    return parsed as unknown as BackupInput
}

/** Lê e valida o texto de um arquivo de backup (formato atual ou antigo). */
export function parseBackup(text: string): ParsedBackup {
    let raw: unknown
    try {
        raw = JSON.parse(text)
    } catch {
        throw new BackupError("O arquivo não é um JSON válido.")
    }

    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
        throw new BackupError("Arquivo de backup não reconhecido.")
    }

    const record = raw as Record<string, unknown>

    if (record.format === BACKUP_FORMAT) {
        if (
            typeof record.version === "number" &&
            record.version > BACKUP_VERSION
        ) {
            throw new BackupError(
                "Este backup foi criado por uma versão mais nova do Indie Copilot. Atualize o aplicativo para restaurá-lo.",
            )
        }

        const result = backupFileSchema.safeParse(record)
        if (!result.success) throw new BackupError(describeIssue(result.error))

        const { data, skipped } = normalizeBackupData(toInput(result.data.data))
        return {
            data,
            skipped,
            counts: countBackup(data),
            exportedAt: result.data.exportedAt,
            source: "backup",
        }
    }

    if (Object.keys(record).some((key) => key.startsWith("indie-copilot:"))) {
        const result = legacyBackupSchema.safeParse(record)
        if (!result.success) throw new BackupError(describeIssue(result.error))

        const legacy = result.data
        const { data, skipped } = normalizeBackupData(
            toInput({
                settings: legacy["indie-copilot:settings"],
                providers: legacy["indie-copilot:providers"],
                projects: legacy["indie-copilot:projects"],
                sessions: legacy["indie-copilot:sessions"],
                messages: legacy["indie-copilot:messages"],
                notes: legacy["indie-copilot:notes"],
            }),
        )
        return { data, skipped, counts: countBackup(data), source: "legacy" }
    }

    throw new BackupError("Arquivo de backup não reconhecido.")
}
