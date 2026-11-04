import {
    MessageScroller,
    MessageScrollerButton,
    MessageScrollerContent,
    MessageScrollerItem,
    MessageScrollerProvider,
    MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupTextarea,
} from "@/components/ui/input-group"
import {
    LuBot,
    LuSparkles,
    LuSend,
    LuPlus,
    LuLoader,
    LuHistory,
} from "react-icons/lu"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { useCopilotChat } from "@/hooks/use-copilot-chat"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types"
import { useState } from "react"

import { CopilotMessage } from "./copilot-message"

interface CopilotChatProps {
    project: Project
    open: boolean
    onOpenChange: (open: boolean) => void
}

const STREAMING_MESSAGE_ID = "__streaming__"

const QUICK_ACTIONS = [
    {
        label: "📋 Analisar projeto",
        prompt: "Analise o contexto geral do meu projeto e me dê um feedback honesto sobre os pontos fortes e fracos que você identificou.",
    },
    {
        label: "👿 Advogado do Diabo",
        prompt: "Faça uma análise crítica e impiedosa do meu projeto. Por que ele pode falhar? Quais são os maiores riscos? Seja brutal e honesto.",
    },
    {
        label: "🎯 Sugerir SWOT",
        prompt: "Com base no contexto do projeto, gere uma análise SWOT completa em formato JSON.",
    },
    {
        label: "👥 Criar Persona",
        prompt: "Crie uma persona detalhada com base no público-alvo do projeto e sugira 5 perguntas de entrevista de validação para aplicar com clientes potenciais.",
    },
]

export function CopilotChat({ project, open, onOpenChange }: CopilotChatProps) {
    const {
        sessions,
        activeSessionId,
        messages,
        isStreaming,
        streamingContent,
        error,
        sendMessage,
        switchSession,
        newSession,
    } = useCopilotChat(project)
    const [input, setInput] = useState("")

    const canSend = input.trim().length > 0 && !isStreaming

    const handleSend = async (): Promise<void> => {
        const text = input.trim()
        if (!text || isStreaming) return
        setInput("")
        await sendMessage(text)
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault()
        void handleSend()
    }

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>,
    ): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            void handleSend()
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex h-full max-h-screen w-[420px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
            >
                {/* Header */}
                <SheetHeader className="shrink-0 border-b border-border/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                                <LuBot className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div>
                                <SheetTitle className="text-sm leading-tight font-semibold">
                                    Indie Copilot
                                </SheetTitle>
                                <p className="text-xs text-muted-foreground">
                                    Contexto:{" "}
                                    <span className="font-medium text-primary">
                                        {project.name}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        aria-label="Conversas anteriores"
                                        disabled={isStreaming}
                                    >
                                        <LuHistory className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="max-h-72 w-64 overflow-y-auto"
                                >
                                    {sessions.length === 0 ? (
                                        <p className="px-2 py-1.5 text-xs text-muted-foreground">
                                            Nenhuma conversa ainda.
                                        </p>
                                    ) : (
                                        sessions.map((session) => (
                                            <DropdownMenuItem
                                                key={session.id}
                                                onSelect={() =>
                                                    switchSession(session.id)
                                                }
                                                className={
                                                    session.id ===
                                                    activeSessionId
                                                        ? "bg-accent"
                                                        : undefined
                                                }
                                            >
                                                <span className="truncate text-xs">
                                                    {session.title}
                                                </span>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                aria-label="Nova conversa"
                                onClick={newSession}
                                disabled={isStreaming}
                            >
                                <LuPlus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </SheetHeader>

                {/* Messages */}
                <div className="min-h-0 flex-1">
                    <MessageScrollerProvider autoScroll>
                        <MessageScroller>
                            <MessageScrollerViewport>
                                <MessageScrollerContent className="gap-4 px-4 py-4">
                                    {messages.length === 0 && !isStreaming && (
                                        <div className="flex flex-col items-center gap-4 py-8 text-center">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                                                <LuSparkles className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">
                                                    Olá! Sou seu Indie Copilot
                                                </p>
                                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                    Tenho acesso completo ao
                                                    contexto de{" "}
                                                    <strong>
                                                        {project.name}
                                                    </strong>
                                                    . Me peça análises,
                                                    sugestões, críticas ou
                                                    qualquer ajuda com seu
                                                    planejamento.
                                                </p>
                                            </div>
                                            <div className="grid w-full grid-cols-1 gap-2">
                                                {QUICK_ACTIONS.map((action) => (
                                                    <Button
                                                        key={action.label}
                                                        variant="outline"
                                                        size="sm"
                                                        className="h-auto justify-start py-2 text-left text-xs"
                                                        onClick={() =>
                                                            void sendMessage(
                                                                action.prompt,
                                                            )
                                                        }
                                                    >
                                                        {action.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {messages.map((msg) => (
                                        <MessageScrollerItem
                                            key={msg.id}
                                            messageId={msg.id}
                                            scrollAnchor={msg.role === "user"}
                                        >
                                            <CopilotMessage message={msg} />
                                        </MessageScrollerItem>
                                    ))}

                                    {isStreaming && streamingContent && (
                                        <MessageScrollerItem
                                            messageId={STREAMING_MESSAGE_ID}
                                        >
                                            <CopilotMessage
                                                message={{
                                                    id: STREAMING_MESSAGE_ID,
                                                    role: "assistant",
                                                    content: streamingContent,
                                                    createdAt:
                                                        new Date().toISOString(),
                                                    sessionId:
                                                        activeSessionId ?? "",
                                                }}
                                                isStreaming
                                            />
                                        </MessageScrollerItem>
                                    )}

                                    {isStreaming && !streamingContent && (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <LuLoader className="h-3.5 w-3.5 animate-spin" />
                                            <span className="text-xs">
                                                Pensando...
                                            </span>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                                            {error}
                                        </div>
                                    )}
                                </MessageScrollerContent>
                            </MessageScrollerViewport>
                            <MessageScrollerButton />
                        </MessageScroller>
                    </MessageScrollerProvider>
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    className="shrink-0 border-t border-border/50 p-4"
                >
                    <InputGroup>
                        <InputGroupTextarea
                            placeholder="Pergunte algo sobre o projeto... (Enter para enviar)"
                            value={input}
                            onChange={(
                                e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={3}
                            className="resize-none text-sm"
                            disabled={isStreaming}
                        />
                        <InputGroupAddon align="block-end">
                            <InputGroupButton
                                type="submit"
                                size="icon-sm"
                                variant="default"
                                className="ml-auto rounded-full"
                                disabled={!canSend}
                                aria-label="Enviar"
                            >
                                {isStreaming ? (
                                    <LuLoader className="animate-spin" />
                                ) : (
                                    <LuSend />
                                )}
                            </InputGroupButton>
                        </InputGroupAddon>
                    </InputGroup>
                </form>
            </SheetContent>
        </Sheet>
    )
}
