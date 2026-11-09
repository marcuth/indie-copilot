import {
    Message,
    MessageAvatar,
    MessageContent,
    MessageFooter,
} from "@/components/ui/message"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { LuBot, LuUser } from "react-icons/lu"
import type { ChatMessage } from "@/types"

import { MarkdownContent } from "./markdown-content"

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
                            <MarkdownContent content={message.content} />
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
