import type { ReactElement } from "react"

import "../../App.css"

interface DatabaseErrorProps {
    error: unknown
}

export function DatabaseError({ error }: DatabaseErrorProps): ReactElement {
    const message = error instanceof Error ? error.message : String(error)

    return (
        <div className="flex h-screen flex-col items-center justify-center gap-3 bg-background px-8 text-center text-foreground">
            <h1 className="font-heading text-2xl font-bold">
                Não foi possível abrir o banco de dados
            </h1>
            <p className="max-w-md text-sm text-muted-foreground">
                Seus dados não foram alterados. Feche e abra o aplicativo
                novamente. Se o problema continuar, o erro abaixo ajuda a
                diagnosticar.
            </p>
            <pre className="max-w-xl overflow-x-auto rounded-lg border border-border bg-muted p-3 text-left text-xs">
                {message}
            </pre>
        </div>
    )
}
