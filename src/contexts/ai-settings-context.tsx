import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react"

import {
    getSettings,
    saveSettings,
    getDefaultProvider,
} from "../lib/db/database-client"
import type { AiProvider, AppSettings } from "../types"

interface AiSettingsContextValue {
    settings: AppSettings
    activeProvider: AiProvider | null
    updateSettings: (
        data: Partial<Omit<AppSettings, "id" | "createdAt">>,
    ) => void
    refreshSettings: () => void
}

const AiSettingsContext = createContext<AiSettingsContextValue | null>(null)

export function AiSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<AppSettings>(() => getSettings())
    const [activeProvider, setActiveProvider] = useState<AiProvider | null>(
        () => getDefaultProvider() ?? null,
    )

    const refreshSettings = useCallback(() => {
        setSettings(getSettings())
        setActiveProvider(getDefaultProvider() ?? null)
    }, [])

    const updateSettings = useCallback(
        (data: Partial<Omit<AppSettings, "id" | "createdAt">>) => {
            const updated = saveSettings(data)
            setSettings(updated)
        },
        [],
    )

    useEffect(() => {
        setActiveProvider(getDefaultProvider() ?? null)
    }, [settings.activeProviderId])

    return (
        <AiSettingsContext.Provider
            value={{
                settings,
                activeProvider,
                updateSettings,
                refreshSettings,
            }}
        >
            {children}
        </AiSettingsContext.Provider>
    )
}

export function useAiSettings(): AiSettingsContextValue {
    const ctx = useContext(AiSettingsContext)
    if (!ctx)
        throw new Error("useAiSettings must be used within AiSettingsProvider")
    return ctx
}
