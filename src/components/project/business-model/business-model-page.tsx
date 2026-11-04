import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { LuCircleDollarSign, LuPlus, LuTrash2, LuCheck } from "react-icons/lu"
import type { BusinessModelFormValues } from "@/schemas/planning"
import { SectionPage } from "@/components/project/section-page"
import { TagInput } from "@/components/ui/tag-input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: BusinessModelFormValues = {
    productsOrServices: [],
}

export function BusinessModelPage() {
    return (
        <SectionPage
            title="Modelo de Negócio & Precificação"
            description="Defina seus produtos, serviços, planos de assinatura e escopo de MVP"
            fieldKey="businessModel"
        >
            {({ value, onChange, editing }) => (
                <BusinessModelContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function BusinessModelContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<BusinessModelFormValues>(() => {
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

    const addProduct = () => {
        const updated = {
            ...formData,
            productsOrServices: [
                ...formData.productsOrServices,
                {
                    name: "",
                    description: "",
                    price: 0,
                    currencyCode: "BRL",
                    features: [],
                    includedInMvp: true,
                    mvpDescription: "",
                },
            ],
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const removeProduct = (index: number) => {
        const updated = {
            ...formData,
            productsOrServices: formData.productsOrServices.filter(
                (_, i) => i !== index,
            ),
        }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const updateProduct = (
        index: number,
        patch: Partial<BusinessModelFormValues["productsOrServices"][0]>,
    ) => {
        const next = [...formData.productsOrServices]
        next[index] = { ...next[index], ...patch }
        const updated = { ...formData, productsOrServices: next }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = formData.productsOrServices.length > 0

    if (editing) {
        return (
            <div className="space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                    <div>
                        <Label className="text-sm font-semibold flex items-center gap-1.5">
                            <LuCircleDollarSign className="h-4 w-4 text-emerald-500" />
                            Produtos, Planos & Precificação
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            Configure planos de assinatura, produtos únicos ou
                            tiers de acesso
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addProduct}
                    >
                        <LuPlus className="mr-1 h-3.5 w-3.5" />
                        Adicionar Plano / Produto
                    </Button>
                </div>

                {formData.productsOrServices.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">
                        Nenhum produto ou plano configurado. Adicione o primeiro
                        plano acima.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {formData.productsOrServices.map((prod, idx) => (
                            <div
                                key={idx}
                                className="rounded-xl border border-border/60 bg-card p-5 space-y-4 shadow-xs"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="grid gap-3 sm:grid-cols-3 flex-1">
                                        <div className="space-y-1 sm:col-span-1">
                                            <Label className="text-xs font-semibold">
                                                Nome do Plano/Produto
                                            </Label>
                                            <Input
                                                value={prod.name}
                                                onChange={(e) =>
                                                    updateProduct(idx, {
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="Ex: Pro Mensal ou Vitalício"
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
                                                value={prod.price || 0}
                                                onChange={(e) =>
                                                    updateProduct(idx, {
                                                        price:
                                                            parseFloat(
                                                                e.target.value,
                                                            ) || 0,
                                                    })
                                                }
                                                placeholder="0.00"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs font-semibold">
                                                Moeda
                                            </Label>
                                            <Select
                                                value={
                                                    prod.currencyCode || "BRL"
                                                }
                                                onValueChange={(val) =>
                                                    updateProduct(idx, {
                                                        currencyCode: val,
                                                    })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Moeda" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="BRL">
                                                        BRL (R$)
                                                    </SelectItem>
                                                    <SelectItem value="USD">
                                                        USD ($)
                                                    </SelectItem>
                                                    <SelectItem value="EUR">
                                                        EUR (€)
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeProduct(idx)}
                                        className="text-destructive hover:bg-destructive/10 shrink-0"
                                    >
                                        <LuTrash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Descrição do Plano
                                    </Label>
                                    <Input
                                        value={prod.description || ""}
                                        onChange={(e) =>
                                            updateProduct(idx, {
                                                description: e.target.value,
                                            })
                                        }
                                        placeholder="Breve resumo da proposta de valor deste plano"
                                        className="text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs font-semibold">
                                        Funcionalidades Incluídas (Features)
                                    </Label>
                                    <TagInput
                                        value={prod.features || []}
                                        onChange={(features) =>
                                            updateProduct(idx, { features })
                                        }
                                        placeholder="Ex: Suporte prioritário, Acesso a todas as ferramentas"
                                    />
                                </div>

                                <div className="flex items-center gap-3 pt-2 border-t border-border/40">
                                    <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={prod.includedInMvp}
                                            onChange={(e) =>
                                                updateProduct(idx, {
                                                    includedInMvp:
                                                        e.target.checked,
                                                })
                                            }
                                            className="rounded border-border text-primary focus:ring-primary h-4 w-4"
                                        />
                                        <span>Incluído no MVP inicial</span>
                                    </label>
                                    {prod.includedInMvp && (
                                        <Input
                                            value={prod.mvpDescription || ""}
                                            onChange={(e) =>
                                                updateProduct(idx, {
                                                    mvpDescription:
                                                        e.target.value,
                                                })
                                            }
                                            placeholder="Detalhes específicos da entrega no MVP"
                                            className="text-xs flex-1 h-8"
                                        />
                                    )}
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <LuCircleDollarSign className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Modelo de negócio ainda não configurado
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Defina seus planos, preços e o que entra no MVP inicial
                        ou consulte o Copilot para sugestões de monetização.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {formData.productsOrServices.map((prod, idx) => (
                    <div
                        key={idx}
                        className={`rounded-xl border p-6 flex flex-col justify-between shadow-xs transition-all ${
                            prod.includedInMvp
                                ? "border-primary/40 bg-card"
                                : "border-border/60 bg-muted/20"
                        }`}
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <h3 className="font-bold text-lg text-foreground">
                                    {prod.name || "Plano"}
                                </h3>
                                <Badge
                                    variant={
                                        prod.includedInMvp
                                            ? "default"
                                            : "secondary"
                                    }
                                    className="text-[10px] uppercase font-semibold"
                                >
                                    {prod.includedInMvp ? "No MVP" : "Pós-MVP"}
                                </Badge>
                            </div>

                            <p className="text-xs text-muted-foreground mb-4 min-h-[32px]">
                                {prod.description || "Sem descrição"}
                            </p>

                            <div className="mb-5 pb-4 border-b border-border/40">
                                <span className="text-2xl font-extrabold text-foreground">
                                    {prod.currencyCode === "BRL"
                                        ? "R$ "
                                        : prod.currencyCode === "EUR"
                                          ? "€ "
                                          : "$ "}
                                    {Number(prod.price).toLocaleString(
                                        "pt-BR",
                                        { minimumFractionDigits: 2 },
                                    )}
                                </span>
                                <span className="text-xs text-muted-foreground ml-1">
                                    / acesso
                                </span>
                            </div>

                            {prod.features && prod.features.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-foreground">
                                        O que está incluído:
                                    </p>
                                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                                        {prod.features.map((feat, fIdx) => (
                                            <li
                                                key={fIdx}
                                                className="flex items-center gap-1.5"
                                            >
                                                <LuCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {prod.includedInMvp && prod.mvpDescription && (
                            <div className="mt-5 pt-3 border-t border-border/30 text-[11px] text-muted-foreground italic">
                                Escopo do MVP: {prod.mvpDescription}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
