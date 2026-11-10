import {
    getHostname,
    getReferences,
    getYouTubeEmbedUrl,
    getYouTubeId,
    getYouTubeThumbnail,
    type Reference,
} from "@/lib/references"
import {
    LuArrowLeft,
    LuBookOpen,
    LuExternalLink,
    LuLink,
    LuMaximize2,
    LuMinimize2,
    LuPlay,
} from "react-icons/lu"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { openUrl } from "@tauri-apps/plugin-opener"
import { useState, type ReactElement } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ReferencesTriggerProps {
    pageKey: string
}

function openExternal(url: string): void {
    void openUrl(url).catch((error: unknown) => {
        console.error("Falha ao abrir referência", error)
    })
}

function YouTubeCard({
    reference,
    videoId,
    onSelect,
}: {
    reference: Reference
    videoId: string
    onSelect: () => void
}): ReactElement {
    const [thumbnailFailed, setThumbnailFailed] = useState(false)

    return (
        <button
            type="button"
            onClick={onSelect}
            className="group flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card text-left shadow-xs transition-colors hover:border-primary/50"
        >
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {!thumbnailFailed && (
                    <img
                        src={getYouTubeThumbnail(videoId)}
                        alt={reference.title}
                        loading="lazy"
                        onError={() => setThumbnailFailed(true)}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                    <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
                        <LuPlay className="ml-0.5 size-5 fill-current" />
                    </span>
                </div>
                <span className="absolute top-2 left-2 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                    YouTube
                </span>
            </div>
            <div className="space-y-1 p-4">
                <p className="line-clamp-2 text-sm leading-snug font-semibold">
                    {reference.title}
                </p>
                {reference.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                        {reference.description}
                    </p>
                )}
            </div>
        </button>
    )
}

function LinkCard({ reference }: { reference: Reference }): ReactElement {
    return (
        <button
            type="button"
            onClick={() => openExternal(reference.url)}
            className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card p-4 text-left shadow-xs transition-colors hover:border-primary/50"
        >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <LuLink className="size-4" />
            </span>
            <span className="min-w-0 flex-1 space-y-1">
                <span className="line-clamp-2 block text-sm leading-snug font-semibold">
                    {reference.title}
                </span>
                {reference.description && (
                    <span className="line-clamp-2 block text-xs text-muted-foreground">
                        {reference.description}
                    </span>
                )}
                <span className="block truncate text-[11px] text-muted-foreground/80">
                    {getHostname(reference.url)}
                </span>
            </span>
            <LuExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
    )
}

function VideoPlayer({
    reference,
    videoId,
}: {
    reference: Reference
    videoId: string
}): ReactElement {
    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 bg-black">
                <iframe
                    key={videoId}
                    src={getYouTubeEmbedUrl(videoId)}
                    title={reference.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="size-full border-0"
                />
            </div>
            <div className="flex shrink-0 items-center justify-between gap-4 border-t border-border/50 px-5 py-3">
                <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                        {reference.title}
                    </p>
                    {reference.description && (
                        <p className="truncate text-xs text-muted-foreground">
                            {reference.description}
                        </p>
                    )}
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => openExternal(reference.url)}
                >
                    <LuExternalLink />
                    Abrir no YouTube
                </Button>
            </div>
        </div>
    )
}

export function ReferencesTrigger({
    pageKey,
}: ReferencesTriggerProps): ReactElement | null {
    const references = getReferences(pageKey)
    const [open, setOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)
    const [playing, setPlaying] = useState<Reference | null>(null)

    if (references.length === 0) return null

    const playingId = playing ? getYouTubeId(playing.url) : null

    const handleOpenChange = (next: boolean): void => {
        setOpen(next)
        if (!next) setPlaying(null)
    }

    const handleToggleExpand = (): void => {
        // Voltar ao painel lateral interrompe o vídeo
        if (expanded) setPlaying(null)
        setExpanded((value) => !value)
    }

    const handleSelect = (reference: Reference): void => {
        setPlaying(reference)
        setExpanded(true)
    }

    const Title = expanded ? DialogTitle : SheetTitle

    const panel = (
        <>
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border/50 p-4 pr-12">
                <div className="flex min-w-0 items-center gap-2">
                    {playingId && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 shrink-0"
                            aria-label="Voltar para a lista"
                            title="Voltar para a lista"
                            onClick={() => setPlaying(null)}
                        >
                            <LuArrowLeft className="h-4 w-4" />
                        </Button>
                    )}
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary">
                        <LuBookOpen className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="min-w-0">
                        <Title className="text-sm leading-tight font-semibold">
                            Referências
                        </Title>
                        <p className="text-xs text-muted-foreground">
                            {references.length}{" "}
                            {references.length === 1
                                ? "material de apoio"
                                : "materiais de apoio"}
                        </p>
                    </div>
                </div>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    aria-label={expanded ? "Recolher" : "Expandir"}
                    title={expanded ? "Recolher" : "Expandir"}
                    onClick={handleToggleExpand}
                >
                    {expanded ? (
                        <LuMinimize2 className="h-4 w-4" />
                    ) : (
                        <LuMaximize2 className="h-4 w-4" />
                    )}
                </Button>
            </div>

            {playing && playingId ? (
                <VideoPlayer reference={playing} videoId={playingId} />
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto p-5">
                    <div
                        className={cn(
                            "grid gap-4",
                            expanded
                                ? "grid-cols-2 lg:grid-cols-3"
                                : "grid-cols-1",
                        )}
                    >
                        {references.map((reference) => {
                            const videoId = getYouTubeId(reference.url)

                            return videoId ? (
                                <YouTubeCard
                                    key={reference.url}
                                    reference={reference}
                                    videoId={videoId}
                                    onSelect={() => handleSelect(reference)}
                                />
                            ) : (
                                <LinkCard
                                    key={reference.url}
                                    reference={reference}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
            >
                <LuBookOpen className="mr-1.5 h-3.5 w-3.5" />
                Referências
                <span className="ml-1.5 rounded-full bg-primary/15 px-1.5 text-[10px] font-semibold tabular-nums">
                    {references.length}
                </span>
            </Button>

            <Sheet open={open && !expanded} onOpenChange={handleOpenChange}>
                <SheetContent
                    side="right"
                    className="flex h-full max-h-screen w-[420px] flex-col gap-0 overflow-hidden p-0 sm:max-w-[480px]"
                >
                    {panel}
                </SheetContent>
            </Sheet>
            <Dialog open={open && expanded} onOpenChange={handleOpenChange}>
                <DialogContent className="flex h-[90vh] w-[min(1280px,calc(100vw-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
                    {panel}
                </DialogContent>
            </Dialog>
        </>
    )
}
