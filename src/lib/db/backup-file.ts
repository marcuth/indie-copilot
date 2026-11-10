import { save } from "@tauri-apps/plugin-dialog"
import { invoke } from "@tauri-apps/api/core"

import { exportBackup } from "./database-client"

function defaultBackupName(): string {
    return `indie-copilot-backup-${new Date().toISOString().slice(0, 10)}.json`
}

/**
 * Abre o diálogo "Salvar como" do sistema para o usuário escolher onde guardar
 * o backup e grava o arquivo lá.
 *
 * @returns o caminho salvo, ou null se o usuário cancelou.
 */
export async function saveBackupToFile(): Promise<string | null> {
    const chosen = await save({
        title: "Salvar backup",
        defaultPath: defaultBackupName(),
        filters: [{ name: "Backup do Indie Copilot", extensions: ["json"] }],
    })

    if (!chosen) return null

    const path = /\.json$/i.test(chosen) ? chosen : `${chosen}.json`

    await invoke("save_text_file", {
        path,
        contents: JSON.stringify(exportBackup(), null, 2),
    })

    return path
}
