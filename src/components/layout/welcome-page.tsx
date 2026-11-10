import {
    LuRocket,
    LuSparkles,
    LuShield,
    LuGlobe,
    LuHardDrive,
} from "react-icons/lu"
import { useState } from "react"

import { NewProjectDialog } from "../project/new-project-dialog"
import { Button } from "../ui/button"

const FEATURES = [
    {
        icon: LuShield,
        title: "100% Local & Privado",
        desc: "Seus dados ficam no seu computador. Nenhum servidor externo, nenhuma subscrição.",
    },
    {
        icon: LuGlobe,
        title: "Qualquer Provedor de IA",
        desc: "Ollama, OpenAI, DeepSeek, Groq, OpenRouter — basta configurar a Base URL.",
    },
    {
        icon: LuSparkles,
        title: "Copilot com Contexto Real",
        desc: "A IA conhece todo o seu projeto e pode preencher seções automaticamente.",
    },
    {
        icon: LuHardDrive,
        title: "Instalação em Um Clique",
        desc: "Binário nativo para Windows, macOS e Linux. Abre instantaneamente, funciona offline.",
    },
]

export function WelcomePage() {
    const [newProjectOpen, setNewProjectOpen] = useState(false)

    return (
        <>
            <div className="flex h-full flex-col items-center justify-center px-8">
                <div className="mx-auto max-w-lg text-center space-y-8">
                    {/* Logo */}
                    <div className="flex justify-center">
                        <img
                            src="/logo.svg"
                            alt="Indie Copilot"
                            className="h-20 w-20 drop-shadow-lg"
                        />
                    </div>

                    {/* Headline */}
                    <div className="space-y-3">
                        <h1 className="font-heading text-4xl font-bold tracking-tight">
                            Indie Copilot
                        </h1>
                        <p className="text-muted-foreground leading-relaxed">
                            Seu co-fundador com IA para planejar, validar e
                            lançar produtos digitais — 100% local, privado e
                            open source.
                        </p>
                    </div>

                    {/* CTA */}
                    <Button
                        size="lg"
                        className="gap-2"
                        onClick={() => setNewProjectOpen(true)}
                    >
                        <LuRocket className="h-5 w-5" />
                        Criar meu primeiro projeto
                    </Button>

                    {/* Features */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-xl border border-border/50 bg-card p-4 text-left"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <feature.icon className="h-4 w-4 text-primary" />
                                    <span className="font-semibold text-sm">
                                        {feature.title}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <NewProjectDialog
                open={newProjectOpen}
                onOpenChange={setNewProjectOpen}
            />
        </>
    )
}
