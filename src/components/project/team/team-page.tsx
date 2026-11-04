import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SectionPage } from "@/components/project/section-page"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LuUsers, LuPlus, LuTrash2 } from "react-icons/lu"
import type { TeamFormValues } from "@/schemas/planning"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
    "full-time": {
        label: "Tempo Integral (Full-time)",
        color: "border-emerald-500/40 text-emerald-500 bg-emerald-500/10",
    },
    "part-time": {
        label: "Meio Período (Part-time)",
        color: "border-blue-500/40 text-blue-500 bg-blue-500/10",
    },
    limited: {
        label: "Disponibilidade Limitada",
        color: "border-amber-500/40 text-amber-500 bg-amber-500/10",
    },
    "weekends-only": {
        label: "Finais de Semana",
        color: "border-purple-500/40 text-purple-500 bg-purple-500/10",
    },
    advisory: {
        label: "Mentor / Conselheiro",
        color: "border-primary/40 text-primary bg-primary/10",
    },
    freelancer: {
        label: "Freelancer / Sob Demanda",
        color: "border-border text-muted-foreground bg-muted/40",
    },
}

const defaultValues: TeamFormValues = {
    members: [],
}

export function TeamPage() {
    return (
        <SectionPage
            title="Equipe & Mentores"
            description="Mapeie os fundadores, mentores e colaboradores com suas responsabilidades e disponibilidades"
            fieldKey="team"
        >
            {({ value, onChange, editing }) => (
                <TeamContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function TeamContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<TeamFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            return defaultValues
        }
        return defaultValues
    })

    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                setFormData({ ...defaultValues, ...parsed })
            }
        } catch {
            // ignore
        }
    }, [value])

    const addMember = () => {
        const updated = {
            ...formData,
            members: [
                ...formData.members,
                {
                    name: "",
                    availability: "full-time" as const,
                    roles: [],
                    skills: [],
                    description: "",
                },
            ],
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const removeMember = (index: number) => {
        const updated = {
            ...formData,
            members: formData.members.filter((_, i) => i !== index),
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const updateMember = (
        index: number,
        patch: Partial<TeamFormValues["members"][0]>,
    ) => {
        const next = [...formData.members]
        next[index] = { ...next[index], ...patch }
        const updated = { ...formData, members: next }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = formData.members.length > 0

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuUsers className="h-4 w-4 text-primary" />
                            Membros, Sócios & Mentores
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Alocação de tempo e capacidades do time
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMember}
                    >
                        <LuPlus className="mr-1 h-3.5 w-3.5" />
                        Adicionar Membro
                    </Button>
                </div>

                {formData.members.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                        Nenhum membro cadastrado. Adicione a si mesmo ou sócios
                        acima.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.members.map((member, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid gap-3 sm:grid-cols-2 flex-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">
                                                Nome ou Apelido *
                                            </Label>
                                            <Input
                                                value={member.name}
                                                onChange={(e) =>
                                                    updateMember(idx, {
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Ex: Marcuth ou Fundador Solo"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">
                                                Disponibilidade
                                            </Label>
                                            <Select
                                                value={member.availability}
                                                onValueChange={(val) =>
                                                    updateMember(idx, {
                                                        availability:
                                                            val as TeamFormValues["members"][0]["availability"],
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="full-time">
                                                        Tempo Integral
                                                        (Full-time)
                                                    </SelectItem>
                                                    <SelectItem value="part-time">
                                                        Meio Período (Part-time)
                                                    </SelectItem>
                                                    <SelectItem value="limited">
                                                        Disponibilidade Limitada
                                                    </SelectItem>
                                                    <SelectItem value="weekends-only">
                                                        Finais de Semana
                                                    </SelectItem>
                                                    <SelectItem value="advisory">
                                                        Mentor / Conselheiro
                                                    </SelectItem>
                                                    <SelectItem value="freelancer">
                                                        Freelancer / Sob Demanda
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMember(idx)}
                                        className="text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <LuTrash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold">
                                            Funções / Papéis (Roles)
                                        </Label>
                                        <TagInput
                                            value={member.roles || []}
                                            onChange={(roles) =>
                                                updateMember(idx, { roles })
                                            }
                                            placeholder="Ex: Tech Lead, Product Designer"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold">
                                            Habilidades & Competências (Skills)
                                        </Label>
                                        <TagInput
                                            value={member.skills || []}
                                            onChange={(skills) =>
                                                updateMember(idx, { skills })
                                            }
                                            placeholder="Ex: React, Rust, UI/UX, Growth"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Bio / Observações
                                    </Label>
                                    <Textarea
                                        value={member.description || ""}
                                        onChange={(e) =>
                                            updateMember(idx, {
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Breve histórico ou foco específico no projeto"
                                        rows={2}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuUsers className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Equipe ainda não mapeada
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Adicione fundadores, freelancers ou mentores que
                        participam do projeto.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
            {formData.members.map((member, idx) => {
                const avail = AVAILABILITY_LABELS[member.availability] || {
                    label: member.availability,
                    color: "border-border text-muted-foreground",
                }
                const initials = (member.name || "U")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()

                return (
                    <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <Avatar className="h-10 w-10 border border-border">
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {initials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <h4 className="font-bold text-sm text-foreground">
                                        {member.name || "Sem Nome"}
                                    </h4>
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] py-0 px-2 mt-0.5 ${avail.color}`}
                                    >
                                        {avail.label}
                                    </Badge>
                                </div>
                            </div>

                            {member.description && (
                                <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                                    {member.description}
                                </p>
                            )}

                            {member.roles && member.roles.length > 0 && (
                                <div className="space-y-1 mb-3">
                                    <span className="text-[11px] font-semibold text-foreground">
                                        Papéis:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {member.roles.map((r, rIdx) => (
                                            <Badge
                                                key={rIdx}
                                                variant="secondary"
                                                className="text-[10px]"
                                            >
                                                {r}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {member.skills && member.skills.length > 0 && (
                                <div className="space-y-1">
                                    <span className="text-[11px] font-semibold text-muted-foreground">
                                        Skills:
                                    </span>
                                    <div className="flex flex-wrap gap-1">
                                        {member.skills.map((s, sIdx) => (
                                            <Badge
                                                key={sIdx}
                                                variant="outline"
                                                className="text-[10px]"
                                            >
                                                {s}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
