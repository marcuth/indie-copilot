import { z } from "zod"

// ─── 1. Problem & Solution ───────────────────────────────────────────────────

export const problemSolutionSchema = z.object({
    problem: z.string().min(1, "Descreva a dor ou problema"),
    solution: z.string().min(1, "Descreva a solução proposta"),
    problemRelevantTo: z.string().min(1, "Informe a quem o problema afeta"),
    valueProposition: z
        .string()
        .min(1, "Informe a proposta única de valor (UVP)"),
    competitiveAdvantages: z.array(z.string()).default([]),
    mainBenefits: z.array(z.string()).default([]),
})

export type ProblemSolutionFormValues = z.infer<typeof problemSolutionSchema>

// ─── 2. Target Audience ──────────────────────────────────────────────────────

export const targetAudienceSchema = z.object({
    location: z.string().min(1, "Informe a localização geográfica ou 'Global'"),
    ageRange: z.enum([
        "14-17",
        "18-24",
        "25-34",
        "35-44",
        "45-54",
        "55-64",
        "65+",
        "all",
    ]),
    gender: z.enum(["male", "female", "all"]),
    incomeRange: z.string().min(1, "Informe a faixa de renda aproximada"),
    profession: z.string().min(1, "Informe o cargo ou nicho profissional"),
    painPoints: z.array(z.string()).default([]),
    habits: z.array(z.string()).default([]),
    description: z.string().optional(),
})

export type TargetAudienceFormValues = z.infer<typeof targetAudienceSchema>

// ─── 3. Competition ──────────────────────────────────────────────────────────

export const competitorProductSchema = z.object({
    name: z.string().min(1, "Nome do produto/plano"),
    description: z.string().optional(),
    price: z.number().default(0),
    currencyCode: z.string().default("BRL"),
    features: z.array(z.string()).default([]),
})

export const competitorSchema = z.object({
    name: z.string().min(1, "Nome do concorrente"),
    description: z.string().optional(),
    website: z.string().optional(),
    productsOrServices: z.array(competitorProductSchema).default([]),
})

export const competitionSchema = z.object({
    competitors: z.array(competitorSchema).default([]),
    indirectAlternatives: z.string().default(""),
    marketSize: z.string().default(""),
    advantage: z.string().default(""),
})

export type CompetitionFormValues = z.infer<typeof competitionSchema>

// ─── 4. Business Model ───────────────────────────────────────────────────────

export const productOrServiceSchema = z.object({
    name: z.string().min(1, "Nome do produto ou plano"),
    description: z.string().optional(),
    price: z.number().default(0),
    currencyCode: z.string().default("BRL"),
    features: z.array(z.string()).default([]),
    includedInMvp: z.boolean().default(true),
    mvpDescription: z.string().optional(),
})

export const businessModelSchema = z.object({
    productsOrServices: z.array(productOrServiceSchema).default([]),
})

export type BusinessModelFormValues = z.infer<typeof businessModelSchema>

// ─── 5. User Acquisition ─────────────────────────────────────────────────────

export const userAcquisitionSchema = z.object({
    strategy: z.string().min(1, "Descreva a estratégia geral de aquisição"),
    validationStrategies: z.array(z.string()).default([]),
    acquisitionChannels: z.array(z.string()).default([]),
})

export type UserAcquisitionFormValues = z.infer<typeof userAcquisitionSchema>

// ─── 6. Marketing ────────────────────────────────────────────────────────────

export const marketingSchema = z.object({
    contentStrategy: z.string().default(""),
    socialMediaStrategy: z.string().default(""),
    launchPlan: z.string().default(""),
    branding: z.string().default(""),
})

export type MarketingFormValues = z.infer<typeof marketingSchema>

// ─── 7. Roadmap ──────────────────────────────────────────────────────────────

export const milestoneSchema = z.object({
    name: z.string().min(1, "Título da entrega ou marco"),
    timeframe: z.string().min(1, "Prazo ou período (ex: Q1 2026, Semana 1-2)"),
    description: z.string().optional(),
})

export const roadmapSchema = z.object({
    milestones: z.array(milestoneSchema).default([]),
})

export type RoadmapFormValues = z.infer<typeof roadmapSchema>

// ─── 8. Team ─────────────────────────────────────────────────────────────────

export const teamMemberSchema = z.object({
    name: z.string().min(1, "Nome do membro ou papel"),
    availability: z.enum([
        "full-time",
        "part-time",
        "limited",
        "weekends-only",
        "advisory",
        "freelancer",
    ]),
    roles: z.array(z.string()).default([]),
    skills: z.array(z.string()).default([]),
    description: z.string().optional(),
})

export const teamSchema = z.object({
    members: z.array(teamMemberSchema).default([]),
})

export type TeamFormValues = z.infer<typeof teamSchema>

// ─── 9. Infrastructure ───────────────────────────────────────────────────────

export const infraItemSchema = z.object({
    name: z.string().min(1, "Nome do serviço ou ferramenta"),
    role: z
        .string()
        .min(1, "Papel (ex: Frontend Hosting, Banco de Dados, Auth)"),
})

export const infrastructureSchema = z.object({
    hostingServices: z.array(infraItemSchema).default([]),
    integrations: z.array(infraItemSchema).default([]),
    generalTools: z.array(infraItemSchema).default([]),
})

export type InfrastructureFormValues = z.infer<typeof infrastructureSchema>

// ─── 10. Financials ──────────────────────────────────────────────────────────

export const financialsSchema = z.object({
    initialAndProjectedCosts: z.string().default(""),
})

export type FinancialsFormValues = z.infer<typeof financialsSchema>

// ─── 11. Risks ───────────────────────────────────────────────────────────────

export const risksSchema = z.object({
    technical: z.string().default(""),
    market: z.string().default(""),
    team: z.string().default(""),
    mitigationStrategies: z.string().default(""),
})

export type RisksFormValues = z.infer<typeof risksSchema>

// ─── 12. SWOT ────────────────────────────────────────────────────────────────

export const swotSchema = z.object({
    strengths: z.array(z.string()).default([]),
    weaknesses: z.array(z.string()).default([]),
    opportunities: z.array(z.string()).default([]),
    threats: z.array(z.string()).default([]),
})

export type SwotFormValues = z.infer<typeof swotSchema>
