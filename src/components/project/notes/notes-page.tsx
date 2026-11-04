import {
    LuBot,
    LuPlus,
    LuTrash2,
    LuCheck,
    LuX,
    LuStickyNote,
} from "react-icons/lu"
import { useState, useEffect } from "react"

import {
    getNotes,
    createNote,
    updateNote,
    deleteNote,
} from "../../../lib/db/database-client"
import { useActiveProject } from "../../../contexts/active-project-context"
import { CopilotChat } from "../../copilot/copilot-chat"
import type { ProjectNote } from "../../../types"
import { ScrollArea } from "../../ui/scroll-area"
import { Textarea } from "../../ui/textarea"
import { Button } from "../../ui/button"
import { Badge } from "../../ui/badge"

export function NotesPage() {
    const { activeProject } = useActiveProject()
    const [notes, setNotes] = useState<ProjectNote[]>([])
    const [copilotOpen, setCopilotOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editContent, setEditContent] = useState("")
    const [newContent, setNewContent] = useState("")
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        if (activeProject) {
            setNotes(getNotes(activeProject.id))
        }
    }, [activeProject])

    if (!activeProject) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">
                    Nenhum projeto selecionado
                </p>
            </div>
        )
    }

    const handleAdd = () => {
        if (!newContent.trim()) return
        createNote({ content: newContent.trim(), projectId: activeProject.id })
        setNotes(getNotes(activeProject.id))
        setNewContent("")
        setAdding(false)
    }

    const handleEdit = (note: ProjectNote) => {
        setEditingId(note.id)
        setEditContent(note.content)
    }

    const handleSave = () => {
        if (!editingId) return
        updateNote(editingId, { content: editContent })
        setNotes(getNotes(activeProject.id))
        setEditingId(null)
    }

    const handleDelete = (id: string) => {
        deleteNote(id)
        setNotes(getNotes(activeProject.id))
    }

    return (
        <>
            <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-border/50 px-8 py-5">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            Notas
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Anotações rápidas e ideias sobre o projeto
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdding(true)}
                        >
                            <LuPlus className="mr-1.5 h-3.5 w-3.5" />
                            Nova nota
                        </Button>
                        <Button size="sm" onClick={() => setCopilotOpen(true)}>
                            <LuBot className="mr-1.5 h-3.5 w-3.5" />
                            Copilot
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1 px-8 py-6">
                    <div className="mx-auto max-w-2xl space-y-4">
                        {/* New note input */}
                        {adding && (
                            <div className="rounded-xl border border-primary/30 bg-card p-4">
                                <Textarea
                                    value={newContent}
                                    onChange={(e) =>
                                        setNewContent(e.target.value)
                                    }
                                    placeholder="Escreva sua nota em Markdown..."
                                    rows={4}
                                    className="resize-none text-sm"
                                    autoFocus
                                />
                                <div className="mt-3 flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setAdding(false)
                                            setNewContent("")
                                        }}
                                    >
                                        <LuX className="mr-1.5 h-3.5 w-3.5" />
                                        Cancelar
                                    </Button>
                                    <Button size="sm" onClick={handleAdd}>
                                        <LuCheck className="mr-1.5 h-3.5 w-3.5" />
                                        Salvar
                                    </Button>
                                </div>
                            </div>
                        )}

                        {notes.length === 0 && !adding ? (
                            <div className="flex flex-col items-center gap-3 py-16 text-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted">
                                    <LuStickyNote className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        Nenhuma nota ainda
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Adicione anotações, ideias ou links
                                        úteis sobre o projeto
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAdding(true)}
                                >
                                    <LuPlus className="mr-1.5 h-3.5 w-3.5" />
                                    Primeira nota
                                </Button>
                            </div>
                        ) : null}

                        {notes.map((note) => (
                            <div
                                key={note.id}
                                className="group rounded-xl border border-border/50 bg-card p-4"
                            >
                                {editingId === note.id ? (
                                    <>
                                        <Textarea
                                            value={editContent}
                                            onChange={(e) =>
                                                setEditContent(e.target.value)
                                            }
                                            rows={4}
                                            className="resize-none text-sm"
                                            autoFocus
                                        />
                                        <div className="mt-3 flex justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setEditingId(null)
                                                }
                                            >
                                                <LuX className="mr-1.5 h-3.5 w-3.5" />
                                                Cancelar
                                            </Button>
                                            <Button
                                                size="sm"
                                                onClick={handleSave}
                                            >
                                                <LuCheck className="mr-1.5 h-3.5 w-3.5" />
                                                Salvar
                                            </Button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                            {note.content}
                                        </p>
                                        <div className="mt-3 flex items-center justify-between">
                                            <Badge
                                                variant="secondary"
                                                className="text-[10px] font-normal"
                                            >
                                                {new Date(
                                                    note.createdAt,
                                                ).toLocaleDateString("pt-BR", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </Badge>
                                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7"
                                                    onClick={() =>
                                                        handleEdit(note)
                                                    }
                                                >
                                                    <LuStickyNote className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-destructive"
                                                    onClick={() =>
                                                        handleDelete(note.id)
                                                    }
                                                >
                                                    <LuTrash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <CopilotChat
                project={activeProject}
                open={copilotOpen}
                onOpenChange={setCopilotOpen}
            />
        </>
    )
}
