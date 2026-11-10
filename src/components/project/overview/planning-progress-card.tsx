import { getPlanningProgress, isPlanningSectionFilled } from "@/lib/planning"
import { LuCircle, LuCircleCheck } from "react-icons/lu"
import { Progress } from "@/components/ui/progress"
import { useNavigate } from "react-router-dom"
import type { Project } from "@/types"
import { cn } from "@/lib/utils"

interface PlanningProgressCardProps {
    project: Project
}

export function PlanningProgressCard({ project }: PlanningProgressCardProps) {
    const navigate = useNavigate()
    const progress = getPlanningProgress(project)

    return (
        <div className="rounded-xl border border-border/50 bg-card p-6">
            <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                    <h2 className="font-heading text-base font-semibold">
                        Progresso do Planejamento
                    </h2>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        {progress.completed} de {progress.total} etapas
                        preenchidas
                    </p>
                </div>
                <span className="font-heading text-3xl leading-none font-bold tabular-nums">
                    {progress.percentage}%
                </span>
            </div>

            <Progress value={progress.percentage} className="h-2.5" />

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {progress.categories.map(
                    ({ category, completed, total, percentage }) => (
                        <div key={category.id} className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold">
                                    {category.label}
                                </span>
                                <span className="text-muted-foreground tabular-nums">
                                    {completed}/{total}
                                </span>
                            </div>
                            <Progress value={percentage} className="h-1" />
                            <ul className="space-y-0.5">
                                {category.sections.map((section) => {
                                    const filled = isPlanningSectionFilled(
                                        project[section.key],
                                    )

                                    return (
                                        <li key={section.key}>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    navigate(
                                                        `/project/${project.id}/${section.path}`,
                                                    )
                                                }
                                                className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-xs transition-colors hover:bg-muted"
                                            >
                                                {filled ? (
                                                    <LuCircleCheck className="size-3.5 shrink-0 text-confirm" />
                                                ) : (
                                                    <LuCircle className="size-3.5 shrink-0 text-muted-foreground/60" />
                                                )}
                                                <span
                                                    className={cn(
                                                        filled
                                                            ? "text-foreground"
                                                            : "text-muted-foreground",
                                                    )}
                                                >
                                                    {section.label}
                                                </span>
                                            </button>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    ),
                )}
            </div>
        </div>
    )
}
