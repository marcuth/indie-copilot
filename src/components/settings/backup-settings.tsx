import { BackupError, parseBackup, type ParsedBackup } from "@/schemas/backup"
import { LuDownload, LuTriangleAlert, LuUpload } from "react-icons/lu"
import { useRef, useState, type ReactElement } from "react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { exportBackup, restoreBackup } from "../../lib/db/database-client"
import { Button } from "../ui/button"

function downloadBackup(): void {
    const blob = new Blob([JSON.stringify(exportBackup(), null, 2)], {
        type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `indie-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
}

function formatDate(iso?: string): string | null {
    if (!iso) return null
    const date = new Date(iso)
    return Number.isNaN(date.getTime()) ? null : date.toLocaleString("pt-BR")
}

export function BackupSettings(): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null)
    const [pending, setPending] = useState<ParsedBackup | null>(null)
    const [fileName, setFileName] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [restoring, setRestoring] = useState(false)

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0]
        // Permite escolher o mesmo arquivo de novo depois de um erro
        event.target.value = ""
        if (!file) return

        setError(null)

        try {
            setPending(parseBackup(await file.text()))
            setFileName(file.name)
        } catch (err) {
            setError(
                err instanceof BackupError
                    ? err.message
                    : "Não foi possível ler o arquivo.",
            )
        }
    }

    const handleRestore = async (): Promise<void> => {
        if (!pending) return

        setRestoring(true)
        setError(null)

        try {
            await restoreBackup(pending.data)
            // Recarrega para que todo o estado da interface venha do banco
            window.location.reload()
        } catch (err) {
            console.error("Falha ao restaurar o backup", err)
            setError(
                "Não foi possível restaurar o backup. Seus dados atuais não foram alterados.",
            )
            setRestoring(false)
        }
    }

    const exportedAt = formatDate(pending?.exportedAt)

    return (
        <>
            <div className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
                <div>
                    <h3 className="text-sm font-semibold">Exportar dados</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Gera um arquivo JSON com todos os projetos, notas,
                        conversas, provedores de IA e configurações salvos no
                        banco de dados.
                    </p>
                </div>
                <Button onClick={downloadBackup}>
                    <LuDownload className="mr-2 h-4 w-4" />
                    Baixar backup (.json)
                </Button>
            </div>

            <div className="space-y-4 rounded-xl border border-border/50 bg-card p-6">
                <div>
                    <h3 className="text-sm font-semibold">Restaurar backup</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Substitui todos os dados atuais pelos de um arquivo de
                        backup. Aceita arquivos gerados por esta versão e
                        backups antigos.
                    </p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => inputRef.current?.click()}
                >
                    <LuUpload className="mr-2 h-4 w-4" />
                    Escolher arquivo de backup
                </Button>
                {error && !pending && (
                    <p role="alert" className="text-xs text-destructive">
                        {error}
                    </p>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/json,.json"
                    className="hidden"
                    onChange={(event) => void handleFileChange(event)}
                />
            </div>

            <Dialog
                open={pending !== null}
                onOpenChange={(open) => {
                    if (!open && !restoring) {
                        setPending(null)
                        setError(null)
                    }
                }}
            >
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <LuTriangleAlert className="h-5 w-5 text-destructive" />
                            Restaurar backup?
                        </DialogTitle>
                        <DialogDescription>
                            Todos os dados atuais serão substituídos pelo
                            conteúdo de <strong>{fileName}</strong>
                            {exportedAt && <> (gerado em {exportedAt})</>}. Essa
                            ação não pode ser desfeita.
                        </DialogDescription>
                    </DialogHeader>

                    {pending && (
                        <div className="space-y-3">
                            <ul className="grid grid-cols-2 gap-2 text-sm">
                                {[
                                    ["Projetos", pending.counts.projects],
                                    ["Conversas", pending.counts.sessions],
                                    ["Mensagens", pending.counts.messages],
                                    ["Notas", pending.counts.notes],
                                    [
                                        "Provedores de IA",
                                        pending.counts.providers,
                                    ],
                                ].map(([label, count]) => (
                                    <li
                                        key={label}
                                        className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
                                    >
                                        <span className="text-muted-foreground">
                                            {label}
                                        </span>
                                        <span className="font-semibold tabular-nums">
                                            {count}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {pending.skipped > 0 && (
                                <p className="text-xs text-muted-foreground">
                                    {pending.skipped} registro(s) apontavam para
                                    dados inexistentes e serão ignorados.
                                </p>
                            )}

                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={downloadBackup}
                            >
                                <LuDownload className="mr-2 h-4 w-4" />
                                Baixar backup dos dados atuais primeiro
                            </Button>

                            {error && (
                                <p
                                    role="alert"
                                    className="text-xs text-destructive"
                                >
                                    {error}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={restoring}
                            onClick={() => {
                                setPending(null)
                                setError(null)
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={restoring}
                            onClick={() => void handleRestore()}
                        >
                            {restoring
                                ? "Restaurando..."
                                : "Restaurar e substituir tudo"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
