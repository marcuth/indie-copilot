import {
    LuLightbulb,
    LuTarget,
    LuSparkles,
    LuCircleCheck,
    LuShieldCheck,
} from "react-icons/lu"
import {
    problemSolutionSchema,
    type ProblemSolutionFormValues,
} from "@/schemas/planning"
import { SectionPage } from "@/components/project/section-page"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: ProblemSolutionFormValues = {
    problem: "",
    solution: "",
    problemRelevantTo: "",
    valueProposition: "",
    competitiveAdvantages: [],
    mainBenefits: [],
}

export function ProblemSolutionPage() {
    return (
        <SectionPage
            title="Problema & Solução"
            description="Defina a dor do mercado, sua solução proposta e a proposta de valor única"
            fieldKey="problemSolution"
        >
            {({ value, onChange, editing }) => (
                <ProblemSolutionContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function ProblemSolutionContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<ProblemSolutionFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            // Se for texto legado puro
            if (value) return { ...defaultValues, problem: value }
        }
        return defaultValues
    })

    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                setFormData({ ...defaultValues, ...parsed })
            }
        } catch {
            if (value) setFormData((prev) => ({ ...prev, problem: value }))
        }
    }, [value])

    const handleFieldChange = <K extends keyof ProblemSolutionFormValues>(
        field: K,
        fieldValue: ProblemSolutionFormValues[K],
    ) => {
        const updated = { ...formData, [field]: fieldValue }
        setFormData(updated)
        onChange(JSON.stringify(updated))

        // Validação pontual
        const validation = problemSolutionSchema.safeParse(updated)
        if (!validation.success) {
            const fieldError = validation.error.format()[field]
            if (
                fieldError &&
                "_errors" in fieldError &&
                fieldError._errors[0]
            ) {
                setErrors((prev) => ({
                    ...prev,
                    [field]: fieldError._errors[0],
                }))
                return
            }
        }
        setErrors((prev) => {
            const next = { ...prev }
            delete next[field]
            return next
        })
    }

    const hasAnyContent = Boolean(
        formData.problem ||
        formData.solution ||
        formData.valueProposition ||
        formData.problemRelevantTo ||
        formData.competitiveAdvantages.length > 0 ||
        formData.mainBenefits.length > 0,
    )

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Problema */}
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="problem"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuTarget className="h-4 w-4 text-primary" />A Dor /
                            Problema Central *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Qual é a dor real e urgente que você observou no
                            mercado?
                        </p>
                        <Textarea
                            id="problem"
                            value={formData.problem}
                            onChange={(e) =>
                                handleFieldChange("problem", e.target.value)
                            }
                            placeholder="Ex: Desenvolvedores independentes perdem muito tempo estruturando planos em planilhas desconexas..."
                            rows={4}
                            className={
                                errors.problem
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
                        />
                        {errors.problem && (
                            <p className="text-xs text-destructive">
                                {errors.problem}
                            </p>
                        )}
                    </div>

                    {/* Para quem é relevante */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="problemRelevantTo"
                            className="text-sm font-semibold"
                        >
                            Para quem esse problema é mais relevante? *
                        </Label>
                        <Input
                            id="problemRelevantTo"
                            value={formData.problemRelevantTo}
                            onChange={(e) =>
                                handleFieldChange(
                                    "problemRelevantTo",
                                    e.target.value,
                                )
                            }
                            placeholder="Ex: Solopreneurs, criadores e desenvolvedores bootstrap"
                            className={
                                errors.problemRelevantTo
                                    ? "border-destructive"
                                    : ""
                            }
                        />
                        {errors.problemRelevantTo && (
                            <p className="text-xs text-destructive">
                                {errors.problemRelevantTo}
                            </p>
                        )}
                    </div>

                    {/* Proposta Única de Valor */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="valueProposition"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuSparkles className="h-4 w-4 text-amber-500" />
                            Proposta Única de Valor (UVP) *
                        </Label>
                        <Input
                            id="valueProposition"
                            value={formData.valueProposition}
                            onChange={(e) =>
                                handleFieldChange(
                                    "valueProposition",
                                    e.target.value,
                                )
                            }
                            placeholder="Ex: O copiloto desktop que planeja e valida sua startup localmente e com qualquer IA"
                            className={
                                errors.valueProposition
                                    ? "border-destructive"
                                    : ""
                            }
                        />
                        {errors.valueProposition && (
                            <p className="text-xs text-destructive">
                                {errors.valueProposition}
                            </p>
                        )}
                    </div>

                    {/* Solução */}
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="solution"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuLightbulb className="h-4 w-4 text-emerald-500" />
                            A Solução Proposta *
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Como seu produto resolve essa dor de ponta a ponta?
                        </p>
                        <Textarea
                            id="solution"
                            value={formData.solution}
                            onChange={(e) =>
                                handleFieldChange("solution", e.target.value)
                            }
                            placeholder="Ex: Um aplicativo desktop local-first com banco SQLite embutido, formulários guiados e Copilot integrado que preenche seções e valida hipóteses..."
                            rows={4}
                            className={
                                errors.solution
                                    ? "border-destructive focus-visible:ring-destructive"
                                    : ""
                            }
                        />
                        {errors.solution && (
                            <p className="text-xs text-destructive">
                                {errors.solution}
                            </p>
                        )}
                    </div>

                    {/* Vantagens Competitivas */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuShieldCheck className="h-4 w-4 text-blue-500" />
                            Vantagens Competitivas (Diferenciais)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Pressione Enter para adicionar cada vantagem
                        </p>
                        <TagInput
                            value={formData.competitiveAdvantages}
                            onChange={(tags) =>
                                handleFieldChange("competitiveAdvantages", tags)
                            }
                            placeholder="Ex: 100% Offline e Privado"
                        />
                    </div>

                    {/* Principais Benefícios */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuCircleCheck className="h-4 w-4 text-emerald-500" />
                            Principais Benefícios para o Usuário
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Ganhos diretos percebidos pelo cliente final
                        </p>
                        <TagInput
                            value={formData.mainBenefits}
                            onChange={(tags) =>
                                handleFieldChange("mainBenefits", tags)
                            }
                            placeholder="Ex: Economia de tempo no planejamento"
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
                    <LuLightbulb className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Problema & Solução ainda não preenchidos
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Defina a dor central que seu produto soluciona ou use o
                        Copilot para gerar hipóteses automáticas.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Problema */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                            <LuTarget className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            O Problema
                        </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {formData.problem || "Não informado"}
                    </p>
                </div>
                {formData.problemRelevantTo && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                        <span className="text-xs font-medium text-muted-foreground">
                            Relevante para:{" "}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                            {formData.problemRelevantTo}
                        </span>
                    </div>
                )}
            </div>

            {/* Solução */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                            <LuLightbulb className="h-4 w-4" />
                        </div>
                        <h3 className="font-semibold text-base text-foreground">
                            A Solução
                        </h3>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                        {formData.solution || "Não informado"}
                    </p>
                </div>
                {formData.valueProposition && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-amber-500 mb-1">
                            <LuSparkles className="h-3.5 w-3.5" />
                            <span>Proposta Única de Valor (UVP):</span>
                        </div>
                        <p className="text-xs font-semibold text-foreground italic">
                            &quot;{formData.valueProposition}&quot;
                        </p>
                    </div>
                )}
            </div>

            {/* Vantagens Competitivas */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <LuShieldCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Vantagens Competitivas
                    </h3>
                </div>
                {formData.competitiveAdvantages.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.competitiveAdvantages.map((adv) => (
                            <Badge
                                key={adv}
                                variant="outline"
                                className="border-blue-500/30 bg-blue-500/5 text-xs py-1 px-2.5"
                            >
                                {adv}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma vantagem competitiva listada
                    </p>
                )}
            </div>

            {/* Benefícios Principais */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <LuCircleCheck className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Principais Benefícios
                    </h3>
                </div>
                {formData.mainBenefits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.mainBenefits.map((ben) => (
                            <Badge
                                key={ben}
                                variant="outline"
                                className="border-emerald-500/30 bg-emerald-500/5 text-xs py-1 px-2.5"
                            >
                                {ben}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhum benefício listado
                    </p>
                )}
            </div>
        </div>
    )
}
