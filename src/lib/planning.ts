import {
    LuChartBar,
    LuDollarSign,
    LuLightbulb,
    LuMap,
    LuMegaphone,
    LuServer,
    LuTarget,
    LuShieldAlert,
    LuTrendingUp,
    LuUsers,
    LuUsersRound,
    LuChartPie,
} from "react-icons/lu"
import type { IconType } from "react-icons"
import type { Project } from "@/types"

export type PlanningFieldKey =
    | "problemSolution"
    | "targetAudience"
    | "competition"
    | "swot"
    | "businessModel"
    | "financials"
    | "risks"
    | "userAcquisition"
    | "marketing"
    | "roadmap"
    | "team"
    | "infrastructure"

export interface PlanningSection {
    key: PlanningFieldKey
    label: string
    path: string
    icon: IconType
}

export interface PlanningCategory {
    id: string
    label: string
    sections: PlanningSection[]
}

export interface PlanningCategoryProgress {
    category: PlanningCategory
    completed: number
    total: number
    percentage: number
}

export interface PlanningProgress {
    completed: number
    total: number
    percentage: number
    categories: PlanningCategoryProgress[]
}

export const PLANNING_CATEGORIES: PlanningCategory[] = [
    {
        id: "discovery",
        label: "Descoberta & Validação",
        sections: [
            {
                key: "problemSolution",
                label: "Problema & Solução",
                path: "problem-solution",
                icon: LuLightbulb,
            },
            {
                key: "targetAudience",
                label: "Público-Alvo",
                path: "target-audience",
                icon: LuUsers,
            },
            {
                key: "competition",
                label: "Mercado & Concorrência",
                path: "competition",
                icon: LuTrendingUp,
            },
            {
                key: "swot",
                label: "Análise SWOT",
                path: "swot-analysis",
                icon: LuChartPie,
            },
        ],
    },
    {
        id: "business",
        label: "Negócio & Finanças",
        sections: [
            {
                key: "businessModel",
                label: "Modelo de Negócio",
                path: "business-model",
                icon: LuDollarSign,
            },
            {
                key: "financials",
                label: "Finanças",
                path: "financials",
                icon: LuChartBar,
            },
            {
                key: "risks",
                label: "Riscos",
                path: "risks",
                icon: LuShieldAlert,
            },
        ],
    },
    {
        id: "growth",
        label: "Crescimento",
        sections: [
            {
                key: "userAcquisition",
                label: "Aquisição de Usuários",
                path: "user-acquisition",
                icon: LuTarget,
            },
            {
                key: "marketing",
                label: "Marketing",
                path: "marketing",
                icon: LuMegaphone,
            },
        ],
    },
    {
        id: "execution",
        label: "Execução",
        sections: [
            {
                key: "roadmap",
                label: "Roadmap",
                path: "roadmap",
                icon: LuMap,
            },
            {
                key: "team",
                label: "Equipe",
                path: "team",
                icon: LuUsersRound,
            },
            {
                key: "infrastructure",
                label: "Infraestrutura",
                path: "infrastructure",
                icon: LuServer,
            },
        ],
    },
]

// Campos preenchidos automaticamente ao criar um item (valores padrão), que
// não indicam que o usuário realmente planejou algo.
const DEFAULT_VALUE_KEYS = new Set([
    "currencyCode",
    "ageRange",
    "gender",
    "availability",
])

function hasMeaningfulContent(value: unknown): boolean {
    if (typeof value === "string") return value.trim().length > 0
    if (typeof value === "number") return value > 0
    if (Array.isArray(value)) return value.some(hasMeaningfulContent)
    if (value && typeof value === "object") {
        return Object.entries(value).some(
            ([key, nested]) =>
                !DEFAULT_VALUE_KEYS.has(key) && hasMeaningfulContent(nested),
        )
    }
    return false
}

export function isPlanningSectionFilled(raw: string | undefined): boolean {
    if (!raw || !raw.trim()) return false
    try {
        return hasMeaningfulContent(JSON.parse(raw))
    } catch {
        // Conteúdo legado em texto puro
        return true
    }
}

export function getPlanningProgress(project: Project): PlanningProgress {
    const categories = PLANNING_CATEGORIES.map((category) => {
        const completed = category.sections.filter((section) =>
            isPlanningSectionFilled(project[section.key]),
        ).length
        const total = category.sections.length

        return {
            category,
            completed,
            total,
            percentage: Math.round((completed / total) * 100),
        }
    })

    const completed = categories.reduce((sum, item) => sum + item.completed, 0)
    const total = categories.reduce((sum, item) => sum + item.total, 0)

    return {
        completed,
        total,
        percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
        categories,
    }
}
