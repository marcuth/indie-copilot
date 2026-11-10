import {
    LOGO_ACCEPTED_TYPES,
    LOGO_MIN_SIZE,
    LOGO_SIZE,
    LogoError,
    processLogo,
} from "@/lib/logo"
import { LuImagePlus, LuTrash2, LuUpload } from "react-icons/lu"
import { useRef, useState, type ReactElement } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface LogoUploadProps {
    value?: string
    onChange: (logo: string | undefined) => void
    projectName?: string
}

export function LogoUpload({
    value,
    onChange,
    projectName,
}: LogoUploadProps): ReactElement {
    const inputRef = useRef<HTMLInputElement>(null)
    const [error, setError] = useState<string | null>(null)
    const [processing, setProcessing] = useState(false)

    const handleFileChange = async (
        event: React.ChangeEvent<HTMLInputElement>,
    ): Promise<void> => {
        const file = event.target.files?.[0]
        // Permite escolher o mesmo arquivo novamente depois de um erro
        event.target.value = ""
        if (!file) return

        setError(null)
        setProcessing(true)

        try {
            onChange(await processLogo(file))
        } catch (err) {
            setError(
                err instanceof LogoError
                    ? err.message
                    : "Não foi possível processar a imagem.",
            )
        } finally {
            setProcessing(false)
        }
    }

    const handleRemove = (): void => {
        setError(null)
        onChange(undefined)
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
                <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                    {value ? (
                        <img
                            src={value}
                            alt={
                                projectName
                                    ? `Logo de ${projectName}`
                                    : "Logo do projeto"
                            }
                            className="size-full object-cover"
                        />
                    ) : (
                        <LuImagePlus className="size-6 text-muted-foreground" />
                    )}
                </div>
                <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={processing}
                            onClick={() => inputRef.current?.click()}
                        >
                            <LuUpload />
                            {value ? "Alterar logo" : "Enviar logo"}
                        </Button>
                        {value && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={handleRemove}
                            >
                                <LuTrash2 />
                                Remover
                            </Button>
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Apenas imagens quadradas (PNG, JPG ou WebP), com no
                        mínimo {LOGO_MIN_SIZE}×{LOGO_MIN_SIZE} px. Serão
                        redimensionadas para {LOGO_SIZE}×{LOGO_SIZE} px.
                    </p>
                </div>
            </div>
            {error && (
                <p role="alert" className="text-xs text-destructive">
                    {error}
                </p>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={LOGO_ACCEPTED_TYPES.join(",")}
                className="hidden"
                onChange={(event) => void handleFileChange(event)}
            />
        </div>
    )
}
