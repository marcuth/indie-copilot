import {
    LuTrendingUp,
    LuPlus,
    LuTrash2,
    LuShieldCheck,
    LuLayers,
    LuChartPie,
    LuExternalLink,
} from "react-icons/lu"
import { SectionPage } from "@/components/project/section-page"
import type { CompetitionFormValues } from "@/schemas/planning"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: CompetitionFormValues = {
    competitors: [],
    indirectAlternatives: "",
    marketSize: "",
    advantage: "",
}

export function CompetitionPage() {
    return (
        <SectionPage
            title="Mercado & Concorrência"
            description="Mapeie concorrentes diretos, produtos alternativos, tamanho do mercado e seu diferencial"
            fieldKey="competition"
        >
            {({ value, onChange, editing }) => (
                <CompetitionContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function CompetitionContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<CompetitionFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { ...defaultValues, advantage: value }
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
            if (value) setFormData((prev) => ({ ...prev, advantage: value }))
        }
    }, [value])

    const handleFieldChange = <K extends keyof CompetitionFormValues>(
        field: K,
        fieldValue: CompetitionFormValues[K],
    ) => {
        const updated = { ...formData, [field]: fieldValue }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const addCompetitor = () => {
        const updated = {
            ...formData,
            competitors: [
                ...formData.competitors,
                {
                    name: "",
                    description: "",
                    website: "",
                    productsOrServices: [],
                },
            ],
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const removeCompetitor = (index: number) => {
        const updated = {
            ...formData,
            competitors: formData.competitors.filter((_, i) => i !== index),
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const updateCompetitor = (
        index: number,
        key: "name" | "description" | "website",
        val: string,
    ) => {
        const updatedCompetitors = [...formData.competitors]
        updatedCompetitors[index] = {
            ...updatedCompetitors[index],
            [key]: val,
        }
        const updated = { ...formData, competitors: updatedCompetitors }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.competitors.length > 0 ||
        formData.indirectAlternatives ||
        formData.marketSize ||
        formData.advantage,
    )

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                {/* Concorrentes Diretos */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-sm font-semibold flex items-center gap-1.5">
                                <LuTrendingUp className="h-4 w-4 text-primary" />
                                Concorrentes Diretos
                            </Label>
                            <p className="text-xs text-muted-foreground">
                                Ferramentas ou empresas que disputam o mesmo
                                cliente
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addCompetitor}
                        >
                            <LuPlus className="mr-1 h-3.5 w-3.5" />
                            Adicionar Concorrente
                        </Button>
                    </div>

                    {formData.competitors.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
                            Nenhum concorrente cadastrado. Clique no botão acima
                            para adicionar.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {formData.competitors.map((comp, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-lg border border-border/60 bg-card/60 p-4 space-y-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1 grid gap-3 md:grid-cols-2">
                                            <Input
                                                value={comp.name}
                                                onChange={(e) =>
                                                    updateCompetitor(
                                                        idx,
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Nome do Concorrente (ex: Notion)"
                                                className="text-sm font-medium"
                                            />
                                            <Input
                                                value={comp.website || ""}
                                                onChange={(e) =>
                                                    updateCompetitor(
                                                        idx,
                                                        "website",
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="Website (ex: https://notion.so)"
                                                className="text-sm"
                                            />
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                removeCompetitor(idx)
                                            }
                                            className="text-destructive hover:bg-destructive/10 shrink-0"
                                        >
                                            <LuTrash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <Input
                                        value={comp.description || ""}
                                        onChange={(e) =>
                                            updateCompetitor(
                                                idx,
                                                "description",
                                                e.target.value,
                                            )
                                        }
                                        placeholder="Breve descrição, modelo de precificação ou pontos fracos"
                                        className="text-xs text-muted-foreground"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid gap-6 md:grid-cols-2 pt-2">
                    {/* Alternativas Indiretas */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="indirectAlternatives"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuLayers className="h-4 w-4 text-amber-500" />
                            Alternativas Indiretas
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Como o usuário resolve o problema hoje sem um
                            software dedicado?
                        </p>
                        <Textarea
                            id="indirectAlternatives"
                            value={formData.indirectAlternatives}
                            onChange={(e) =>
                                handleFieldChange(
                                    "indirectAlternatives",
                                    e.target.value,
                                )
                            }
                            placeholder="Ex: Planilhas do Excel, bloco de notas, processos manuais descentralizados..."
                            rows={3}
                        />
                    </div>

                    {/* Tamanho de Mercado */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="marketSize"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuChartPie className="h-4 w-4 text-emerald-500" />
                            Tamanho de Mercado (TAM / SAM / SOM)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Estimativa do mercado total, endereçável e
                            capturável
                        </p>
                        <Textarea
                            id="marketSize"
                            value={formData.marketSize}
                            onChange={(e) =>
                                handleFieldChange("marketSize", e.target.value)
                            }
                            placeholder="Ex: TAM: US$ 5B mercado global SaaS; SAM: US$ 500M criadores; SOM: US$ 10M foco inicial..."
                            rows={3}
                        />
                    </div>

                    {/* Vantagem Competitiva Chave */}
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="advantage"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuShieldCheck className="h-4 w-4 text-blue-500" />
                            Nosso Diferencial Chave / Vantagem Injusta
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            O motivo pelo qual o cliente escolherá seu produto e
                            não a concorrência
                        </p>
                        <Textarea
                            id="advantage"
                            value={formData.advantage}
                            onChange={(e) =>
                                handleFieldChange("advantage", e.target.value)
                            }
                            placeholder="Ex: 100% Local-First com privacidade total, suporte a qualquer LLM local e sem assinatura mensal recorrente."
                            rows={3}
                        />
                    </div>
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuTrendingUp className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Concorrência ainda não mapeada
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Adicione concorrentes diretos e alternativas para
                        entender seus diferenciais ou peça ao Copilot para
                        pesquisar referências.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Concorrentes Diretos */}
            {formData.competitors.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
                        <LuTrendingUp className="h-4 w-4 text-primary" />
                        Concorrentes Diretos ({formData.competitors.length})
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {formData.competitors.map((comp, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="font-semibold text-sm text-foreground">
                                            {comp.name || "Sem nome"}
                                        </h4>
                                        {comp.website && (
                                            <a
                                                href={
                                                    comp.website.startsWith(
                                                        "http",
                                                    )
                                                        ? comp.website
                                                        : `https://${comp.website}`
                                                }
                                                target="_blank"
                                                rel="noreferrer"
                                                className="text-muted-foreground hover:text-primary transition-colors"
                                                title="Visitar website"
                                            >
                                                <LuExternalLink className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                        {comp.description ||
                                            "Nenhuma descrição informada"}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                {/* Diferencial Chave */}
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs md:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <LuShieldCheck className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            Diferencial Chave / Vantagem Injusta
                        </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {formData.advantage || "Não informado"}
                    </p>
                </div>

                {/* Alternativas Indiretas */}
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                            <LuLayers className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            Alternativas Indiretas
                        </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {formData.indirectAlternatives || "Não informado"}
                    </p>
                </div>

                {/* Tamanho de Mercado */}
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <LuChartPie className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            Tamanho de Mercado
                        </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {formData.marketSize || "Não informado"}
                    </p>
                </div>
            </div>
        </div>
    )
}
