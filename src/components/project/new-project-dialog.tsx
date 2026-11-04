import { useNavigate } from "react-router-dom"
import { LuRocket } from "react-icons/lu"
import { useState } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select"
import { useActiveProject } from "../../contexts/active-project-context"
import { getCategories } from "../../lib/db/database-client"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

interface NewProjectDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NewProjectDialog({
    open,
    onOpenChange,
}: NewProjectDialogProps) {
    const { createNewProject } = useActiveProject()
    const navigate = useNavigate()
    const categories = getCategories()

    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [categoryId, setCategoryId] = useState<string>("")
    const [slogan, setSlogan] = useState("")
    const [website, setWebsite] = useState("")

    const handleCreate = () => {
        if (!name.trim()) return
        const project = createNewProject({
            name: name.trim(),
            description: description.trim() || undefined,
            categoryId: categoryId || undefined,
            slogan: slogan.trim() || undefined,
            website: website.trim() || undefined,
        })
        // Reset
        setName("")
        setDescription("")
        setCategoryId("")
        setSlogan("")
        setWebsite("")
        onOpenChange(false)
        navigate(`/project/${project.id}/overview`)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <LuRocket className="h-5 w-5 text-primary" />
                        Novo Projeto
                    </DialogTitle>
                    <DialogDescription>
                        Crie um novo projeto e comece a planejar com o Indie
                        Copilot.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4 py-2">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="project-name">
                            Nome do Projeto{" "}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="project-name"
                            placeholder="Ex: Indie Copilot, Launchpad, ..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleCreate()
                            }
                            autoFocus
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="project-slogan">Slogan</Label>
                        <Input
                            id="project-slogan"
                            placeholder="Ex: Ship faster, think smarter"
                            value={slogan}
                            onChange={(e) => setSlogan(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="project-description">Descrição</Label>
                        <Textarea
                            id="project-description"
                            placeholder="O que esse projeto faz? Qual problema resolve?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="project-category">Categoria</Label>
                            <Select
                                value={categoryId}
                                onValueChange={setCategoryId}
                            >
                                <SelectTrigger
                                    id="project-category"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Selecionar..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <Label htmlFor="project-website">Website</Label>
                            <Input
                                id="project-website"
                                placeholder="https://..."
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={!name.trim()}>
                        <LuRocket className="mr-2 h-4 w-4" />
                        Criar Projeto
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
