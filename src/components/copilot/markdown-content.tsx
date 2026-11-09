import { useState, type ReactElement, type ReactNode } from "react"
import ReactMarkdown, { type Components } from "react-markdown"
import { openUrl } from "@tauri-apps/plugin-opener"
import { LuCheck, LuCopy } from "react-icons/lu"
import { Button } from "@/components/ui/button"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownContentProps {
    content: string
    className?: string
}

function nodeToText(node: ReactNode): string {
    if (typeof node === "string" || typeof node === "number")
        return String(node)
    if (Array.isArray(node)) return node.map(nodeToText).join("")
    if (node && typeof node === "object" && "props" in node) {
        return nodeToText(
            (node as ReactElement<{ children?: ReactNode }>).props.children,
        )
    }
    return ""
}

function CodeBlock({ children }: { children?: ReactNode }): ReactElement {
    const [copied, setCopied] = useState(false)

    const codeElement = children as ReactElement<{
        className?: string
        children?: ReactNode
    }>
    const language = /language-([\w-]+)/.exec(
        codeElement?.props?.className ?? "",
    )?.[1]
    const text = nodeToText(codeElement?.props?.children).replace(/\n$/, "")

    const handleCopy = async (): Promise<void> => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch (error) {
            console.error("Falha ao copiar código", error)
        }
    }

    return (
        <div className="my-3 overflow-hidden rounded-lg border border-current/15 bg-current/5 first:mt-0 last:mb-0">
            <div className="flex items-center justify-between border-b border-current/10 bg-current/5 py-1 pr-1 pl-3">
                <span className="font-mono text-[10px] tracking-wide uppercase opacity-70">
                    {language ?? "código"}
                </span>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 gap-1 px-2 text-[10px] hover:bg-current/10"
                    onClick={handleCopy}
                    aria-label="Copiar código"
                >
                    {copied ? (
                        <LuCheck className="size-3" />
                    ) : (
                        <LuCopy className="size-3" />
                    )}
                    {copied ? "Copiado" : "Copiar"}
                </Button>
            </div>
            <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed">
                <code>{text}</code>
            </pre>
        </div>
    )
}

const components: Components = {
    h1: ({ children }) => (
        <h1 className="mt-4 mb-2 text-lg font-bold first:mt-0">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="mt-4 mb-1.5 text-base font-bold first:mt-0">
            {children}
        </h2>
    ),
    h3: ({ children }) => (
        <h3 className="mt-3 mb-1 text-sm font-semibold first:mt-0">
            {children}
        </h3>
    ),
    h4: ({ children }) => (
        <h4 className="mt-3 mb-1 text-sm font-semibold first:mt-0">
            {children}
        </h4>
    ),
    p: ({ children }) => (
        <p className="my-2 leading-relaxed first:mt-0 last:mb-0">{children}</p>
    ),
    ul: ({ children, className }) => (
        <ul
            className={cn(
                "my-2 space-y-1 pl-5 first:mt-0 last:mb-0",
                className?.includes("contains-task-list")
                    ? "list-none pl-1"
                    : "list-disc",
            )}
        >
            {children}
        </ul>
    ),
    ol: ({ children }) => (
        <ol className="my-2 list-decimal space-y-1 pl-5 first:mt-0 last:mb-0">
            {children}
        </ol>
    ),
    li: ({ children }) => (
        <li className="leading-relaxed marker:opacity-60">{children}</li>
    ),
    input: ({ type, checked }) =>
        type === "checkbox" ? (
            <input
                type="checkbox"
                checked={checked}
                disabled
                readOnly
                className="mr-1.5 translate-y-px accent-current"
            />
        ) : null,
    blockquote: ({ children }) => (
        <blockquote className="my-2 border-l-2 border-current/30 pl-3 italic opacity-85 first:mt-0 last:mb-0">
            {children}
        </blockquote>
    ),
    a: ({ href, children }) => (
        <a
            href={href}
            onClick={(event) => {
                event.preventDefault()
                if (href) void openUrl(href)
            }}
            className="font-medium underline underline-offset-2 hover:opacity-80"
        >
            {children}
        </a>
    ),
    hr: () => <hr className="my-3 border-current/20" />,
    strong: ({ children }) => (
        <strong className="font-semibold">{children}</strong>
    ),
    pre: ({ children }) => <CodeBlock>{children}</CodeBlock>,
    code: ({ children, className }) => (
        <code
            className={cn(
                "rounded bg-current/10 px-1 py-0.5 font-mono text-[0.85em]",
                className,
            )}
        >
            {children}
        </code>
    ),
    table: ({ children }) => (
        <div className="my-3 overflow-x-auto rounded-lg border border-current/15 first:mt-0 last:mb-0">
            <table className="w-full border-collapse text-xs">{children}</table>
        </div>
    ),
    thead: ({ children }) => <thead className="bg-current/5">{children}</thead>,
    th: ({ children }) => (
        <th className="border-b border-current/15 px-3 py-1.5 text-left font-semibold">
            {children}
        </th>
    ),
    td: ({ children }) => (
        <td className="border-t border-current/10 px-3 py-1.5 align-top">
            {children}
        </td>
    ),
}

export function MarkdownContent({
    content,
    className,
}: MarkdownContentProps): ReactElement {
    return (
        <div className={cn("min-w-0 text-sm break-words", className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
                {content}
            </ReactMarkdown>
        </div>
    )
}
