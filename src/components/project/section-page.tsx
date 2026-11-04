import { LuBot, LuCheck, LuX, LuPencil, LuSparkles } from "react-icons/lu"
import { useActiveProject } from "@/contexts/active-project-context"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { Project } from "@/types"

interface SectionPageProps {
    title: string
    description: string
    fieldKey: keyof Project
    children: (props: {
        value: string
        onChange: (v: string) => void
        editing: boolean
    }) => ReactNode
}

export function SectionPage({
    title,
    description,
    fieldKey,
    children,
}: SectionPageProps) {
    const { activeProject, updateActiveProject } = useActiveProject()
    const [copilotOpen, setCopilotOpen] = useState(false)
    const [editing, setEditing] = useState(false)
    const [value, setValue] = useState<string>(() => {
        const raw = activeProject?.[fieldKey]
        return typeof raw === "string" ? raw : ""
    })

    if (!activeProject) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    Nenhum projeto selecionado
                </p>
            </div>
        )
    }

    const handleSave = () => {
        updateActiveProject({ [fieldKey]: value || undefined })
        setEditing(false)
    }

    const handleCancel = () => {
        const raw = activeProject[fieldKey]
        setValue(typeof raw === "string" ? raw : "")
        setEditing(false)
    }

    return (
        <>
            <div className="flex h-full flex-col">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border/50 px-8 py-5">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            {title}
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {editing ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleCancel}
                                >
                                    <LuX className="mr-1.5 h-3.5 w-3.5" />
                                    Cancelar
                                </Button>
                                <Button size="sm" onClick={handleSave}>
                                    <LuCheck className="mr-1.5 h-3.5 w-3.5" />
                                    Salvar
                                </Button>
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setCopilotOpen(true)
                                    }}
                                >
                                    <LuSparkles className="mr-1.5 h-3.5 w-3.5" />
                                    Sugerir com IA
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditing(true)}
                                >
                                    <LuPencil className="mr-1.5 h-3.5 w-3.5" />
                                    Editar
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setCopilotOpen(true)}
                                >
                                    <LuBot className="mr-1.5 h-3.5 w-3.5" />
                                    Copilot
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6">
                    <div className="mx-auto max-w-2xl">
                        {children({ value, onChange: setValue, editing })}
                    </div>
                </div>
            </div>

            <CopilotChat
                project={activeProject}
                open={copilotOpen}
                onOpenChange={setCopilotOpen}
            />
        </>
    )
}
