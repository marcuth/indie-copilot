import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react"

import {
    createProject,
    deleteProject,
    getProjectById,
    getProjects,
    updateProject,
} from "../lib/db/database-client"
import type { Project } from "../types"

interface ActiveProjectContextValue {
    projects: Project[]
    activeProject: Project | null
    setActiveProjectId: (id: string | null) => void
    refreshProjects: () => void
    createNewProject: (
        data: Pick<Project, "name"> &
            Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>,
    ) => Project
    updateActiveProject: (
        data: Partial<Omit<Project, "id" | "createdAt">>,
    ) => void
    removeProject: (id: string) => void
}

const ActiveProjectContext = createContext<ActiveProjectContextValue | null>(
    null,
)

export function ActiveProjectProvider({ children }: { children: ReactNode }) {
    const [projects, setProjects] = useState<Project[]>(() => getProjects())
    const [activeProjectId, setActiveProjectIdState] = useState<string | null>(
        () => getProjects()[0]?.id ?? null,
    )
    const [activeProject, setActiveProject] = useState<Project | null>(() =>
        activeProjectId ? (getProjectById(activeProjectId) ?? null) : null,
    )

    const refreshProjects = useCallback(() => {
        const all = getProjects()
        setProjects(all)
        if (activeProjectId) {
            setActiveProject(all.find((p) => p.id === activeProjectId) ?? null)
        }
    }, [activeProjectId])

    const setActiveProjectId = useCallback((id: string | null) => {
        setActiveProjectIdState(id)
        setActiveProject(id ? (getProjectById(id) ?? null) : null)
    }, [])

    const createNewProject = useCallback(
        (
            data: Pick<Project, "name"> &
                Partial<Omit<Project, "id" | "createdAt" | "updatedAt">>,
        ): Project => {
            const project = createProject(data)
            setProjects(getProjects())
            setActiveProject(project)
            setActiveProjectIdState(project.id)
            return project
        },
        [],
    )

    const updateActiveProject = useCallback(
        (data: Partial<Omit<Project, "id" | "createdAt">>) => {
            if (!activeProjectId) return
            const updated = updateProject(activeProjectId, data)
            if (updated) {
                setActiveProject(updated)
                setProjects(getProjects())
            }
        },
        [activeProjectId],
    )

    const removeProject = useCallback(
        (id: string) => {
            deleteProject(id)
            const all = getProjects()
            setProjects(all)
            if (activeProjectId === id) {
                const next = all[0] ?? null
                setActiveProjectIdState(next?.id ?? null)
                setActiveProject(next)
            }
        },
        [activeProjectId],
    )

    useEffect(() => {
        if (activeProjectId) {
            setActiveProject(getProjectById(activeProjectId) ?? null)
        }
    }, [activeProjectId])

    return (
        <ActiveProjectContext.Provider
            value={{
                projects,
                activeProject,
                setActiveProjectId,
                refreshProjects,
                createNewProject,
                updateActiveProject,
                removeProject,
            }}
        >
            {children}
        </ActiveProjectContext.Provider>
    )
}

export function useActiveProject(): ActiveProjectContextValue {
    const ctx = useContext(ActiveProjectContext)
    if (!ctx)
        throw new Error(
            "useActiveProject must be used within ActiveProjectProvider",
        )
    return ctx
}
