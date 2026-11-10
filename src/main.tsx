import ReactDOM from "react-dom/client"
import React from "react"

import { DatabaseError } from "./components/layout/database-error"
import { initDatabase } from "./lib/db/database-client"
import App from "./App"

async function bootstrap(): Promise<void> {
    const root = ReactDOM.createRoot(
        document.getElementById("root") as HTMLElement,
    )

    try {
        // O banco precisa estar aberto (e os dados antigos migrados) antes de
        // qualquer componente ler o estado.
        await initDatabase()
    } catch (error) {
        console.error("Falha ao inicializar o banco de dados", error)
        root.render(<DatabaseError error={error} />)
        return
    }

    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
}

void bootstrap()
