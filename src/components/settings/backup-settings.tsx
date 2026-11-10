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
import { restoreBackup } from "../../lib/db/database-client"
import { saveBackupToFile } from "../../lib/db/backup-file"
import { Button } from "../ui/button"

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
    const [saving, setSaving] = useState(false)
    const [savedPath, setSavedPath] = useState<string | null>(null)
    const [saveError, setSaveError] = useState<string | null>(null)

    const handleSave = async (): Promise<void> => {
        setSaving(true)
        setSavedPath(null)
        setSaveError(null)

        try {
            // Abre o "Salvar como" do sistema; null significa que cancelou
            setSavedPath(await saveBackupToFile())
        } catch (err) {
            console.error("Falha ao salvar o backup", err)
            setSaveError(
                typeof err === "string"
                    ? err
                    : "Não foi possível salvar o backup.",
            )
        } finally {
            setSaving(false)
        }
    }

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
                        banco de dados. Você escolhe onde salvá-lo.
                    </p>
                </div>
                <Button disabled={saving} onClick={() => void handleSave()}>
                    <LuDownload className="mr-2 h-4 w-4" />
                    {saving ? "Salvando..." : "Salvar backup como..."}
                </Button>
                {savedPath && (
                    <p className="break-all text-xs text-muted-foreground">
                        Backup salvo em{" "}
                        <span className="font-mono text-foreground">
                            {savedPath}
                        </span>
                    </p>
                )}
                {saveError && (
                    <p role="alert" className="text-xs text-destructive">
                        {saveError}
                    </p>
                )}
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
                                disabled={saving}
                                onClick={() => void handleSave()}
                            >
                                <LuDownload className="mr-2 h-4 w-4" />
                                Salvar backup dos dados atuais primeiro
                            </Button>
                            {savedPath && (
                                <p className="break-all text-xs text-muted-foreground">
                                    Salvo em {savedPath}
                                </p>
                            )}

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
