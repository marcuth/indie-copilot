import {
    LuSettings,
    LuBot,
    LuDownload,
    LuMoon,
    LuSun,
    LuMonitor,
} from "react-icons/lu"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { AiProvidersSettings } from "./ai-providers-settings"
import { useTheme } from "../../contexts/theme-context"
import { Separator } from "../ui/separator"
import { Button } from "../ui/button"

export function SettingsPage() {
    const { theme, setTheme } = useTheme()

    const handleExport = () => {
        const data: Record<string, unknown> = {}
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)!
            if (key.startsWith("indie-copilot:")) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key)!)
                } catch {
                    data[key] = localStorage.getItem(key)
                }
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: "application/json",
        })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `indie-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-border/50 px-8 py-5">
                <LuSettings className="h-5 w-5" />
                <div>
                    <h1 className="font-heading text-2xl font-bold">
                        Configurações
                    </h1>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                        Personalize o Indie Copilot
                    </p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="mx-auto max-w-2xl">
                    <Tabs defaultValue="ai">
                        <TabsList className="mb-6">
                            <TabsTrigger value="ai">
                                <LuBot className="mr-2 h-4 w-4" />
                                Provedores de IA
                            </TabsTrigger>
                            <TabsTrigger value="general">
                                <LuSettings className="mr-2 h-4 w-4" />
                                Geral
                            </TabsTrigger>
                            <TabsTrigger value="backup">
                                <LuDownload className="mr-2 h-4 w-4" />
                                Backup
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="ai">
                            <AiProvidersSettings />
                        </TabsContent>

                        <TabsContent value="general" className="space-y-6">
                            <div>
                                <h2 className="font-heading text-lg font-bold">
                                    Aparência
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Escolha o tema da interface
                                </p>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(
                                    [
                                        {
                                            value: "light",
                                            label: "Claro",
                                            icon: LuSun,
                                        },
                                        {
                                            value: "dark",
                                            label: "Escuro",
                                            icon: LuMoon,
                                        },
                                        {
                                            value: "system",
                                            label: "Sistema",
                                            icon: LuMonitor,
                                        },
                                    ] as const
                                ).map(({ value, label, icon: Icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-colors ${
                                            theme === value
                                                ? "border-primary bg-primary/10"
                                                : "border-border/50 bg-card hover:border-primary/30"
                                        }`}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="text-sm font-medium">
                                            {label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Sobre</h3>
                                <div className="rounded-lg bg-muted p-4 font-mono text-xs space-y-1">
                                    <p>Indie Copilot v0.1.0</p>
                                    <p className="text-muted-foreground">
                                        Tauri v2 + React 19 + TypeScript
                                    </p>
                                    <p className="text-muted-foreground">
                                        OpenAI-compatible · Local-first · Open
                                        Source
                                    </p>
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="backup" className="space-y-6">
                            <div>
                                <h2 className="font-heading text-lg font-bold">
                                    Backup & Exportação
                                </h2>
                                <p className="text-sm text-muted-foreground">
                                    Exporte todos os seus dados como JSON
                                </p>
                            </div>

                            <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-sm">
                                        Exportar dados
                                    </h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Gera um arquivo JSON com todos os
                                        projetos, notas, conversas e
                                        configurações.
                                    </p>
                                </div>
                                <Button onClick={handleExport}>
                                    <LuDownload className="mr-2 h-4 w-4" />
                                    Baixar backup (.json)
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    )
}
