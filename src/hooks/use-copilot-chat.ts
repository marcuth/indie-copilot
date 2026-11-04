import { useState, useCallback } from "react"

import {
    addMessage,
    createChatSession,
    getChatSessions,
    getMessages,
    getDefaultProvider,
    getSettings,
    renameChatSession,
} from "../lib/db/database-client"
import { buildCopilotSystemPrompt } from "../lib/ai/prompt-builder"
import type { ChatMessage, ChatSession, Project } from "../types"
import { createAiClient } from "../lib/ai/client-factory"

const MAX_TITLE_LENGTH = 40

function loadSessions(projectId: string): ChatSession[] {
    return getChatSessions(projectId).sort((a, b) =>
        b.updatedAt.localeCompare(a.updatedAt),
    )
}

function buildTitle(content: string): string {
    const text = content.replace(/\s+/g, " ").trim()
    return text.length > MAX_TITLE_LENGTH
        ? `${text.slice(0, MAX_TITLE_LENGTH)}…`
        : text
}

export function useCopilotChat(project: Project) {
    const [sessions, setSessions] = useState<ChatSession[]>(() =>
        loadSessions(project.id),
    )
    const [activeSessionId, setActiveSessionId] = useState<string | null>(
        () => loadSessions(project.id)[0]?.id ?? null,
    )
    const [messages, setMessages] = useState<ChatMessage[]>(() =>
        activeSessionId ? getMessages(activeSessionId) : [],
    )
    const [isStreaming, setIsStreaming] = useState(false)
    const [streamingContent, setStreamingContent] = useState("")
    const [error, setError] = useState<string | null>(null)

    const switchSession = useCallback((sessionId: string) => {
        setActiveSessionId(sessionId)
        setMessages(getMessages(sessionId))
        setError(null)
    }, [])

    const newSession = useCallback(() => {
        const session = createChatSession(project.id)
        setSessions(loadSessions(project.id))
        setActiveSessionId(session.id)
        setMessages([])
        setError(null)
        return session
    }, [project.id])

    const sendMessage = useCallback(
        async (content: string) => {
            setError(null)

            const provider = getDefaultProvider()
            if (!provider) {
                setError(
                    "Nenhum provedor de IA configurado. Vá em Configurações > Provedores de IA.",
                )
                return
            }

            let sessionId = activeSessionId
            if (!sessionId) {
                const session = createChatSession(project.id)
                sessionId = session.id
                setActiveSessionId(session.id)
            }

            const settings = getSettings()
            const model = settings.activeModelId ?? provider.defaultModel

            const isFirstMessage = getMessages(sessionId).length === 0
            const userMsg = addMessage({ role: "user", content, sessionId })
            setMessages((prev) => [...prev, userMsg])
            if (isFirstMessage) {
                renameChatSession(sessionId, buildTitle(content))
            }
            setSessions(loadSessions(project.id))

            setIsStreaming(true)
            setStreamingContent("")

            let fullContent = ""

            const saveAssistantMessage = (): void => {
                // Never persist empty replies: some providers reject them
                // when the history is sent back.
                if (!fullContent.trim() || !sessionId) return
                const assistantMsg = addMessage({
                    role: "assistant",
                    content: fullContent,
                    sessionId,
                    modelUsed: model,
                    contextUsed: JSON.stringify({
                        projectId: project.id,
                        projectName: project.name,
                    }),
                })
                setMessages((prev) => [...prev, assistantMsg])
            }

            try {
                const client = createAiClient(provider)
                const systemPrompt = buildCopilotSystemPrompt(project)
                const history = getMessages(sessionId).filter(
                    (m) => m.role !== "system" && m.content.trim(),
                )

                const stream = await client.chat.completions.create({
                    model,
                    stream: true,
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...history.map((m) => ({
                            role: m.role as "user" | "assistant",
                            content: m.content,
                        })),
                    ],
                })

                for await (const chunk of stream) {
                    const delta = chunk.choices[0]?.delta?.content ?? ""
                    fullContent += delta
                    setStreamingContent(fullContent)
                }

                if (!fullContent.trim()) {
                    setError("O modelo retornou uma resposta vazia.")
                }
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : "Erro desconhecido"
                setError(
                    fullContent
                        ? `A resposta foi interrompida: ${message}`
                        : message,
                )
            } finally {
                // Keep whatever was received, even when the stream failed midway.
                saveAssistantMessage()
                setSessions(loadSessions(project.id))
                setIsStreaming(false)
                setStreamingContent("")
            }
        },
        [activeSessionId, project],
    )

    return {
        sessions,
        activeSessionId,
        messages,
        isStreaming,
        streamingContent,
        error,
        sendMessage,
        switchSession,
        newSession,
    }
}
