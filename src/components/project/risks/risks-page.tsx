import {
    LuTriangleAlert,
    LuCpu,
    LuTrendingDown,
    LuUsers,
    LuShieldCheck,
} from "react-icons/lu"
import { SectionPage } from "@/components/project/section-page"
import type { RisksFormValues } from "@/schemas/planning"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: RisksFormValues = {
    technical: "",
    market: "",
    team: "",
    mitigationStrategies: "",
}

export function RisksPage() {
    return (
        <SectionPage
            title="Riscos & Mitigação"
            description="Mapeie riscos técnicos, de mercado e de equipe com seus respectivos planos de mitigação"
            fieldKey="risks"
        >
            {({ value, onChange, editing }) => (
                <RisksContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function RisksContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<RisksFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { ...defaultValues, technical: value }
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
            if (value) setFormData((prev) => ({ ...prev, technical: value }))
        }
    }, [value])

    const handleFieldChange = (field: keyof RisksFormValues, val: string) => {
        const updated = { ...formData, [field]: val }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.technical ||
        formData.market ||
        formData.team ||
        formData.mitigationStrategies,
    )

    if (editing) {
        return (
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
                {/* Risco Técnico */}
                <div className="space-y-2">
                    <Label
                        htmlFor="technical"
                        className="text-sm font-semibold flex items-center gap-1.5 text-amber-500"
                    >
                        <LuCpu className="h-4 w-4" />
                        Risco Técnico
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Complexidade arquitetural, instabilidade de APIs
                        externas, limites de hardware
                    </p>
                    <Textarea
                        id="technical"
                        value={formData.technical}
                        onChange={(e) =>
                            handleFieldChange("technical", e.target.value)
                        }
                        placeholder="Ex: Dependência de latência de LLMs remotos, complexidade de empacotamento desktop multiplataforma..."
                        rows={4}
                    />
                </div>

                {/* Risco de Mercado */}
                <div className="space-y-2">
                    <Label
                        htmlFor="market"
                        className="text-sm font-semibold flex items-center gap-1.5 text-red-500"
                    >
                        <LuTrendingDown className="h-4 w-4" />
                        Risco de Mercado & Adoção
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        O usuário pode não querer pagar, concorrência pode
                        copiar rápido
                    </p>
                    <Textarea
                        id="market"
                        value={formData.market}
                        onChange={(e) =>
                            handleFieldChange("market", e.target.value)
                        }
                        placeholder="Ex: Desenvolvedores podem preferir usar arquivos Markdown manuais em vez de um app dedicado..."
                        rows={4}
                    />
                </div>

                {/* Risco de Equipe */}
                <div className="space-y-2">
                    <Label
                        htmlFor="team"
                        className="text-sm font-semibold flex items-center gap-1.5 text-blue-500"
                    >
                        <LuUsers className="h-4 w-4" />
                        Risco de Equipe / Execução Solo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Tempo limitado disponível, risco de burnout, falta de
                        skills em marketing
                    </p>
                    <Textarea
                        id="team"
                        value={formData.team}
                        onChange={(e) =>
                            handleFieldChange("team", e.target.value)
                        }
                        placeholder="Ex: Fundador solo trabalhando apenas à noite, pouca experiência prévia em distribuição paga..."
                        rows={4}
                    />
                </div>

                {/* Mitigação */}
                <div className="space-y-2">
                    <Label
                        htmlFor="mitigation"
                        className="text-sm font-semibold flex items-center gap-1.5 text-emerald-500"
                    >
                        <LuShieldCheck className="h-4 w-4" />
                        Estratégias de Mitigação
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Como você contornará cada um dos riscos mapeados
                    </p>
                    <Textarea
                        id="mitigation"
                        value={formData.mitigationStrategies}
                        onChange={(e) =>
                            handleFieldChange(
                                "mitigationStrategies",
                                e.target.value,
                            )
                        }
                        placeholder="Ex: Manter o escopo estrito ao MVP, usar templates comprovados, distribuir abertamente em comunidades open source..."
                        rows={4}
                    />
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                    <LuTriangleAlert className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Riscos ainda não avaliados
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Antecipe potenciais falhas técnicas, de mercado ou de
                        execução e planeje defesas antes que ocorram.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Técnico */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <LuCpu className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Risco Técnico
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.technical || "Não informado"}
                </p>
            </div>

            {/* Mercado */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <LuTrendingDown className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Risco de Mercado
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.market || "Não informado"}
                </p>
            </div>

            {/* Equipe */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <LuUsers className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Risco de Execução & Equipe
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.team || "Não informado"}
                </p>
            </div>

            {/* Mitigação */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <LuShieldCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Planos de Mitigação
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.mitigationStrategies || "Não informado"}
                </p>
            </div>
        </div>
    )
}
