import {
    LuServer,
    LuPlug,
    LuWrench,
    LuPlus,
    LuTrash2,
    LuCpu,
} from "react-icons/lu"
import type { InfrastructureFormValues } from "@/schemas/planning"
import { SectionPage } from "@/components/project/section-page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: InfrastructureFormValues = {
    hostingServices: [],
    integrations: [],
    generalTools: [],
}

export function InfrastructurePage() {
    return (
        <SectionPage
            title="Infraestrutura & Stack"
            description="Mapeie os serviços de hospedagem, integrações de terceiros e ferramentas operacionais"
            fieldKey="infrastructure"
        >
            {({ value, onChange, editing }) => (
                <InfrastructureContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function InfrastructureContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<InfrastructureFormValues>(() => {
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

    const addItem = (category: keyof InfrastructureFormValues) => {
        const updated = {
            ...formData,
            [category]: [...formData[category], { name: "", role: "" }],
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const removeItem = (
        category: keyof InfrastructureFormValues,
        index: number,
    ) => {
        const updated = {
            ...formData,
            [category]: formData[category].filter((_, i) => i !== index),
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const updateItem = (
        category: keyof InfrastructureFormValues,
        index: number,
        field: "name" | "role",
        val: string,
    ) => {
        const list = [...formData[category]]
        list[index] = { ...list[index], [field]: val }
        const updated = { ...formData, [category]: list }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(
        formData.hostingServices.length > 0 ||
        formData.integrations.length > 0 ||
        formData.generalTools.length > 0,
    )

    if (editing) {
        return (
            <div className="space-y-8 max-w-4xl">
                {/* 1. Hospedagem & Servidores */}
                <InfraCategoryEditor
                    title="Hospedagem & Servidores"
                    description="Provedores de cloud, banco de dados ou CDN (ex: Vercel, Supabase, Fly.io)"
                    icon={<LuServer className="h-4 w-4 text-primary" />}
                    items={formData.hostingServices}
                    onAdd={() => addItem("hostingServices")}
                    onRemove={(idx) => removeItem("hostingServices", idx)}
                    onUpdate={(idx, f, v) =>
                        updateItem("hostingServices", idx, f, v)
                    }
                    namePlaceholder="Ex: Vercel / Fly.io"
                    rolePlaceholder="Ex: Frontend Hosting & Edge API"
                />

                {/* 2. Integrações & APIs */}
                <InfraCategoryEditor
                    title="Integrações & APIs de Terceiros"
                    description="Serviços de pagamento, mensageria e IA (ex: Stripe, Resend, OpenAI, Ollama)"
                    icon={<LuPlug className="h-4 w-4 text-emerald-500" />}
                    items={formData.integrations}
                    onAdd={() => addItem("integrations")}
                    onRemove={(idx) => removeItem("integrations", idx)}
                    onUpdate={(idx, f, v) =>
                        updateItem("integrations", idx, f, v)
                    }
                    namePlaceholder="Ex: Stripe / OpenAI"
                    rolePlaceholder="Ex: Faturamento e Modelos de IA"
                />

                {/* 3. Ferramentas & Ferramental */}
                <InfraCategoryEditor
                    title="Ferramental Geral & Desenvolvimento"
                    description="Ambiente de desenvolvimento e design (ex: GitHub, Figma, Linear, Tauri)"
                    icon={<LuWrench className="h-4 w-4 text-blue-500" />}
                    items={formData.generalTools}
                    onAdd={() => addItem("generalTools")}
                    onRemove={(idx) => removeItem("generalTools", idx)}
                    onUpdate={(idx, f, v) =>
                        updateItem("generalTools", idx, f, v)
                    }
                    namePlaceholder="Ex: GitHub / Figma"
                    rolePlaceholder="Ex: Controle de versão e UI Design"
                />
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <LuCpu className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Stack de infraestrutura ainda não definida
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Mapeie suas escolhas de hosting, banco de dados, APIs e
                        ferramentas operacionais.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl">
            {/* Hospedagem */}
            <InfraCategoryViewer
                title="Hospedagem & Cloud"
                icon={<LuServer className="h-4 w-4 text-primary" />}
                items={formData.hostingServices}
            />

            {/* Integrações */}
            <InfraCategoryViewer
                title="Integrações & APIs"
                icon={<LuPlug className="h-4 w-4 text-emerald-500" />}
                items={formData.integrations}
            />

            {/* Ferramental */}
            <InfraCategoryViewer
                title="Ferramentas Gerais"
                icon={<LuWrench className="h-4 w-4 text-blue-500" />}
                items={formData.generalTools}
            />
        </div>
    )
}

function InfraCategoryEditor({
    title,
    description,
    icon,
    items,
    onAdd,
    onRemove,
    onUpdate,
    namePlaceholder,
    rolePlaceholder,
}: {
    title: string
    description: string
    icon: React.ReactNode
    items: { name: string; role: string }[]
    onAdd: () => void
    onRemove: (idx: number) => void
    onUpdate: (idx: number, field: "name" | "role", val: string) => void
    namePlaceholder: string
    rolePlaceholder: string
}) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div>
                    <Label className="text-sm font-semibold flex items-center gap-1.5">
                        {icon}
                        {title}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        {description}
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={onAdd}
                >
                    <LuPlus className="mr-1 h-3.5 w-3.5" />
                    Adicionar
                </Button>
            </div>

            {items.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border/70 p-4 text-center text-xs text-muted-foreground">
                    Nenhum item configurado nesta categoria.
                </div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Input
                                value={item.name}
                                onChange={(e) =>
                                    onUpdate(idx, "name", e.target.value)
                                }
                                placeholder={namePlaceholder}
                                className="flex-1 text-xs"
                            />
                            <Input
                                value={item.role}
                                onChange={(e) =>
                                    onUpdate(idx, "role", e.target.value)
                                }
                                placeholder={rolePlaceholder}
                                className="flex-1 text-xs"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemove(idx)}
                                className="text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9 p-0"
                            >
                                <LuTrash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

function InfraCategoryViewer({
    title,
    icon,
    items,
}: {
    title: string
    icon: React.ReactNode
    items: { name: string; role: string }[]
}) {
    return (
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-xs flex flex-col justify-between">
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/60">
                        {icon}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground">
                        {title}
                    </h3>
                </div>

                {items.length > 0 ? (
                    <div className="space-y-2.5">
                        {items.map((it, idx) => (
                            <div
                                key={idx}
                                className="p-2.5 rounded-lg border border-border/40 bg-muted/20 flex flex-col gap-0.5"
                            >
                                <span className="font-semibold text-xs text-foreground">
                                    {it.name}
                                </span>
                                <span className="text-[11px] text-muted-foreground">
                                    {it.role}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-muted-foreground">
                        Nenhum serviço mapeado
                    </p>
                )}
            </div>
        </div>
    )
}
