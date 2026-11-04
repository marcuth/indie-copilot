import { LuCompass, LuMegaphone, LuCircleCheck } from "react-icons/lu"
import type { UserAcquisitionFormValues } from "@/schemas/planning"
import { SectionPage } from "@/components/project/section-page"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const VALIDATION_STRATEGIES = [
    { id: "landing-page", label: "Landing Page com Pré-cadastro" },
    { id: "user-interviews", label: "Entrevistas com Usuários 1-a-1" },
    { id: "simple-mvp", label: "MVP Simples (No-Code ou Protótipo)" },
    { id: "prototype", label: "Protótipo Navegável (Figma)" },
    { id: "cold-email", label: "Cold Email / Prospecção Direta" },
    { id: "whatsapp-group", label: "Grupo VIP no WhatsApp / Discord" },
    { id: "online-community", label: "Validação em Comunidades (Reddit/X)" },
    { id: "social-media", label: "Testes de Demanda em Redes Sociais" },
    { id: "market-research", label: "Formulários e Pesquisa de Mercado" },
    { id: "a-b-testing", label: "Testes A/B de Copy e Oferta" },
]

const ACQUISITION_CHANNELS = [
    { id: "twitter-x", label: "Twitter / X (Build in Public)" },
    { id: "linkedin", label: "LinkedIn Orgânico" },
    { id: "seo", label: "SEO & Tráfego Orgânico" },
    { id: "content-marketing", label: "Marketing de Conteúdo / Blog" },
    { id: "communities", label: "Comunidades (Reddit, Indie Hackers)" },
    { id: "youtube", label: "YouTube / Vídeos" },
    { id: "cold-outreach", label: "Cold Outreach Ativo" },
    { id: "email-marketing", label: "Email Marketing / Newsletter" },
    { id: "google-ads", label: "Google Ads (Search)" },
    { id: "meta-ads", label: "Meta Ads (Instagram/FB)" },
    { id: "referrals", label: "Programa de Indicação (Viral Loop)" },
    { id: "partnerships", label: "Parcerias e Co-marketing" },
    { id: "influencers", label: "Micro-influenciadores de Nicho" },
    { id: "events", label: "Meetups & Eventos de Tecnologia" },
    { id: "podcast", label: "Podcasts & Entrevistas" },
    { id: "tiktok", label: "TikTok / Shorts" },
]

const defaultValues: UserAcquisitionFormValues = {
    strategy: "",
    validationStrategies: [],
    acquisitionChannels: [],
}

export function UserAcquisitionPage() {
    return (
        <SectionPage
            title="Aquisição de Usuários & Tração"
            description="Defina como você validará a demanda inicial e quais canais trarão os primeiros clientes"
            fieldKey="userAcquisition"
        >
            {({ value, onChange, editing }) => (
                <UserAcquisitionContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function UserAcquisitionContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<UserAcquisitionFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { ...defaultValues, strategy: value }
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
            if (value) setFormData((prev) => ({ ...prev, strategy: value }))
        }
    }, [value])

    const toggleValidation = (id: string) => {
        const current = formData.validationStrategies || []
        const exists = current.includes(id)
        const next = exists ? current.filter((x) => x !== id) : [...current, id]
        const updated = { ...formData, validationStrategies: next }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const toggleChannel = (id: string) => {
        const current = formData.acquisitionChannels || []
        const exists = current.includes(id)
        const next = exists ? current.filter((x) => x !== id) : [...current, id]
        const updated = { ...formData, acquisitionChannels: next }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const handleStrategyChange = (strategy: string) => {
        const updated = { ...formData, strategy }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.strategy ||
        formData.validationStrategies.length > 0 ||
        formData.acquisitionChannels.length > 0,
    )

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                {/* Estratégia Geral */}
                <div className="space-y-2">
                    <Label
                        htmlFor="strategy"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuCompass className="h-4 w-4 text-primary" />
                        Estratégia Geral de Aquisição e Tração *
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Como você planeja encontrar e atrair seus primeiros 10 e
                        100 clientes pagantes?
                    </p>
                    <Textarea
                        id="strategy"
                        value={formData.strategy}
                        onChange={(e) => handleStrategyChange(e.target.value)}
                        placeholder="Ex: Foco inicial em Build in Public no X/Twitter compartilhando o desenvolvimento diário, combinado com lançamento em diretórios como Product Hunt..."
                        rows={4}
                    />
                </div>

                {/* Estratégias de Validação */}
                <div className="space-y-3 pt-2">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuCircleCheck className="h-4 w-4 text-emerald-500" />
                            Métodos de Validação Inicial
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Selecione as formas que você usará para validar se o
                            problema existe antes de codificar tudo
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {VALIDATION_STRATEGIES.map((item) => {
                            const isSelected =
                                formData.validationStrategies.includes(item.id)
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleValidation(item.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold"
                                            : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Canais de Tração */}
                <div className="space-y-3 pt-2">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuMegaphone className="h-4 w-4 text-blue-500" />
                            Canais de Tração & Marketing
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Onde você distribuirá seu produto ativamente
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ACQUISITION_CHANNELS.map((item) => {
                            const isSelected =
                                formData.acquisitionChannels.includes(item.id)
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggleChannel(item.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                                        isSelected
                                            ? "border-primary bg-primary/10 text-primary font-semibold"
                                            : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted"
                                    }`}
                                >
                                    {item.label}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuCompass className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Aquisição ainda não planejada
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Defina suas estratégias de validação e canais de tração
                        para garantir distribuição desde o primeiro dia.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            {/* Estratégia Geral */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LuCompass className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Estratégia Geral de Tração
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.strategy || "Não informada"}
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Validação Selecionada */}
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <LuCircleCheck className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            Métodos de Validação (
                            {formData.validationStrategies.length})
                        </h3>
                    </div>
                    {formData.validationStrategies.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.validationStrategies.map((id) => {
                                const found = VALIDATION_STRATEGIES.find(
                                    (x) => x.id === id,
                                )
                                return (
                                    <Badge
                                        key={id}
                                        variant="outline"
                                        className="border-emerald-500/30 bg-emerald-500/5 text-xs py-1 px-2.5"
                                    >
                                        {found ? found.label : id}
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Nenhuma validação selecionada
                        </p>
                    )}
                </div>

                {/* Canais de Tração */}
                <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                            <LuMegaphone className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            Canais de Tração (
                            {formData.acquisitionChannels.length})
                        </h3>
                    </div>
                    {formData.acquisitionChannels.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.acquisitionChannels.map((id) => {
                                const found = ACQUISITION_CHANNELS.find(
                                    (x) => x.id === id,
                                )
                                return (
                                    <Badge
                                        key={id}
                                        variant="outline"
                                        className="border-primary/30 bg-primary/5 text-xs py-1 px-2.5"
                                    >
                                        {found ? found.label : id}
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            Nenhum canal selecionado
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
