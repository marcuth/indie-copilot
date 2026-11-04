import { SectionPage } from "@/components/project/section-page"
import type { FinancialsFormValues } from "@/schemas/planning"
import { LuDollarSign, LuCoins } from "react-icons/lu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"

const defaultValues: FinancialsFormValues = {
    initialAndProjectedCosts: "",
}

export function FinancialsPage() {
    return (
        <SectionPage
            title="Finanças & Custos"
            description="Projeção de custos iniciais, custos fixos mensais (burn rate) e estimativa de ponto de equilíbrio"
            fieldKey="financials"
        >
            {({ value, onChange, editing }) => (
                <FinancialsContent
                    value={value}
                    onChange={onChange}
                    editing={editing}
                />
            )}
        </SectionPage>
    )
}

function FinancialsContent({
    value,
    onChange,
    editing,
}: {
    value: string
    onChange: (v: string) => void
    editing: boolean
}) {
    const [formData, setFormData] = useState<FinancialsFormValues>(() => {
        try {
            if (value) {
                const parsed = JSON.parse(value)
                return { ...defaultValues, ...parsed }
            }
        } catch {
            if (value) return { initialAndProjectedCosts: value }
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
            if (value) setFormData({ initialAndProjectedCosts: value })
        }
    }, [value])

    const handleChange = (costs: string) => {
        const updated = { initialAndProjectedCosts: costs }
        setFormData(updated)
        onChange(JSON.stringify(updated))
    }

    const hasAnyContent = Boolean(formData.initialAndProjectedCosts)

    if (editing) {
        return (
            <div className="space-y-4 max-w-4xl">
                <div className="space-y-2">
                    <Label
                        htmlFor="costs"
                        className="text-sm font-semibold flex items-center gap-1.5"
                    >
                        <LuCoins className="h-4 w-4 text-emerald-500" />
                        Detalhamento de Custos & Projeções Financeiras
                    </Label>
                    <p className="text-xs text-muted-foreground">
                        Liste custos únicos de setup (domínio, licenças), custos
                        mensais recorrentes (servidores, APIs de IA) e receita
                        projetada
                    </p>
                    <Textarea
                        id="costs"
                        value={formData.initialAndProjectedCosts}
                        onChange={(e) => handleChange(e.target.value)}
                        placeholder={`1. Custos Iniciais (Setup):
- Domínio .com: R$ 60/ano
- Design & Branding: R$ 0 (feito em casa)

2. Custos Mensais Recorrentes:
- Hospedagem Vercel Pro: R$ 120/mês
- API OpenAI / DeepSeek: ~R$ 50/mês
Total Fixo Mensal: ~R$ 170/mês

3. Ponto de Equilíbrio (Breakeven):
- Preço do plano: R$ 49/mês
- Breakeven necessário: 4 clientes pagantes`}
                        rows={14}
                        className="font-mono text-sm leading-relaxed"
                    />
                </div>
            </div>
        )
    }

    if (!hasAnyContent) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60 bg-card/40 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                    <LuDollarSign className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">
                        Finanças ainda não estimadas
                    </h3>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Estruture seus custos fixos e variáveis para descobrir
                        quantos clientes são necessários para empatar a
                        operação.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl">
            <div className="rounded-xl border border-border/60 bg-card p-6 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
                        <LuCoins className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold text-base text-foreground">
                        Detalhamento Financeiro
                    </h3>
                </div>
                <pre className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap font-sans">
                    {formData.initialAndProjectedCosts}
                </pre>
            </div>
        </div>
    )
}
