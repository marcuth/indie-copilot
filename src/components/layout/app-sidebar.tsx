import {
    LuLayoutDashboard,
    LuLightbulb,
    LuUsers,
    LuTrendingUp,
    LuDollarSign,
    LuMegaphone,
    LuMap,
    LuUsersRound,
    LuServer,
    LuShieldAlert,
    LuChartBar,
    LuStickyNote,
    LuSettings,
    LuPlus,
    LuBot,
    LuFolderOpen,
    LuChevronDown,
    LuTrash2,
} from "react-icons/lu"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"

import {
    Sidebar,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "../ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useActiveProject } from "../../contexts/active-project-context"
import { NewProjectDialog } from "../project/new-project-dialog"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { ScrollArea } from "../ui/scroll-area"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

const PROJECT_NAV_ITEMS = [
    { label: "Visão Geral", path: "overview", icon: LuLayoutDashboard },
    {
        label: "Problema & Solução",
        path: "problem-solution",
        icon: LuLightbulb,
    },
    { label: "Público-Alvo", path: "target-audience", icon: LuUsers },
    {
        label: "Mercado & Concorrência",
        path: "competition",
        icon: LuTrendingUp,
    },
    { label: "Modelo de Negócio", path: "business-model", icon: LuDollarSign },
    {
        label: "Aquisição de Usuários",
        path: "user-acquisition",
        icon: LuMegaphone,
    },
    { label: "Marketing", path: "marketing", icon: LuMegaphone },
    { label: "Roadmap", path: "roadmap", icon: LuMap },
    { label: "Equipe", path: "team", icon: LuUsersRound },
    { label: "Infraestrutura", path: "infrastructure", icon: LuServer },
    { label: "Finanças", path: "financials", icon: LuChartBar },
    { label: "Riscos", path: "risks", icon: LuShieldAlert },
    { label: "Análise SWOT", path: "swot-analysis", icon: LuChartBar },
    { label: "Notas", path: "notes", icon: LuStickyNote },
]

export function AppSidebar() {
    const { projects, activeProject, setActiveProjectId, removeProject } =
        useActiveProject()
    const navigate = useNavigate()
    const location = useLocation()
    const [newProjectOpen, setNewProjectOpen] = useState(false)

    const navigateTo = (path: string) => {
        if (!activeProject) return
        navigate(`/project/${activeProject.id}/${path}`)
    }

    const isActive = (path: string) => location.pathname.includes(`/${path}`)

    return (
        <>
            <Sidebar className="border-r border-border/50" collapsible="icon">
                <SidebarHeader className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                            <LuBot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-heading text-sm font-bold leading-tight">
                                Indie Copilot
                            </span>
                            <span className="text-xs text-muted-foreground">
                                v0.1.0
                            </span>
                        </div>
                    </div>
                </SidebarHeader>

                <SidebarSeparator />

                {/* Project Switcher */}
                <SidebarGroup>
                    <SidebarGroupLabel className="flex items-center justify-between">
                        <span>Projetos</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setNewProjectOpen(true)}
                        >
                            <LuPlus className="h-3.5 w-3.5" />
                        </Button>
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <ScrollArea className="max-h-40">
                            <SidebarMenu>
                                {projects.length === 0 && (
                                    <div className="px-2 py-4 text-center">
                                        <p className="text-xs text-muted-foreground">
                                            Nenhum projeto ainda
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2 h-7 text-xs"
                                            onClick={() =>
                                                setNewProjectOpen(true)
                                            }
                                        >
                                            <LuPlus className="mr-1.5 h-3 w-3" />
                                            Criar projeto
                                        </Button>
                                    </div>
                                )}
                                {projects.map((project) => (
                                    <SidebarMenuItem key={project.id}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <SidebarMenuButton
                                                    isActive={
                                                        activeProject?.id ===
                                                        project.id
                                                    }
                                                    className="group justify-between"
                                                    onClick={() => {
                                                        setActiveProjectId(
                                                            project.id,
                                                        )
                                                        navigate(
                                                            `/project/${project.id}/overview`,
                                                        )
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 truncate">
                                                        <Avatar className="h-5 w-5 text-[10px]">
                                                            <AvatarFallback className="bg-primary/20 text-primary">
                                                                {project.name
                                                                    .charAt(0)
                                                                    .toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="truncate text-sm">
                                                            {project.name}
                                                        </span>
                                                    </div>
                                                    <LuChevronDown className="h-3 w-3 shrink-0 opacity-0 group-hover:opacity-70" />
                                                </SidebarMenuButton>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                className="w-48"
                                            >
                                                <DropdownMenuItem
                                                    onClick={() => {
                                                        setActiveProjectId(
                                                            project.id,
                                                        )
                                                        navigate(
                                                            `/project/${project.id}/overview`,
                                                        )
                                                    }}
                                                >
                                                    <LuFolderOpen className="mr-2 h-4 w-4" />
                                                    Abrir projeto
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive"
                                                    onClick={() =>
                                                        removeProject(
                                                            project.id,
                                                        )
                                                    }
                                                >
                                                    <LuTrash2 className="mr-2 h-4 w-4" />
                                                    Excluir projeto
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </ScrollArea>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator />

                {/* Project Navigation */}
                {activeProject && (
                    <SidebarGroup className="flex-1">
                        <SidebarGroupLabel>
                            <span className="truncate">
                                {activeProject.name}
                            </span>
                            {activeProject.category && (
                                <Badge
                                    variant="secondary"
                                    className="ml-1 text-[10px]"
                                >
                                    {activeProject.category.name}
                                </Badge>
                            )}
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <ScrollArea className="h-full">
                                <SidebarMenu>
                                    {PROJECT_NAV_ITEMS.map((item) => (
                                        <SidebarMenuItem key={item.path}>
                                            <SidebarMenuButton
                                                isActive={isActive(item.path)}
                                                onClick={() =>
                                                    navigateTo(item.path)
                                                }
                                                className="text-sm"
                                            >
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </ScrollArea>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}

                <SidebarFooter className="p-2">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                isActive={isActive("settings")}
                                onClick={() => navigate("/settings")}
                            >
                                <LuSettings className="h-4 w-4" />
                                <span>Configurações</span>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <NewProjectDialog
                open={newProjectOpen}
                onOpenChange={setNewProjectOpen}
            />
        </>
    )
}
