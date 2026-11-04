import {
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider,
} from "@/lib/db/database-client"
import {
    LuPlus,
    LuTrash2,
    LuCheck,
    LuX,
    LuTestTube,
    LuBadgeCheck,
} from "react-icons/lu"
import { useAiSettings } from "@/contexts/ai-settings-context"
import { ScrollArea } from "@/components/ui/scroll-area"
import { createAiClient } from "@/lib/ai/client-factory"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import type { AiProvider } from "@/types"
import { useState } from "react"

const PRESET_PROVIDERS = [
    {
        name: "Ollama (Local)",
        baseUrl: "http://localhost:11434/v1",
        apiKey: "ollama",
        defaultModel: "llama3.2:latest",
    },
    {
        name: "LM Studio (Local)",
        baseUrl: "http://localhost:1234/v1",
        apiKey: "lm-studio",
        defaultModel: "local-model",
    },
    {
        name: "OpenAI",
        baseUrl: "https://api.openai.com/v1",
        apiKey: "",
        defaultModel: "gpt-4o-mini",
    },
    {
        name: "DeepSeek",
        baseUrl: "https://api.deepseek.com/v1",
        apiKey: "",
        defaultModel: "deepseek-chat",
    },
    {
        name: "Groq",
        baseUrl: "https://api.groq.com/openai/v1",
        apiKey: "",
        defaultModel: "llama-3.3-70b-versatile",
    },
    {
        name: "OpenRouter",
        baseUrl: "https://openrouter.ai/api/v1",
        apiKey: "",
        defaultModel: "anthropic/claude-3.5-sonnet",
    },
]

export function AiProvidersSettings() {
    const { refreshSettings } = useAiSettings()
    const [providers, setProviders] = useState<AiProvider[]>(() =>
        getProviders(),
    )
    const [adding, setAdding] = useState(false)
    const [testResults, setTestResults] = useState<
        Record<string, "ok" | "error" | "testing">
    >({})
    const [form, setForm] = useState({
        name: "",
        baseUrl: "",
        apiKey: "",
        defaultModel: "",
        isDefault: false,
    })

    const refresh = () => {
        setProviders(getProviders())
        refreshSettings()
    }

    const handleAddPreset = (preset: (typeof PRESET_PROVIDERS)[0]) => {
        setForm({ ...preset, isDefault: providers.length === 0 })
        setAdding(true)
    }

    const handleCreate = () => {
        if (!form.name || !form.baseUrl || !form.defaultModel) return
        createProvider(form)
        setAdding(false)
        setForm({
            name: "",
            baseUrl: "",
            apiKey: "",
            defaultModel: "",
            isDefault: false,
        })
        refresh()
    }

    const handleDelete = (id: string) => {
        deleteProvider(id)
        refresh()
    }

    const handleSetDefault = (id: string) => {
        updateProvider(id, { isDefault: true })
        refresh()
    }

    const handleTest = async (provider: AiProvider) => {
        setTestResults((prev) => ({ ...prev, [provider.id]: "testing" }))
        try {
            const client = createAiClient(provider)
            await client.models.list()
            setTestResults((prev) => ({ ...prev, [provider.id]: "ok" }))
        } catch {
            setTestResults((prev) => ({ ...prev, [provider.id]: "error" }))
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-heading text-lg font-bold">
                    Provedores de IA
                </h2>
                <p className="text-sm text-muted-foreground">
                    Configure provedores OpenAI-compatíveis (local ou nuvem)
                </p>
            </div>

            {/* Preset buttons */}
            <div>
                <p className="mb-3 text-sm font-medium">
                    Adicionar provedor pré-configurado:
                </p>
                <div className="flex flex-wrap gap-2">
                    {PRESET_PROVIDERS.map((preset) => (
                        <Button
                            key={preset.name}
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleAddPreset(preset)}
                        >
                            <LuPlus className="mr-1 h-3 w-3" />
                            {preset.name}
                        </Button>
                    ))}
                </div>
            </div>

            <Separator />

            {/* Provider list */}
            <ScrollArea className="max-h-72">
                <div className="space-y-3">
                    {providers.length === 0 && !adding && (
                        <p className="text-sm text-muted-foreground py-4 text-center">
                            Nenhum provedor configurado
                        </p>
                    )}
                    {providers.map((provider) => (
                        <div
                            key={provider.id}
                            className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4"
                        >
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">
                                            {provider.name}
                                        </span>
                                        {provider.isDefault && (
                                            <Badge className="h-4 text-[10px]">
                                                Padrão
                                            </Badge>
                                        )}
                                        {testResults[provider.id] === "ok" && (
                                            <Badge
                                                variant="secondary"
                                                className="h-4 text-[10px] text-green-600"
                                            >
                                                ✓ Conectado
                                            </Badge>
                                        )}
                                        {testResults[provider.id] ===
                                            "error" && (
                                            <Badge
                                                variant="destructive"
                                                className="h-4 text-[10px]"
                                            >
                                                ✗ Falhou
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {provider.baseUrl} ·{" "}
                                        {provider.defaultModel}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => void handleTest(provider)}
                                    disabled={
                                        testResults[provider.id] === "testing"
                                    }
                                >
                                    <LuTestTube className="h-3.5 w-3.5" />
                                </Button>
                                {!provider.isDefault && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={() =>
                                            handleSetDefault(provider.id)
                                        }
                                        title="Definir como padrão"
                                    >
                                        <LuBadgeCheck className="h-3.5 w-3.5" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive"
                                    onClick={() => handleDelete(provider.id)}
                                >
                                    <LuTrash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Add form */}
            {adding && (
                <div className="rounded-xl border border-primary/30 bg-card p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium">Nome</label>
                            <Input
                                value={form.name}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                    setForm((f) => ({
                                        ...f,
                                        name: e.target.value,
                                    }))
                                }
                                placeholder="Ex: Ollama Local"
                                className="h-8 text-sm"
                            />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium">
                                Modelo Padrão
                            </label>
                            <Input
                                value={form.defaultModel}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>,
                                ) =>
                                    setForm((f) => ({
                                        ...f,
                                        defaultModel: e.target.value,
                                    }))
                                }
                                placeholder="Ex: gpt-4o-mini"
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">Base URL</label>
                        <Input
                            value={form.baseUrl}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setForm((f) => ({
                                    ...f,
                                    baseUrl: e.target.value,
                                }))
                            }
                            placeholder="https://api.openai.com/v1"
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium">
                            API Key{" "}
                            <span className="text-muted-foreground font-normal">
                                (opcional para modelos locais)
                            </span>
                        </label>
                        <Input
                            type="password"
                            value={form.apiKey}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setForm((f) => ({
                                    ...f,
                                    apiKey: e.target.value,
                                }))
                            }
                            placeholder="sk-..."
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is-default"
                            checked={form.isDefault}
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>,
                            ) =>
                                setForm((f) => ({
                                    ...f,
                                    isDefault: e.target.checked,
                                }))
                            }
                            className="h-4 w-4"
                        />
                        <label
                            htmlFor="is-default"
                            className="text-sm cursor-pointer"
                        >
                            Definir como provedor padrão
                        </label>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setAdding(false)}
                        >
                            <LuX className="mr-1.5 h-3.5 w-3.5" />
                            Cancelar
                        </Button>
                        <Button size="sm" onClick={handleCreate}>
                            <LuCheck className="mr-1.5 h-3.5 w-3.5" />
                            Adicionar
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
