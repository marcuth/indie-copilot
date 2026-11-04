import {
    LuCheck,
    LuX,
    LuSparkles,
    LuTrendingUp,
    LuShieldAlert,
} from "react-icons/lu"
import { SectionPage } from "@/components/project/section-page"
import type { SwotFormValues } from "@/schemas/planning"
import { TagInput } from "@/components/ui/tag-input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: SwotFormValues = {
    strengths: [],
    weaknesses: [],
    opportunities: [],
    threats: [],
}

export function SwotAnalysisPage() {
    return (
        <SectionPage
            title="Matriz SWOT"
            description="Mapeie Forças (S), Fraquezas (W), Oportunidades (O) e Ameaças (T) estratégicas do projeto"
            fieldKey="swot"
        >
            {({ value, onChange, editing }) => (
                <SwotContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function SwotContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<SwotFormValues>(() => {
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

    const handleQuadrantChange = (
        quadrant: keyof SwotFormValues,
        items: string[],
    ) => {
        const updated = { ...formData, [quadrant]: items }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.strengths.length > 0 ||
        formData.weaknesses.length > 0 ||
        formData.opportunities.length > 0 ||
        formData.threats.length > 0,
    )

    if (editing) {
        return (
            <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
                {/* Forças (Strengths) */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-3">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5 text-emerald-500">
                            <LuCheck className="h-4 w-4" />
                            Forças (Strengths) — Fator Interno (+)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            O que você e seu produto fazem excepcionalmente bem?
                        </p>
                    </div>
                    <TagInput
                        value={formData.strengths}
                        onChange={(tags) =>
                            handleQuadrantChange("strengths", tags)
                        }
                        placeholder="Ex: Velocidade de iteração rápida"
                    />
                </div>

                {/* Fraquezas (Weaknesses) */}
                <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5 text-red-500">
                            <LuX className="h-4 w-4" />
                            Fraquezas (Weaknesses) — Fator Interno (-)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Onde falta experiência, recursos ou funcionalidades
                            chave?
                        </p>
                    </div>
                    <TagInput
                        value={formData.weaknesses}
                        onChange={(tags) =>
                            handleQuadrantChange("weaknesses", tags)
                        }
                        placeholder="Ex: Orçamento de marketing zero"
                    />
                </div>

                {/* Oportunidades (Opportunities) */}
                <div className="rounded-xl border border-blue-500/30 bg-blue-500/5 p-5 space-y-3">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5 text-blue-500">
                            <LuTrendingUp className="h-4 w-4" />
                            Oportunidades (Opportunities) — Fator Externo (+)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Tendências de mercado, carência dos concorrentes,
                            novas tecnologias
                        </p>
                    </div>
                    <TagInput
                        value={formData.opportunities}
                        onChange={(tags) =>
                            handleQuadrantChange("opportunities", tags)
                        }
                        placeholder="Ex: Demanda crescente por privacidade e apps locais"
                    />
                </div>

                {/* Ameaças (Threats) */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-5 space-y-3">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5 text-amber-500">
                            <LuShieldAlert className="h-4 w-4" />
                            Ameaças (Threats) — Fator Externo (-)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Ações de grandes players, mudanças regulatórias,
                            novas taxas
                        </p>
                    </div>
                    <TagInput
                        value={formData.threats}
                        onChange={(tags) =>
                            handleQuadrantChange("threats", tags)
                        }
                        placeholder="Ex: Big Techs lançarem recursos parecidos de graça"
                    />
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuSparkles className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Matriz SWOT ainda não preenchida
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Mapeie seus 4 quadrantes ou peça ao Copilot para
                        analisar sua concorrência e preencher os quadrantes
                        automaticamente.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Forças */}
            <div className="rounded-xl border border-emerald-500/30 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <LuCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Forças (Strengths)
                    </h3>
                </div>
                {formData.strengths.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.strengths.map((s) => (
                            <Badge
                                key={s}
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/5 text-xs py-1 px-2.5"
                            >
                                {s}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma força mapeada
                    </p>
                )}
            </div>

            {/* Fraquezas */}
            <div className="rounded-xl border border-red-500/30 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <LuX className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Fraquezas (Weaknesses)
                    </h3>
                </div>
                {formData.weaknesses.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.weaknesses.map((w) => (
                            <Badge
                                key={w}
                                variant="outline"
                                className="border-red-500/30 bg-red-500/5 text-xs py-1 px-2.5"
                            >
                                {w}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma fraqueza mapeada
                    </p>
                )}
            </div>

            {/* Oportunidades */}
            <div className="rounded-xl border border-blue-500/30 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <LuTrendingUp className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Oportunidades (Opportunities)
                    </h3>
                </div>
                {formData.opportunities.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.opportunities.map((o) => (
                            <Badge
                                key={o}
                                variant="outline"
                                className="border-blue-500/30 bg-blue-500/5 text-xs py-1 px-2.5"
                            >
                                {o}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma oportunidade mapeada
                    </p>
                )}
            </div>

            {/* Ameaças */}
            <div className="rounded-xl border border-amber-500/30 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <LuShieldAlert className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Ameaças (Threats)
                    </h3>
                </div>
                {formData.threats.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.threats.map((t) => (
                            <Badge
                                key={t}
                                variant="outline"
                                className="border-amber-500/30 bg-amber-500/5 text-xs py-1 px-2.5"
                            >
                                {t}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma ameaça mapeada
                    </p>
                )}
            </div>
        </div>
    )
}
