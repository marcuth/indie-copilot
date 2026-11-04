// ─── AI Provider & Settings ─────────────────────────────────────────────────

export interface AiProvider {
    id: string
    name: string
    baseUrl: string
    apiKey?: string
    defaultModel: string
    isDefault: boolean
    createdAt: string
    updatedAt: string
}

export interface AppSettings {
    id: string
    theme: "dark" | "light" | "system"
    activeModelId?: string
    activeProviderId?: string
    language: string
    createdAt: string
    updatedAt: string
}

// ─── Project & Category ───────────────────────────────────────────────────────

export interface ProjectCategory {
    id: string
    name: string
    slug: string
}

export interface Project {
    id: string
    createdAt: string
    updatedAt: string
    name: string
    description?: string
    website?: string
    slogan?: string
    alreadyExists: boolean
    logoLocalPath?: string
    categoryId?: string
    category?: ProjectCategory
    // Módulos de planejamento (JSON serializado)
    problemSolution?: string
    targetAudience?: string
    businessModel?: string
    userAcquisition?: string
    marketing?: string
    competition?: string
    team?: string
    roadmap?: string
    infrastructure?: string
    risks?: string
    swot?: string
    financials?: string
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export interface ChatSession {
    id: string
    createdAt: string
    updatedAt: string
    title: string
    projectId: string
    messages: ChatMessage[]
}

export interface ChatMessage {
    id: string
    createdAt: string
    role: "user" | "assistant" | "system"
    content: string
    contextUsed?: string
    modelUsed?: string
    sessionId: string
}

// ─── Notes ───────────────────────────────────────────────────────────────────

export interface ProjectNoteCategory {
    id: string
    name: string
    slug: string
}

export interface ProjectNote {
    id: string
    createdAt: string
    updatedAt: string
    content: string
    categoryId?: string
    category?: ProjectNoteCategory
    projectId: string
}

// ─── Planning Section Data Contracts ─────────────────────────────────────────

export interface ProblemSolutionData {
    problem: string
    solution: string
    problemRelevantTo: string
    valueProposition: string
    competitiveAdvantages: string[]
    mainBenefits: string[]
}

export interface CompetitorProduct {
    name: string
    description?: string
    price: number
    currencyCode: string
    features: string[]
}

export interface Competitor {
    name: string
    description?: string
    website?: string
    productsOrServices: CompetitorProduct[]
}

export interface CompetitionData {
    competitors: Competitor[]
    indirectAlternatives: string
    marketSize: string
    advantage: string
}

export type Gender = "male" | "female" | "all"
export type AgeRange =
    | "14-17"
    | "18-24"
    | "25-34"
    | "35-44"
    | "45-54"
    | "55-64"
    | "65+"
    | "all"

export interface TargetAudienceData {
    location: string
    ageRange: AgeRange
    gender: Gender
    incomeRange: string
    profession: string
    painPoints: string[]
    habits: string[]
    description?: string
}

export interface ProductOrService {
    name: string
    description?: string
    price: number
    currencyCode: string
    features: string[]
    includedInMvp: boolean
    mvpDescription?: string
}

export interface BusinessModelData {
    productsOrServices: ProductOrService[]
}

export type ValidationStrategy =
    | "landing-page"
    | "cold-email"
    | "whatsapp-group"
    | "market-research"
    | "user-interviews"
    | "simple-mvp"
    | "prototype"
    | "a-b-testing"
    | "online-community"
    | "social-media"

export type AcquisitionChannel =
    | "seo"
    | "google-ads"
    | "meta-ads"
    | "linkedin"
    | "youtube"
    | "tiktok"
    | "twitter-x"
    | "email-marketing"
    | "influencers"
    | "partnerships"
    | "referrals"
    | "events"
    | "communities"
    | "cold-outreach"
    | "content-marketing"
    | "podcast"

export interface UserAcquisitionData {
    strategy: string
    validationStrategies: ValidationStrategy[]
    acquisitionChannels: AcquisitionChannel[]
}

export interface MarketingData {
    contentStrategy: string
    socialMediaStrategy: string
    launchPlan: string
    branding: string
}

export interface Milestone {
    name: string
    timeframe: string
    description?: string
}

export interface RoadmapData {
    milestones: Milestone[]
}

export interface TeamMember {
    name: string
    availability:
        | "full-time"
        | "part-time"
        | "limited"
        | "weekends-only"
        | "advisory"
        | "freelancer"
    roles: string[]
    skills: string[]
    description?: string
}

export interface TeamData {
    members: TeamMember[]
}

export interface InfraItem {
    name: string
    role: string
}

export interface InfrastructureData {
    hostingServices: InfraItem[]
    integrations: InfraItem[]
    generalTools: InfraItem[]
}

export interface FinancialsData {
    initialAndProjectedCosts: string
}

export interface RisksData {
    technical: string
    market: string
    team: string
    mitigationStrategies: string
}

export interface SwotData {
    strengths: string[]
    weaknesses: string[]
    opportunities: string[]
    threats: string[]
}
