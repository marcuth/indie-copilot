import {
    LuUsers,
    LuMapPin,
    LuBriefcase,
    LuDollarSign,
    LuHeartHandshake,
    LuSparkles,
} from "react-icons/lu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import type { TargetAudienceFormValues } from "@/schemas/planning"
import { SectionPage } from "@/components/project/section-page"
import { TagInput } from "@/components/ui/tag-input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: TargetAudienceFormValues = {
    location: "",
    ageRange: "25-34",
    gender: "all",
    incomeRange: "",
    profession: "",
    painPoints: [],
    habits: [],
    description: "",
}

export function TargetAudiencePage() {
    return (
        <SectionPage
            title="Público-Alvo & Persona"
            description="Mapeie o perfil demográfico, hábitos, dores agudas e comportamento do seu cliente ideal"
            fieldKey="targetAudience"
        >
            {({ value, onChange, editing }) => (
                <TargetAudienceContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function TargetAudienceContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<TargetAudienceFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { ...defaultValues, description: value }
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
            if (value) setFormData((prev) => ({ ...prev, description: value }))
        }
    }, [value])

    const handleFieldChange = <K extends keyof TargetAudienceFormValues>(
        field: K,
        fieldValue: TargetAudienceFormValues[K],
    ) => {
        const updated = { ...formData, [field]: fieldValue }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.location ||
        formData.profession ||
        formData.incomeRange ||
        formData.description ||
        formData.painPoints.length > 0 ||
        formData.habits.length > 0,
    )

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Localização */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="location"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuMapPin className="h-4 w-4 text-primary" />
                            Localização / Região *
                        </Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) =>
                                handleFieldChange("location", e.target.value)
                            }
                            placeholder="Ex: Brasil / América Latina ou Global (Remoto)"
                        />
                    </div>

                    {/* Profissão */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="profession"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuBriefcase className="h-4 w-4 text-primary" />
                            Profissão / Cargo *
                        </Label>
                        <Input
                            id="profession"
                            value={formData.profession}
                            onChange={(e) =>
                                handleFieldChange("profession", e.target.value)
                            }
                            placeholder="Ex: Desenvolvedores Freelancer, Fundadores Indie"
                        />
                    </div>

                    {/* Faixa Etária */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">
                            Faixa Etária
                        </Label>
                        <Select
                            value={formData.ageRange}
                            onValueChange={(val) =>
                                handleFieldChange(
                                    "ageRange",
                                    val as TargetAudienceFormValues["ageRange"],
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a faixa etária" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todas as idades
                                </SelectItem>
                                <SelectItem value="14-17">
                                    14 a 17 anos
                                </SelectItem>
                                <SelectItem value="18-24">
                                    18 a 24 anos
                                </SelectItem>
                                <SelectItem value="25-34">
                                    25 a 34 anos
                                </SelectItem>
                                <SelectItem value="35-44">
                                    35 a 44 anos
                                </SelectItem>
                                <SelectItem value="45-54">
                                    45 a 54 anos
                                </SelectItem>
                                <SelectItem value="55-64">
                                    55 a 64 anos
                                </SelectItem>
                                <SelectItem value="65+">
                                    65 anos ou mais
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Gênero */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold">Gênero</Label>
                        <Select
                            value={formData.gender}
                            onValueChange={(val) =>
                                handleFieldChange(
                                    "gender",
                                    val as TargetAudienceFormValues["gender"],
                                )
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o gênero" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">
                                    Todos / Neutro
                                </SelectItem>
                                <SelectItem value="male">Masculino</SelectItem>
                                <SelectItem value="female">Feminino</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Faixa de Renda */}
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="incomeRange"
                            className="text-sm font-semibold flex items-center gap-1.5"
                        >
                            <LuDollarSign className="h-4 w-4 text-emerald-500" />
                            Faixa de Renda / Poder Aquisitivo
                        </Label>
                        <Input
                            id="incomeRange"
                            value={formData.incomeRange}
                            onChange={(e) =>
                                handleFieldChange("incomeRange", e.target.value)
                            }
                            placeholder="Ex: R$ 5.000 a R$ 15.000 / mês ou US$ 3.000+ / mês"
                        />
                    </div>

                    {/* Biografia / Resumo */}
                    <div className="space-y-2 md:col-span-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-semibold"
                        >
                            Descrição Detalhada da Persona (Bio)
                        </Label>
                        <Textarea
                            id="description"
                            value={formData.description || ""}
                            onChange={(e) =>
                                handleFieldChange("description", e.target.value)
                            }
                            placeholder="Descreva quem é a persona, o que ela valoriza, seus desafios diários e aspirações..."
                            rows={3}
                        />
                    </div>

                    {/* Dores Agudas (Pain Points) */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-red-500">
                            Dores Agudas (Pain Points)
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Problemas recorrentes que tiram o sono do cliente
                        </p>
                        <TagInput
                            value={formData.painPoints}
                            onChange={(tags) =>
                                handleFieldChange("painPoints", tags)
                            }
                            placeholder="Ex: Falta de foco para lançar produtos"
                        />
                    </div>

                    {/* Hábitos e Rotinas */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold text-blue-500">
                            Hábitos, Comunidades e Rotinas
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Onde passam tempo ou o que costumam consumir
                        </p>
                        <TagInput
                            value={formData.habits}
                            onChange={(tags) =>
                                handleFieldChange("habits", tags)
                            }
                            placeholder="Ex: Frequenta X (Twitter), Reddit r/SideProject"
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
                    <LuUsers className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Público-alvo ainda não definido
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Mapeie a demografia, hábitos e dores do seu cliente
                        ideal para calibrar toda a comunicação do projeto.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl">
            {/* Cartão de Resumo da Persona */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <LuUsers className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-base text-foreground">
                                {formData.profession || "Cliente Ideal"}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <LuMapPin className="h-3 w-3" />
                                {formData.location ||
                                    "Localização não informada"}
                            </p>
                        </div>
                    </div>

                    {formData.description ? (
                        <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                            {formData.description}
                        </p>
                    ) : (
                        <p className="text-xs text-muted-foreground italic">
                            Sem biografia detalhada
                        </p>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-border/40 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                        Idade:{" "}
                        {formData.ageRange === "all"
                            ? "Todas as idades"
                            : `${formData.ageRange} anos`}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                        Gênero:{" "}
                        {formData.gender === "all"
                            ? "Todos"
                            : formData.gender === "male"
                              ? "Masculino"
                              : "Feminino"}
                    </Badge>
                    {formData.incomeRange && (
                        <Badge
                            variant="outline"
                            className="text-xs border-emerald-500/30 text-emerald-500"
                        >
                            {formData.incomeRange}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Dores Agudas */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                        <LuHeartHandshake className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Dores Agudas (Pain Points)
                    </h3>
                </div>
                {formData.painPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.painPoints.map((pain) => (
                            <Badge
                                key={pain}
                                variant="outline"
                                className="border-red-500/30 bg-red-500/5 text-xs py-1 px-2.5"
                            >
                                {pain}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhuma dor registrada
                    </p>
                )}
            </div>

            {/* Hábitos e Rotinas */}
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                        <LuSparkles className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Hábitos & Canais de Frequência
                    </h3>
                </div>
                {formData.habits.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {formData.habits.map((habit) => (
                            <Badge
                                key={habit}
                                variant="outline"
                                className="border-blue-500/30 bg-blue-500/5 text-xs py-1 px-2.5"
                            >
                                {habit}
                            </Badge>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhum hábito registrado
                    </p>
                )}
            </div>
        </div>
    )
}
