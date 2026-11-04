import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { LuBot, LuUser } from "react-icons/lu"
import type { ChatMessage } from "@/types"

interface CopilotMessageProps {
    message: ChatMessage
    isStreaming?: boolean
}

export function CopilotMessage({ message, isStreaming }: CopilotMessageProps) {
    const isAssistant = message.role === "assistant"

    return (
        <Message align={isAssistant ? "start" : "end"}>
            <MessageAvatar
                className={
                    isAssistant
                        ? "size-6 bg-primary text-primary-foreground"
                        : "size-6 bg-secondary text-secondary-foreground"
                }
            >
                {isAssistant ? (
                    <LuBot className="size-3" />
                ) : (
                    <LuUser className="size-3" />
                )}
            </MessageAvatar>

            <MessageContent>
                <Bubble
                    align={isAssistant ? "start" : "end"}
                    variant={isAssistant ? "muted" : "default"}
                    className="max-w-[90%]"
                >
                    <BubbleContent>
                        {message.content ? (
                            <div
                                className="leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: formatMarkdown(message.content),
                                }}
                            />
                        ) : null}
                        {isStreaming && (
                            <span className="ml-1 inline-flex items-center gap-0.5">
                                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
                                <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
                                <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
                            </span>
                        )}
                    </BubbleContent>
                </Bubble>
                {message.modelUsed && (
                    <MessageFooter className="px-1 text-[10px] opacity-60">
                        {message.modelUsed}
                    </MessageFooter>
                )}
            </MessageContent>
        </Message>
    )
}

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
}

function formatInline(text: string): string {
    return text
        .replace(
            /`([^`]+)`/g,
            '<code class="rounded bg-black/10 px-1 py-0.5 font-mono text-xs">$1</code>',
        )
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*\s][^*]*)\*/g, "<em>$1</em>")
}

function formatBlock(text: string): string {
    const out: string[] = []
    let list: "ul" | "ol" | null = null

    const closeList = (): void => {
        if (list) out.push(`</${list}>`)
        list = null
    }

    const openList = (type: "ul" | "ol"): void => {
        if (list === type) return
        closeList()
        out.push(
            type === "ul"
                ? '<ul class="my-1 ml-4 list-disc">'
                : '<ol class="my-1 ml-4 list-decimal">',
        )
        list = type
    }

    for (const line of text.split("\n")) {
        const heading = /^(#{1,3}) (.+)$/.exec(line)
        const bullet = /^\s*[-*] (.+)$/.exec(line)
        const numbered = /^\s*\d+[.)] (.+)$/.exec(line)

        if (heading) {
            closeList()
            const level = heading[1].length
            const cls =
                level === 1
                    ? "font-bold mt-4 mb-2 text-lg"
                    : level === 2
                      ? "font-bold mt-4 mb-1 text-base"
                      : "font-semibold mt-3 mb-1"
            out.push(
                `<h${level} class="${cls}">${formatInline(heading[2])}</h${level}>`,
            )
        } else if (bullet) {
            openList("ul")
            out.push(`<li>${formatInline(bullet[1])}</li>`)
        } else if (numbered) {
            openList("ol")
            out.push(`<li>${formatInline(numbered[1])}</li>`)
        } else if (!line.trim()) {
            closeList()
            out.push('<div class="h-2"></div>')
        } else {
            closeList()
            out.push(`<div>${formatInline(line)}</div>`)
        }
    }

    closeList()
    return out.join("")
}

// Minimal markdown formatter. Code blocks are split out first so that no
// inline/block rule is applied to their content.
function formatMarkdown(text: string): string {
    const parts = escapeHtml(text).split(/```(?:\w*)\n?([\s\S]*?)(?:```|$)/g)

    return parts
        .map((part, index) =>
            index % 2 === 1
                ? `<pre class="overflow-x-auto rounded-md bg-black/10 p-3 text-xs font-mono"><code>${part}</code></pre>`
                : formatBlock(part),
        )
        .join("")
}
