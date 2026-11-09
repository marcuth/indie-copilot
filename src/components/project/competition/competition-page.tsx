import {
    LuTrendingUp,
    LuPlus,
    LuTrash2,
    LuShieldCheck,
    LuLayers,
    LuChartPie,
    LuExternalLink,
    LuPackage,
} from "react-icons/lu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { SectionPage } from "@/components/project/section-page"
import type { CompetitionFormValues } from "@/schemas/planning"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

    const saveCompetitors = (
        competitors: CompetitionFormValues["competitors"],
    ) => {
        const updated = { ...formData, competitors }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const addProduct = (compIndex: number) => {
        saveCompetitors(
            formData.competitors.map((comp, i) =>
                i === compIndex
                    ? {
                          ...comp,
                          productsOrServices: [
                              ...(comp.productsOrServices ?? []),
                              {
                                  name: "",
                                  description: "",
                                  price: 0,
                                  currencyCode: "BRL",
                                  features: [],
                              },
                          ],
                      }
                    : comp,
            ),
        )
    }

    const removeProduct = (compIndex: number, prodIndex: number) => {
        saveCompetitors(
            formData.competitors.map((comp, i) =>
                i === compIndex
                    ? {
                          ...comp,
                          productsOrServices: (
                              comp.productsOrServices ?? []
                          ).filter((_, j) => j !== prodIndex),
                      }
                    : comp,
            ),
        )
    }

    const updateProduct = (
        compIndex: number,
        prodIndex: number,
        patch: Partial<
            CompetitionFormValues["competitors"][0]["productsOrServices"][0]
        >,
    ) => {
        saveCompetitors(
            formData.competitors.map((comp, i) =>
                i === compIndex
                    ? {
                          ...comp,
                          productsOrServices: (
                              comp.productsOrServices ?? []
                          ).map((prod, j) =>
                              j === prodIndex ? { ...prod, ...patch } : prod,
                          ),
                      }
                    : comp,
            ),
        )
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
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold">
                                                    Nome do Concorrente
                                                </Label>
                                                <Input
                                                    value={comp.name}
                                                    onChange={(e) =>
                                                        updateCompetitor(
                                                            idx,
                                                            "name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ex: Notion"
                                                    className="text-sm font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs font-semibold">
                                                    Website
                                                </Label>
                                                <Input
                                                    value={comp.website || ""}
                                                    onChange={(e) =>
                                                        updateCompetitor(
                                                            idx,
                                                            "website",
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Ex: https://notion.so"
                                                    className="text-sm"
                                                />
                                            </div>
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
                                    <div className="space-y-1">
                                        <Label className="text-xs font-semibold">
                                            Descrição
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Resumo do concorrente, modelo de
                                            precificação e pontos fracos
                                        </p>
                                        <Textarea
                                            value={comp.description || ""}
                                            onChange={(e) =>
                                                updateCompetitor(
                                                    idx,
                                                    "description",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Ex: Foco em times grandes, caro para freelancers"
                                            className="text-xs"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Produtos / Planos do concorrente */}
                                    <div className="space-y-3 border-t border-border/40 pt-3">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                                    <LuPackage className="h-3.5 w-3.5 text-primary" />
                                                    Produtos / Planos (
                                                    {
                                                        (
                                                            comp.productsOrServices ??
                                                            []
                                                        ).length
                                                    }
                                                    )
                                                </Label>
                                                <p className="text-[11px] text-muted-foreground">
                                                    O que este concorrente
                                                    vende: planos, preços e
                                                    funcionalidades
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => addProduct(idx)}
                                            >
                                                <LuPlus className="mr-1 h-3.5 w-3.5" />
                                                Adicionar Produto
                                            </Button>
                                        </div>

                                        {(comp.productsOrServices ?? []).map(
                                            (prod, pIdx) => (
                                                <div
                                                    key={pIdx}
                                                    className="rounded-lg border border-border/50 bg-background/50 p-3 space-y-3"
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="grid flex-1 gap-3 sm:grid-cols-3">
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-semibold">
                                                                    Nome do
                                                                    Produto/Plano
                                                                </Label>
                                                                <Input
                                                                    value={
                                                                        prod.name
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateProduct(
                                                                            idx,
                                                                            pIdx,
                                                                            {
                                                                                name: e
                                                                                    .target
                                                                                    .value,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="Ex: Plano Pro"
                                                                    className="text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-semibold">
                                                                    Preço
                                                                </Label>
                                                                <Input
                                                                    type="number"
                                                                    min="0"
                                                                    step="0.01"
                                                                    value={
                                                                        prod.price ||
                                                                        0
                                                                    }
                                                                    onChange={(
                                                                        e,
                                                                    ) =>
                                                                        updateProduct(
                                                                            idx,
                                                                            pIdx,
                                                                            {
                                                                                price:
                                                                                    parseFloat(
                                                                                        e
                                                                                            .target
                                                                                            .value,
                                                                                    ) ||
                                                                                    0,
                                                                            },
                                                                        )
                                                                    }
                                                                    placeholder="0.00"
                                                                    className="text-sm"
                                                                />
                                                            </div>
                                                            <div className="space-y-1">
                                                                <Label className="text-xs font-semibold">
                                                                    Moeda
                                                                </Label>
                                                                <Select
                                                                    value={
                                                                        prod.currencyCode ||
                                                                        "BRL"
                                                                    }
                                                                    onValueChange={(
                                                                        val,
                                                                    ) =>
                                                                        updateProduct(
                                                                            idx,
                                                                            pIdx,
                                                                            {
                                                                                currencyCode:
                                                                                    val,
                                                                            },
                                                                        )
                                                                    }
                                                                >
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Moeda" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="BRL">
                                                                            BRL
                                                                            (R$)
                                                                        </SelectItem>
                                                                        <SelectItem value="USD">
                                                                            USD
                                                                            ($)
                                                                        </SelectItem>
                                                                        <SelectItem value="EUR">
                                                                            EUR
                                                                            (€)
                                                                        </SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                removeProduct(
                                                                    idx,
                                                                    pIdx,
                                                                )
                                                            }
                                                            className="text-destructive hover:bg-destructive/10 shrink-0"
                                                        >
                                                            <LuTrash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs font-semibold">
                                                            Descrição do Produto
                                                        </Label>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            Para quem é e qual
                                                            problema resolve
                                                        </p>
                                                        <Textarea
                                                            rows={3}
                                                            value={
                                                                prod.description ||
                                                                ""
                                                            }
                                                            onChange={(e) =>
                                                                updateProduct(
                                                                    idx,
                                                                    pIdx,
                                                                    {
                                                                        description:
                                                                            e
                                                                                .target
                                                                                .value,
                                                                    },
                                                                )
                                                            }
                                                            placeholder="Ex: Plano para times pequenos com colaboração em tempo real"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <Label className="text-xs font-semibold">
                                                            Funcionalidades
                                                            (Features)
                                                        </Label>
                                                        <p className="text-[11px] text-muted-foreground">
                                                            O que está incluído.
                                                            Pressione Enter para
                                                            adicionar cada item
                                                        </p>
                                                        <TagInput
                                                            value={
                                                                prod.features ||
                                                                []
                                                            }
                                                            onChange={(
                                                                features,
                                                            ) =>
                                                                updateProduct(
                                                                    idx,
                                                                    pIdx,
                                                                    {
                                                                        features,
                                                                    },
                                                                )
                                                            }
                                                            placeholder="Ex: Integrações, Suporte prioritário"
                                                        />
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
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
                    <div className="grid gap-4 md:grid-cols-2">
                        {formData.competitors.map((comp, idx) => (
                            <CompetitorCard key={idx} competitor={comp} />
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

const CURRENCY_SYMBOLS: Record<string, string> = {
    BRL: "R$",
    USD: "$",
    EUR: "€",
}

function formatPrice(price: number, currencyCode: string): string {
    if (!price) return "Não informado"
    const symbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode
    return `${symbol} ${Number(price).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`
}

function getWebsiteUrl(website: string): string {
    return website.startsWith("http") ? website : `https://${website}`
}

function getWebsiteLabel(website: string): string {
    return website.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

function CompetitorCard({
    competitor,
}: {
    competitor: CompetitionFormValues["competitors"][0]
}) {
    const products = competitor.productsOrServices ?? []
    const initial = (competitor.name || "?").charAt(0).toUpperCase()

    return (
        <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-xs">
            <div className="flex items-start gap-3 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {initial}
                </div>
                <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-semibold text-foreground">
                        {competitor.name || "Sem nome"}
                    </h4>
                    {competitor.website && (
                        <a
                            href={getWebsiteUrl(competitor.website)}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 inline-flex max-w-full items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
                        >
                            <LuExternalLink className="h-3 w-3 shrink-0" />
                            <span className="truncate">
                                {getWebsiteLabel(competitor.website)}
                            </span>
                        </a>
                    )}
                </div>
                <Badge variant="secondary" className="shrink-0 text-[11px]">
                    {products.length}{" "}
                    {products.length === 1 ? "produto" : "produtos"}
                </Badge>
            </div>

            <p className="whitespace-pre-wrap px-5 pb-5 text-xs leading-relaxed text-muted-foreground">
                {competitor.description || "Nenhuma descrição informada"}
            </p>

            {products.length > 0 && (
                <div className="mt-auto space-y-2 border-t border-border/40 bg-muted/30 p-4">
                    <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                        <LuPackage className="h-3 w-3" />
                        Produtos / Planos
                    </p>
                    {products.map((prod, pIdx) => (
                        <div
                            key={pIdx}
                            className="space-y-2 rounded-lg border border-border/50 bg-card p-3"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-foreground">
                                    {prod.name || "Sem nome"}
                                </span>
                                <span className="shrink-0 text-xs font-bold text-foreground">
                                    {formatPrice(prod.price, prod.currencyCode)}
                                </span>
                            </div>
                            {prod.description && (
                                <p className="whitespace-pre-wrap text-[11px] leading-relaxed text-muted-foreground">
                                    {prod.description}
                                </p>
                            )}
                            {(prod.features ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {prod.features.map((feature, fIdx) => (
                                        <Badge
                                            key={fIdx}
                                            variant="outline"
                                            className="text-[10px] font-normal"
                                        >
                                            {feature}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
