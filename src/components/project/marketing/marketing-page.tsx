import {
    LuMegaphone,
    LuRocket,
    LuShare2,
    LuPalette,
    LuFileText,
} from "react-icons/lu"
import { SectionPage } from "@/components/project/section-page"
import type { MarketingFormValues } from "@/schemas/planning"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: MarketingFormValues = {
    contentStrategy: "",
    socialMediaStrategy: "",
    launchPlan: "",
    branding: "",
}

export function MarketingPage() {
    return (
        <SectionPage
            title="Marketing & Lançamento"
            description="Estruture sua presença de marca, canais sociais, marketing de conteúdo e plano de lançamento"
            fieldKey="marketing"
        >
            {({ value, onChange, editing }) => (
                <MarketingContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function MarketingContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<MarketingFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { ...defaultValues, contentStrategy: value }
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
            if (value)
                setFormData((prev) => ({ ...prev, contentStrategy: value }))
        }
    }, [value])

    const handleFieldChange = (
        field: keyof MarketingFormValues,
        val: string,
    ) => {
        const updated = { ...formData, [field]: val }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.contentStrategy ||
        formData.socialMediaStrategy ||
        formData.launchPlan ||
        formData.branding,
    )

    if (editing) {
        return (
            <div className="grid gap-6 md:grid-cols-2 max-w-4xl">
                {/* Marketing de Conteúdo */}
                <div className="space-y-2">
                    <Label
                        htmlFor="contentStrategy"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuFileText className="h-4 w-4 text-primary" />
                        Estratégia de Conteúdo & Inbound
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Tutoriais, artigos de blog, documentação e guias que
                        atraem tráfego qualificado
                    </p>
                    <Textarea
                        id="contentStrategy"
                        value={formData.contentStrategy}
                        onChange={(e) =>
                            handleFieldChange("contentStrategy", e.target.value)
                        }
                        placeholder="Ex: Publicar casos reais de estudo, tutoriais de como montar um SaaS localmente..."
                        rows={4}
                    />
                </div>

                {/* Mídias Sociais */}
                <div className="space-y-2">
                    <Label
                        htmlFor="socialMediaStrategy"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuShare2 className="h-4 w-4 text-blue-500" />
                        Redes Sociais & Presença Pública
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Build in Public, frequência de postagens no X/LinkedIn,
                        engajamento
                    </p>
                    <Textarea
                        id="socialMediaStrategy"
                        value={formData.socialMediaStrategy}
                        onChange={(e) =>
                            handleFieldChange(
                                "socialMediaStrategy",
                                e.target.value,
                            )
                        }
                        placeholder="Ex: Postar progresso diário com screenshots no X, threads técnicas no LinkedIn..."
                        rows={4}
                    />
                </div>

                {/* Plano de Lançamento */}
                <div className="space-y-2">
                    <Label
                        htmlFor="launchPlan"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuRocket className="h-4 w-4 text-amber-500" />
                        Plano de Lançamento (Launch Day)
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        O que fazer no dia do lançamento oficial (Product Hunt,
                        Hacker News, lista de espera)
                    </p>
                    <Textarea
                        id="launchPlan"
                        value={formData.launchPlan}
                        onChange={(e) =>
                            handleFieldChange("launchPlan", e.target.value)
                        }
                        placeholder="Ex: Lançar no Product Hunt às 00:01 PST, enviar email para os 300 inscritos do beta, post no Hacker News Show..."
                        rows={4}
                    />
                </div>

                {/* Branding & Tom de Voz */}
                <div className="space-y-2">
                    <Label
                        htmlFor="branding"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuPalette className="h-4 w-4 text-purple-500" />
                        Branding, Tom de Voz & Estilo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Como a marca se comunica (casual vs. corporativo, cores,
                        estética visual)
                    </p>
                    <Textarea
                        id="branding"
                        value={formData.branding}
                        onChange={(e) =>
                            handleFieldChange("branding", e.target.value)
                        }
                        placeholder="Ex: Tom direto, transparente, de desenvolvedor para desenvolvedor. Visual dark mode moderno, sem jargões corporativos..."
                        rows={4}
                    />
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuMegaphone className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Marketing ainda não planejado
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Defina o tom de voz, conteúdo e o plano do dia de
                        lançamento ou peça sugestões ao Copilot.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Conteúdo */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <LuFileText className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Marketing de Conteúdo
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.contentStrategy || "Não informado"}
                </p>
            </div>

            {/* Redes Sociais */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <LuShare2 className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Redes Sociais & Presença
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.socialMediaStrategy || "Não informado"}
                </p>
            </div>

            {/* Lançamento */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                        <LuRocket className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Plano de Lançamento
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.launchPlan || "Não informado"}
                </p>
            </div>

            {/* Branding */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                        <LuPalette className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Branding & Tom de Voz
                    </h3>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {formData.branding || "Não informado"}
                </p>
            </div>
        </div>
    )
}
