import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react"

import { getSettings, saveSettings } from "../lib/db/database-client"

type Theme = "dark" | "light" | "system"

interface ThemeContextValue {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>(() => getSettings().theme)

    const applyTheme = (t: Theme) => {
        const root = document.documentElement
        const isDark =
            t === "dark" ||
            (t === "system" &&
                window.matchMedia("(prefers-color-scheme: dark)").matches)
        root.classList.toggle("dark", isDark)
    }

    const setTheme = (t: Theme) => {
        setThemeState(t)
        saveSettings({ theme: t })
        applyTheme(t)
    }

    useEffect(() => {
        applyTheme(theme)
    }, [theme])

    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)")
        const handler = () => {
            if (theme === "system") applyTheme("system")
        }
        mq.addEventListener("change", handler)
        return () => mq.removeEventListener("change", handler)
    }, [theme])

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme(): ThemeContextValue {
    const ctx = useContext(ThemeContext)
    if (!ctx) throw new Error("useTheme must be used within ThemeProvider")
    return ctx
}
