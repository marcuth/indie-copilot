import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LuBot, LuExternalLink, LuPencil, LuCheck, LuX } from "react-icons/lu"
import { useActiveProject } from "@/contexts/active-project-context"
import { CopilotChat } from "@/components/copilot/copilot-chat"
import { getCategories } from "@/lib/db/database-client"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"

export function OverviewPage() {
    const { activeProject, updateActiveProject } = useActiveProject()
    const categories = getCategories()
    const [copilotOpen, setCopilotOpen] = useState(false)
    const [editing, setEditing] = useState(false)

    const [name, setName] = useState(activeProject?.name ?? "")
    const [slogan, setSlogan] = useState(activeProject?.slogan ?? "")
    const [description, setDescription] = useState(
        activeProject?.description ?? "",
    )
    const [website, setWebsite] = useState(activeProject?.website ?? "")
    const [categoryId, setCategoryId] = useState(
        activeProject?.categoryId ?? "",
    )
    const [alreadyExists, setAlreadyExists] = useState(
        activeProject?.alreadyExists ?? false,
    )

    useEffect(() => {
        if (activeProject) {
            setName(activeProject.name ?? "")
            setSlogan(activeProject.slogan ?? "")
            setDescription(activeProject.description ?? "")
            setWebsite(activeProject.website ?? "")
            setCategoryId(activeProject.categoryId ?? "")
            setAlreadyExists(activeProject.alreadyExists ?? false)
        }
    }, [activeProject])

    if (!activeProject) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <p className="text-muted-foreground">
                        Nenhum projeto selecionado
                    </p>
                </div>
            </div>
        )
    }

    const handleSave = () => {
        updateActiveProject({
            name: name.trim() || activeProject.name,
            slogan: slogan.trim() || undefined,
            description: description.trim() || undefined,
            website: website.trim() || undefined,
            categoryId: categoryId || undefined,
            alreadyExists,
        })
        setEditing(false)
    }

    const handleCancel = () => {
        setName(activeProject.name)
        setSlogan(activeProject.slogan ?? "")
        setDescription(activeProject.description ?? "")
        setWebsite(activeProject.website ?? "")
        setCategoryId(activeProject.categoryId ?? "")
        setAlreadyExists(activeProject.alreadyExists)
        setEditing(false)
    }

    const currentCategoryId = editing
        ? categoryId
        : activeProject.categoryId || categoryId
    const category =
        categories.find(
            (c: { id: string; slug: string }) =>
                c.id === currentCategoryId || c.slug === currentCategoryId,
        ) || activeProject.category

    return (
        <>
            <div className="flex h-full flex-col">
                {/* Page header */}
                <div className="flex items-center justify-between border-b border-border/50 px-8 py-5">
                    <div>
                        <h1 className="font-heading text-2xl font-bold">
                            Visão Geral
                        </h1>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Identidade e informações básicas do projeto
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
                    <div className="mx-auto max-w-2xl space-y-6">
                        {/* Project identity */}
                        <div className="rounded-xl border border-border/50 bg-card p-6">
                            <h2 className="font-heading text-base font-semibold mb-4">
                                Identidade do Projeto
                            </h2>
                            <div className="grid gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium">
                                        Nome
                                    </label>
                                    {editing ? (
                                        <Input
                                            value={name}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) => setName(e.target.value)}
                                            placeholder="Nome do projeto"
                                        />
                                    ) : (
                                        <p className="text-sm">
                                            {activeProject.name}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium">
                                        Slogan
                                    </label>
                                    {editing ? (
                                        <Input
                                            value={slogan}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLInputElement>,
                                            ) => setSlogan(e.target.value)}
                                            placeholder="Slogan curto e marcante"
                                        />
                                    ) : (
                                        <p className="text-sm italic text-muted-foreground">
                                            {activeProject.slogan ||
                                                "Não informado"}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium">
                                        Descrição
                                    </label>
                                    {editing ? (
                                        <Textarea
                                            value={description}
                                            onChange={(
                                                e: React.ChangeEvent<HTMLTextAreaElement>,
                                            ) => setDescription(e.target.value)}
                                            placeholder="O que esse produto faz?"
                                            rows={3}
                                            className="resize-none"
                                        />
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            {activeProject.description ||
                                                "Não informado"}
                                        </p>
                                    )}
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium">
                                            Website
                                        </label>
                                        {editing ? (
                                            <Input
                                                value={website}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>,
                                                ) => setWebsite(e.target.value)}
                                                placeholder="https://..."
                                            />
                                        ) : activeProject.website ? (
                                            <a
                                                href={activeProject.website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-sm text-primary hover:underline"
                                            >
                                                {activeProject.website}
                                                <LuExternalLink className="h-3 w-3" />
                                            </a>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Não informado
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-sm font-medium">
                                            Categoria
                                        </label>
                                        {editing ? (
                                            <Select
                                                value={categoryId}
                                                onValueChange={setCategoryId}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Selecionar..." />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(
                                                        (cat: {
                                                            id: string
                                                            name: string
                                                        }) => (
                                                            <SelectItem
                                                                key={cat.id}
                                                                value={cat.id}
                                                            >
                                                                {cat.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        ) : (
                                            <div>
                                                {category ? (
                                                    <Badge variant="secondary">
                                                        {
                                                            (
                                                                category as {
                                                                    name: string
                                                                }
                                                            ).name
                                                        }
                                                    </Badge>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">
                                                        Não categorizado
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-medium">
                                        Status
                                    </label>
                                    {editing ? (
                                        <div className="flex items-center gap-2">
                                            <Checkbox
                                                id="already-exists"
                                                checked={alreadyExists}
                                                onCheckedChange={(checked) =>
                                                    setAlreadyExists(
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <label
                                                htmlFor="already-exists"
                                                className="text-sm cursor-pointer"
                                            >
                                                Produto já existe no mercado
                                            </label>
                                        </div>
                                    ) : (
                                        <Badge
                                            variant={
                                                activeProject.alreadyExists
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {activeProject.alreadyExists
                                                ? "Produto existente"
                                                : "Em ideação / construção"}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                {
                                    label: "Criado em",
                                    value: new Date(
                                        activeProject.createdAt,
                                    ).toLocaleDateString("pt-BR"),
                                },
                                {
                                    label: "Última atualização",
                                    value: new Date(
                                        activeProject.updatedAt,
                                    ).toLocaleDateString("pt-BR"),
                                },
                                {
                                    label: "ID do Projeto",
                                    value:
                                        activeProject.id.substring(0, 8) +
                                        "...",
                                },
                            ].map((stat) => (
                                <div
                                    key={stat.label}
                                    className="rounded-xl border border-border/50 bg-card p-4"
                                >
                                    <p className="text-xs text-muted-foreground">
                                        {stat.label}
                                    </p>
                                    <p className="mt-1 font-mono text-sm font-medium">
                                        {stat.value}
                                    </p>
                                </div>
                            ))}
                        </div>
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
