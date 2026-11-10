import {
    LuLayoutDashboard,
    LuStickyNote,
    LuSettings,
    LuPlus,
    LuFolderOpen,
    LuChevronDown,
    LuTrash2,
    LuCircleCheck,
} from "react-icons/lu"
import { useNavigate, useLocation } from "react-router-dom"
import { useState } from "react"

import {
    Sidebar,
    SidebarContent,
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
import {
    getPlanningProgress,
    isPlanningSectionFilled,
} from "../../lib/planning"
import { useActiveProject } from "../../contexts/active-project-context"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { NewProjectDialog } from "../project/new-project-dialog"
import { ScrollArea } from "../ui/scroll-area"
import { Progress } from "../ui/progress"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"

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

    const progress = activeProject ? getPlanningProgress(activeProject) : null

    const isActive = (path: string) => location.pathname.includes(`/${path}`)

    return (
        <>
            <Sidebar className="border-r border-border/50" collapsible="icon">
                <SidebarHeader className="p-4">
                    <div className="flex items-center gap-3">
                        <img
                            src="/logo.svg"
                            alt="Indie Copilot"
                            className="h-8 w-8 shrink-0"
                        />
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
                                                        <Avatar className="h-5 w-5 rounded-md text-[10px]">
                                                            <AvatarImage
                                                                src={
                                                                    project.logo
                                                                }
                                                                alt={
                                                                    project.name
                                                                }
                                                            />
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
                {activeProject && progress && (
                    <SidebarContent>
                        <SidebarGroup>
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
                                <div className="px-2 pb-2 group-data-[collapsible=icon]:hidden">
                                    <div className="mb-1.5 flex items-center justify-between text-xs">
                                        <span className="text-muted-foreground">
                                            Progresso do planejamento
                                        </span>
                                        <span className="font-semibold">
                                            {progress.percentage}%
                                        </span>
                                    </div>
                                    <Progress
                                        value={progress.percentage}
                                        className="h-1.5"
                                    />
                                    <p className="mt-1 text-[11px] text-muted-foreground">
                                        {progress.completed} de {progress.total}{" "}
                                        etapas preenchidas
                                    </p>
                                </div>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={isActive("overview")}
                                            onClick={() =>
                                                navigateTo("overview")
                                            }
                                            tooltip="Visão Geral"
                                            className="text-sm"
                                        >
                                            <LuLayoutDashboard className="h-4 w-4" />
                                            <span>Visão Geral</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>

                        {progress.categories.map(
                            ({ category, completed, total }) => (
                                <SidebarGroup key={category.id}>
                                    <SidebarGroupLabel className="flex items-center justify-between">
                                        <span className="truncate">
                                            {category.label}
                                        </span>
                                        <span className="text-[10px] font-normal tabular-nums">
                                            {completed}/{total}
                                        </span>
                                    </SidebarGroupLabel>
                                    <SidebarGroupContent>
                                        <SidebarMenu>
                                            {category.sections.map(
                                                (section) => (
                                                    <SidebarMenuItem
                                                        key={section.path}
                                                    >
                                                        <SidebarMenuButton
                                                            isActive={isActive(
                                                                section.path,
                                                            )}
                                                            onClick={() =>
                                                                navigateTo(
                                                                    section.path,
                                                                )
                                                            }
                                                            tooltip={
                                                                section.label
                                                            }
                                                            className="text-sm"
                                                        >
                                                            <section.icon className="h-4 w-4" />
                                                            <span>
                                                                {section.label}
                                                            </span>
                                                            {isPlanningSectionFilled(
                                                                activeProject[
                                                                    section.key
                                                                ],
                                                            ) && (
                                                                <LuCircleCheck className="ml-auto h-3.5 w-3.5 text-confirm" />
                                                            )}
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ),
                                            )}
                                        </SidebarMenu>
                                    </SidebarGroupContent>
                                </SidebarGroup>
                            ),
                        )}

                        <SidebarGroup>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    <SidebarMenuItem>
                                        <SidebarMenuButton
                                            isActive={isActive("notes")}
                                            onClick={() => navigateTo("notes")}
                                            tooltip="Notas"
                                            className="text-sm"
                                        >
                                            <LuStickyNote className="h-4 w-4" />
                                            <span>Notas</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
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
