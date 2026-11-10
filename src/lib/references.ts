export interface Reference {
    /** Título exibido no card */
    title: string
    /** Link do material (vídeos do YouTube ganham uma preview) */
    url: string
    /** Texto opcional explicando por que vale a pena consultar */
    description?: string
}

/**
 * Chaves das páginas que aceitam referências.
 *
 * - "overview": Visão Geral
 * - demais: o nome do campo do projeto usado em cada página de planejamento
 *   (problemSolution, targetAudience, competition, swot, businessModel,
 *   financials, risks, userAcquisition, marketing, roadmap, team,
 *   infrastructure)
 */
export type ReferencePageKey =
    | "overview"
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

/**
 * Para adicionar uma referência, inclua um item na lista da página desejada.
 * Páginas sem referências simplesmente não exibem a seção.
 *
 * Exemplo:
 *   competition: [
 *       {
 *           title: "Como analisar concorrentes",
 *           url: "https://www.youtube.com/watch?v=XXXXXXXXXXX",
 *           description: "Passo a passo para mapear concorrentes diretos.",
 *       },
 *   ],
 */
export const PAGE_REFERENCES: Partial<Record<ReferencePageKey, Reference[]>> = {
    overview: [
        {
            title: "O Guia OBRIGATÓRIO Para Iniciar um SaaS em 2026 (E não FALIR em 3 MESES)",
            url: "https://www.youtube.com/watch?v=9JwCjBjOR2I",
            description: "O Novo Programador",
        },
    ],
}

export function getReferences(pageKey: string): Reference[] {
    return PAGE_REFERENCES[pageKey as ReferencePageKey] ?? []
}

const YOUTUBE_ID_PATTERN = /^[\w-]{11}$/

export function getYouTubeId(url: string): string | null {
    try {
        const parsed = new URL(url)
        const host = parsed.hostname.replace(/^(www|m)\./, "")

        let id: string | null = null

        if (host === "youtu.be") {
            id = parsed.pathname.slice(1).split("/")[0]
        } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
            const [, kind, value] = parsed.pathname.split("/")
            id =
                kind === "watch"
                    ? parsed.searchParams.get("v")
                    : ["embed", "shorts", "live", "v"].includes(kind)
                      ? value
                      : null
        }

        return id && YOUTUBE_ID_PATTERN.test(id) ? id : null
    } catch {
        return null
    }
}

export function getYouTubeThumbnail(id: string): string {
    return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
}

export function getYouTubeEmbedUrl(id: string): string {
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`
}

export function getHostname(url: string): string {
    try {
        return new URL(url).hostname.replace(/^www\./, "")
    } catch {
        return url
    }
}
