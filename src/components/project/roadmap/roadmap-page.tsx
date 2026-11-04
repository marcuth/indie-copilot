import { LuMilestone, LuPlus, LuTrash2, LuClock } from "react-icons/lu"
import { SectionPage } from "@/components/project/section-page"
import type { RoadmapFormValues } from "@/schemas/planning"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: RoadmapFormValues = {
    milestones: [],
}

export function RoadmapPage() {
    return (
        <SectionPage
            title="Roadmap & Entregas"
            description="Trace marcos cronológicos, prazos estimados e entregáveis principais do produto"
            fieldKey="roadmap"
        >
            {({ value, onChange, editing }) => (
                <RoadmapContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function RoadmapContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<RoadmapFormValues>(() => {
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

    const addMilestone = () => {
        const updated = {
            ...formData,
            milestones: [
                ...formData.milestones,
                { name: "", timeframe: "", description: "" },
            ],
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const removeMilestone = (index: number) => {
        const updated = {
            ...formData,
            milestones: formData.milestones.filter((_, i) => i !== index),
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const updateMilestone = (
        index: number,
        key: "name" | "timeframe" | "description",
        val: string,
    ) => {
        const next = [...formData.milestones]
        next[index] = { ...next[index], [key]: val }
        const updated = { ...formData, milestones: next }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = formData.milestones.length > 0

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuMilestone className="h-4 w-4 text-primary" />
                            Marcos Cronológicos (Milestones)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Defina os pontos de validação e lançamento
                            sequenciais do seu produto
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addMilestone}
                    >
                        <LuPlus className="mr-1 h-3.5 w-3.5" />
                        Adicionar Marco
                    </Button>
                </div>

                {formData.milestones.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                        Nenhum marco adicionado. Clique no botão acima para
                        adicionar.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.milestones.map((ms, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border/60 bg-card p-5 space-y-3 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid gap-3 sm:grid-cols-2 flex-1">
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">
                                                Nome do Marco *
                                            </Label>
                                            <Input
                                                value={ms.name}
                                                onChange={(e) =>
                                                    updateMilestone(
                                                        idx,
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex: MVP Inicial & Testes com Usuários"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">
                                                Prazo / Período (Timeframe) *
                                            </Label>
                                            <Input
                                                value={ms.timeframe}
                                                onChange={(e) =>
                                                    updateMilestone(
                                                        idx,
                                                        "timeframe",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Ex: Q1 2026 ou Semanas 1 a 3"
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeMilestone(idx)}
                                        className="text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <LuTrash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Entregáveis & Descrição
                                    </Label>
                                    <Textarea
                                        value={ms.description || ""}
                                        onChange={(e) =>
                                            updateMilestone(
                                                idx,
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="O que precisa estar pronto para considerar esse marco concluído?"
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
                    <LuMilestone className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Roadmap ainda vazio
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Estruture seus primeiros passos e datas-chave ou deixe o
                        Copilot sugerir um cronograma viável.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="relative pl-6 border-l-2 border-border/80 space-y-8">
                {formData.milestones.map((ms, idx) => (
                    <div key={idx} className="relative group">
                        {/* Marcador da timeline */}
                        <div className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background ring-4 ring-background" />

                        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                <h3 className="font-bold text-base text-foreground">
                                    {ms.name || `Marco #${idx + 1}`}
                                </h3>
                                {ms.timeframe && (
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1 text-xs"
                                    >
                                        <LuClock className="h-3 w-3" />
                                        {ms.timeframe}
                                    </Badge>
                                )}
                            </div>

                            {ms.description && (
                                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                                    {ms.description}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
