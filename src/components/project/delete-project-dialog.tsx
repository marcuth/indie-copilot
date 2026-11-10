import { LuTrash2, LuTriangleAlert } from "react-icons/lu"
import type { ReactElement } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { getChatSessions, getNotes } from "../../lib/db/database-client"
import type { Project } from "../../types"
import { Button } from "../ui/button"

interface DeleteProjectDialogProps {
    /** Projeto a excluir; o diálogo fica fechado quando é null. */
    project: Project | null
    onCancel: () => void
    onConfirm: (project: Project) => void
}

function plural(count: number, singular: string, pluralForm: string): string {
    return `${count} ${count === 1 ? singular : pluralForm}`
}

export function DeleteProjectDialog({
    project,
    onCancel,
    onConfirm,
}: DeleteProjectDialogProps): ReactElement {
    const sessions = project ? getChatSessions(project.id) : []
    const messageCount = sessions.reduce(
        (total, session) => total + session.messages.length,
        0,
    )
    const noteCount = project ? getNotes(project.id).length : 0

    return (
        <Dialog
            open={project !== null}
            onOpenChange={(open) => {
                if (!open) onCancel()
            }}
        >
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LuTriangleAlert className="h-5 w-5 text-destructive" />
                        Excluir projeto?
                    </DialogTitle>
                    <DialogDescription>
                        Você está prestes a excluir{" "}
                        <strong className="text-foreground">
                            {project?.name}
                        </strong>
                        . Essa ação não pode ser desfeita.
                    </DialogDescription>
                </DialogHeader>

                <div className="rounded-lg bg-muted p-4 text-sm">
                    <p className="font-medium">Também serão excluídos:</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                        <li>Todo o planejamento e a logo do projeto</li>
                        <li>
                            {plural(
                                sessions.length,
                                "conversa com o Copilot",
                                "conversas com o Copilot",
                            )}{" "}
                            ({plural(messageCount, "mensagem", "mensagens")})
                        </li>
                        <li>{plural(noteCount, "nota", "notas")}</li>
                    </ul>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => project && onConfirm(project)}
                    >
                        <LuTrash2 className="mr-2 h-4 w-4" />
                        Excluir projeto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
