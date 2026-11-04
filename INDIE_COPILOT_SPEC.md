# 🚀 Indie Copilot: Especificação Técnica e Arquitetura

> **Documento de Engenharia e Transição Arquitetural**  
> **De:** _Indie Planner v2 (Web SaaS / Next.js + NestJS + PostgreSQL + Supabase)_  
> **Para:** _Indie Copilot (Desktop Local-First + Open Source + SQLite + Multi-LLM OpenAI-Compatible)_  
> **Data:** 2026-10-13  
> **Versão:** 1.0.0

---

## 1. Visão Geral e Contexto Executivo

### 1.1 O que é o Indie Planner v2 hoje?

O **Indie Planner v2** foi concebido como uma plataforma SaaS voltada para criadores independentes (_Indie Hackers_, fundadores bootstrap e solopreneurs) para planejar, estruturar, validar e gerenciar produtos digitais de ponta a ponta.

A aplicação divide o processo de criação de uma startup em módulos estruturados:

1. **Visão Geral e Identidade**: Nome, slogan, categoria, website, logotipo e estágio de maturidade (ideia vs. produto existente).
2. **Problema e Solução**: Definição da dor, solução proposta, para quem ela é relevante, proposta de valor única (UVP), vantagens competitivas e benefícios essenciais.
3. **Mercado e Concorrência**: Mapeamento de concorrentes diretos (produtos, preços, features), concorrentes indiretos, tamanho de mercado (TAM/SAM/SOM) e vantagens frente ao mercado.
4. **Público-Alvo e Persona**: Demografia (faixa etária, gênero, localização, renda, profissão), hábitos de navegação, dores agudas (_pain points_) e descrição qualitativa da persona.
5. **Aquisição de Usuários**: Estratégia de validação (Landing Page, Entrevistas, MVP simples, etc.) e canais de tração (SEO, Ads, Cold Outreach, Comunidades, etc.).
6. **Modelo de Negócio**: Catálogo de produtos/planos, precificação, moedas, lista de funcionalidades e escopo de MVP (_includedInMvp_).
7. **Marketing e Lançamento**: Estratégias de conteúdo, mídias sociais, branding e plano de lançamento.
8. **Roadmap & Equipe**: Milestones cronológicos com timeframes e alocação de equipe/mentores com disponibilidades e skills.
9. **Infraestrutura**: Hosting, integrações (pagamentos, emails, auth) e ferramental de apoio.
10. **Finanças, Riscos e SWOT**: Projeção de custos, análise multidimensional de riscos (técnico, mercado, time) com mitigação e matriz SWOT completa.
11. **Notas e Documentos**: Bloco de anotações categorizado por tópicos.
12. **Relatório Executivo (Exportação PDF)**: Geração de dossiê profissional com todo o planejamento compilado.

### 1.2 Por que transformar em "Indie Copilot" (Desktop & Open Source)?

O modelo SaaS tradicional impõe fricções para muitos desenvolvedores e criadores indie:

- **Privacidade e Segredo Comercial**: Ideias de novos produtos e segredos de negócio não devem obrigatoriamente trafegar por servidores de terceiros.
- **Custos Recorrentes de Nuvem**: Manter servidores NestJS, banco PostgreSQL gerenciado (Supabase), instâncias de Redis e workers de Puppeteer gera custos fixos desnecessários para quem quer apenas trabalhar nos seus próprios projetos.
- **Vendor Lock-in de IA**: Usuários querem liberdade para usar seus próprios modelos locais (Ollama, LM Studio) com custo zero e 100% offline, ou suas próprias chaves de API (OpenAI, DeepSeek, Groq, OpenRouter, Anthropic) pagando apenas o consumo direto por token.
- **Latência Zero e Operação Offline**: Uma aplicação desktop local-first abre instantaneamente, não sofre com quedas de conexão e guarda tudo localmente em formato universal (SQLite + exportação JSON/Markdown).

---

## 2. Diagnóstico da Arquitetura Atual (Indie Planner v2)

### 2.1 Stack Atual

```
┌────────────────────────────────────────────────────────────────────────┐
│                          INDIE PLANNER V2                              │
├────────────────────────────────┬───────────────────────────────────────┤
│ Frontend Web                   │ Backend Web API                       │
│ - Next.js 15 (App Router)      │ - NestJS                              │
│ - React 19                     │ - Prisma ORM                          │
│ - Tailwind CSS v3/v4           │ - PostgreSQL (Supabase)               │
│ - Shadcn UI / Radix            │ - Redis (Cache / Keyv)                │
│ - NextAuth v4 (JWT / Sessions) │ - Multer + Sharp (Processamento Logos)│
│ - Axios / React Query          │ - Puppeteer-Core + Chromium (PDF)     │
│ - Lucide Icons                 │ - Stripe (Billing & Webhooks)         │
└────────────────────────────────┴───────────────────────────────────────┘
```

### 2.2 Estrutura do Esquema de Dados Atual (`schema.prisma`)

O banco PostgreSQL atual armazena as seções de planejamento de cada projeto predominantemente em colunas do tipo `Json?` na tabela `Project`:

```prisma
model Project {
  id              String          @id @default(uuid())
  name            String
  description     String?
  website         String?
  alreadyExists   Boolean         @default(false)
  slogan          String?
  ownerId         String
  categoryId      String

  // Seções de Planejamento armazenadas como JSON:
  problemSolution Json?           @map("problem_solution")
  targetAudience  Json?           @map("target_audience")
  businessModel   Json?           @map("business_model")
  userAcquisition Json?           @map("user_acquisition")
  marketing       Json?
  competition     Json?
  team            Json?
  roadmap         Json?
  infrastructure  Json?
  risks           Json?
  swot            Json?
  financials      Json?

  notes           ProjectNote[]
  chat            Chat?
}
```

### 2.3 Pontos que deixam de existir na versão Desktop (Indie Copilot)

Para tornar o projeto **100% desktop, local e open source**, removemos toda a complexidade operacional de SaaS multi-inquilino:

- ❌ **Stripe / Subscrições / Planos**: Não há cobrança, tiers nem limites de planos (`PlanLimitGuard`).
- ❌ **Autenticação Multi-usuário / NextAuth**: A aplicação é do usuário no computador dele. Não há necessidade de login remoto, login social ou JWT guards.
- ❌ **Supabase Storage para Logos**: Imagens/logos são armazenadas localmente no disco (pasta de dados do app) ou codificadas em Base64 / caminhos relativos locais.
- ❌ **Redis para Cache Remoto**: Substituído por estado de memória local ou cache do SQLite.
- ❌ **Puppeteer Headless no Servidor**: A exportação para PDF pode ser feita via print nativo do Webview (`window.print()` / API nativa da janela desktop) ou renderização PDF leve via biblioteca client-side (como `@react-pdf/renderer` ou `jspdf`/`html2pdf`).

---

## 3. Especificação do Novo Projeto: "Indie Copilot"

```
┌────────────────────────────────────────────────────────────────────────┐
│                             INDIE COPILOT                              │
│                     (Desktop • Local-First • Open Source)              │
├────────────────────────────────────────────────────────────────────────┤
│                          INTERFACE (DESKTOP)                           │
│              React 19 + Vite 7 + Tailwind CSS + Shadcn UI              │
│                (Empacotado via Tauri v2 ou Electron)                   │
├────────────────────────────────────────────────────────────────────────┤
│                    CORE DE INTELIGÊNCIA LOCAL-FIRST                    │
│  ┌───────────────────────┐ ┌───────────────────────┐ ┌───────────────┐ │
│  │ Context Injector      │ │ OpenAI API Connector  │ │ Tool Calling  │ │
│  │ (RAG sobre o Projeto) │ │ (OpenAI/Ollama/Groq)  │ │ (Auto-Fill)   │ │
│  └───────────────────────┘ └───────────────────────┘ └───────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│                        PERSISTÊNCIA LOCAL (SQLITE)                     │
│               SQLite Embutido via Prisma Client / Drizzle              │
│                 Storage Local: ~/.indie-copilot/data.db                │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Pilares do Produto

1. **Soberania Total dos Dados**: Todos os projetos, anotações, análises financeiras e prompts ficam gravados em um único arquivo SQLite local (`indie-copilot.db`).
2. **Agnóstico a Provedores de IA (OpenAI-Compatible)**: O usuário configura uma URL base (Base URL) e uma Chave de API (API Key), funcionando de imediato com:
    - **Local / Offline**: Ollama (`http://localhost:11434/v1`), LM Studio (`http://localhost:1234/v1`), vLLM, Jan.
    - **Nuvem / Modelos Proprietários**: OpenAI, DeepSeek, Groq, OpenRouter, Mistral, Together AI, Perplexity.
3. **Copilot Integrado ao Contexto (Não é um Chat Isolado)**:
    - O chat tem acesso em tempo real a todas as abas do projeto ativo.
    - O usuário pode pedir: _"Analise minha seção de Concorrentes e preencha a Matriz SWOT com as ameaças mais plausíveis"_.
    - A IA pode responder em texto e oferecer botões de **"Aplicar sugestão diretamente na aba SWOT"**.
4. **Instalação em Um Clique**: Binários nativos para Windows (`.exe` / `.msi`), macOS (`.dmg` / `.app`) e Linux (`.AppImage` / `.deb`).

---

## 4. Arquitetura Técnica Detalhada

### 4.1 Tecnologias Recomendadas para o Desktop

| Camada                 | Tecnologia Recomendada                                | Justificativa                                                                                                                                                  |
| :--------------------- | :---------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Desktop Shell**      | **Tauri v2** _(alternativa: Electron)_                | Consumo de RAM ínfimo (< 40MB vs > 250MB do Electron), binário leve (< 15MB), excelente suporte nativo a SQLite e segurança para salvar chaves no OS Keychain. |
| **Frontend UI**        | **React 19 + Vite 7 + TypeScript**                    | Build ultrarrápido, compatibilidade total com o design system existente do Indie Planner v2.                                                                   |
| **Estilização**        | **Tailwind CSS + Shadcn UI + Lucide**                 | Reaproveitamento direto de mais de 80% dos componentes e formulários já criados no `ip-frontend-v2`.                                                           |
| **Banco de Dados**     | **SQLite**                                            | Arquivo único, transacional, portátil, backup trivial (copiar o arquivo).                                                                                      |
| **ORM / Query Engine** | **Prisma ORM (com driver sqlite)** ou **Drizzle ORM** | Prisma permite migrar o schema do v2 com mínimas alterações; Drizzle é extremamente leve para desktop.                                                         |
| **Cliente de IA**      | **OpenAI SDK Oficial (`openai`)**                     | Compatível com streaming SSE nativo e com qualquer servidor que implemente o endpoint `/v1/chat/completions`.                                                  |
| **Validação**          | **Zod**                                               | Validação de schemas e parsing seguro de retornos estruturados das IAs.                                                                                        |

---

## 5. Modelagem do Banco de Dados SQLite

Abaixo está o esquema equivalente ao do v2, simplificado para contexto desktop local:

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./indie-copilot.db"
}

generator client {
  provider = "prisma-client-js"
}

// Configurações globais do aplicativo desktop
model AppSettings {
  id              String   @id @default("default")
  theme           String   @default("system") // "dark" | "light" | "system"
  activeModelId   String?  // Ex: "gpt-4o", "deepseek-chat", "llama3.3:70b"
  activeProviderId String? // ID do provedor padrão selecionado
  language        String   @default("pt-BR")
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Provedores de IA configuráveis (OpenAI, Ollama, Groq, etc.)
model AiProvider {
  id          String   @id @default(uuid())
  name        String   // Ex: "Ollama Local", "OpenAI Oficial", "DeepSeek"
  baseUrl     String   // Ex: "http://localhost:11434/v1" ou "https://api.openai.com/v1"
  apiKey      String?  // Chave de API (opcional para provedores locais)
  defaultModel String  // Ex: "llama3.2:latest", "gpt-4o-mini"
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// Categorias de projetos (SaaS, E-commerce, Mobile App, etc.)
model ProjectCategory {
  id       String    @id @default(uuid())
  name     String    @unique
  slug     String    @unique
  projects Project[]
}

// Projeto principal do Indie Copilot
model Project {
  id              String          @id @default(uuid())
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  name            String
  description     String?
  website         String?
  slogan          String?
  alreadyExists   Boolean         @default(false)
  logoLocalPath   String?         // Caminho local da imagem do logo no disco

  categoryId      String?
  category        ProjectCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  // Módulos de planejamento (JSON serializado em texto no SQLite)
  problemSolution String?         // JSON: ProblemSolutionData
  targetAudience  String?         // JSON: TargetAudienceData
  businessModel   String?         // JSON: BusinessModelData
  userAcquisition String?         // JSON: UserAcquisitionData
  marketing       String?         // JSON: MarketingData
  competition     String?         // JSON: CompetitionData
  team            String?         // JSON: TeamData
  roadmap         String?         // JSON: RoadmapData
  infrastructure  String?         // JSON: InfrastructureData
  risks           String?         // JSON: RisksData
  swot            String?         // JSON: SwotData
  financials      String?         // JSON: FinancialsData

  notes           ProjectNote[]
  chatSessions    ChatSession[]
}

// Sessões de chat do Copilot (suporte a múltiplos chats por projeto)
model ChatSession {
  id          String        @id @default(uuid())
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  title       String        @default("Nova conversa")
  projectId   String
  project     Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  messages    ChatMessage[]
}

// Mensagens trocadas com o Copilot
model ChatMessage {
  id            String      @id @default(uuid())
  createdAt     DateTime    @default(now())
  role          String      // "user" | "assistant" | "system"
  content       String      // Conteúdo em markdown
  contextUsed   String?     // Snapshot em JSON do contexto do projeto injetado nesta mensagem
  modelUsed     String?     // Ex: "deepseek-reasoner", "gpt-4o"
  sessionId     String
  session       ChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
}

// Anotações rápidas e categorizadas
model ProjectNoteCategory {
  id    String        @id @default(uuid())
  name  String        @unique
  slug  String        @unique
  notes ProjectNote[]
}

model ProjectNote {
  id         String               @id @default(uuid())
  createdAt  DateTime             @default(now())
  updatedAt  DateTime             @updatedAt
  content    String               // Conteúdo em Markdown
  categoryId String?
  category   ProjectNoteCategory? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  projectId  String
  project    Project              @relation(fields: [projectId], references: [id], onDelete: Cascade)
}
```

---

## 6. Mapeamento dos Dados de Cada Seção (Data Contracts)

Para garantir integridade e facilitar a geração/leitura por IA, cada seção possui tipos TypeScript e schemas Zod estritos:

### 6.1 Problema e Solução (`ProblemSolutionData`)

```typescript
interface ProblemSolutionData {
    problem: string // Dor principal observada no mercado
    solution: string // Descrição de como o produto resolve a dor
    problemRelevantTo: string // Segmento mais afetado pela dor
    valueProposition: string // Proposta única de valor (UVP)
    competitiveAdvantages: string[] // Vantagens competitivas do produto
    mainBenefits: string[] // Principais ganhos percebidos pelo cliente
}
```

### 6.2 Mercado e Concorrência (`CompetitionData`)

```typescript
interface CompetitorProduct {
    name: string
    description?: string
    price: number
    currencyCode: string
    features: string[]
}

interface Competitor {
    name: string
    description?: string
    website?: string
    productsOrServices: CompetitorProduct[]
}

interface CompetitionData {
    competitors: Competitor[]
    indirectAlternatives: string // Ex: Planilhas do Excel, processos manuais
    marketSize: string // TAM / SAM / SOM
    advantage: string // Diferencial chave sobre os concorrentes
}
```

### 6.3 Público-Alvo (`TargetAudienceData`)

```typescript
type Gender = "male" | "female" | "all"
type AgeRange =
    "14-17" | "18-24" | "25-34" | "35-44" | "45-54" | "55-64" | "65+" | "all"

interface TargetAudienceData {
    location: string
    ageRange: AgeRange
    gender: Gender
    incomeRange: string
    profession: string
    painPoints: string[] // Dores agudas
    habits: string[] // Onde passam tempo, rotinas
    description?: string // Biografia/resumo da persona
}
```

### 6.4 Modelo de Negócio (`BusinessModelData`)

```typescript
interface ProductOrService {
    name: string
    description?: string
    price: number
    currencyCode: string
    features: string[]
    includedInMvp: boolean // Escopo do MVP
    mvpDescription?: string // O que entra na primeira entrega
}

interface BusinessModelData {
    productsOrServices: ProductOrService[]
}
```

### 6.5 Aquisição de Usuários (`UserAcquisitionData`)

```typescript
type ValidationStrategy =
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

type AcquisitionChannel =
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

interface UserAcquisitionData {
    strategy: string
    validationStrategies: ValidationStrategy[]
    acquisitionChannels: AcquisitionChannel[]
}
```

### 6.6 Marketing (`MarketingData`)

```typescript
interface MarketingData {
    contentStrategy: string // Inbound, SEO, blogs, tutoriais
    socialMediaStrategy: string // Twitter, LinkedIn, etc.
    launchPlan: string // Estratégia do dia do lançamento
    branding: string // Tom de voz, design, percepção
}
```

### 6.7 Roadmap (`RoadmapData`) & Equipe (`TeamData`)

```typescript
interface Milestone {
    name: string
    timeframe: string // Ex: "Q1 2026", "Semana 1-4"
    description?: string
}

interface RoadmapData {
    milestones: Milestone[]
}

interface TeamMember {
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

interface TeamData {
    members: TeamMember[]
}
```

### 6.8 Infraestrutura (`InfrastructureData`)

```typescript
interface InfraItem {
    name: string
    role: string
}

interface InfrastructureData {
    hostingServices: InfraItem[] // Vercel, Fly.io, Cloudflare, etc.
    integrations: InfraItem[] // Stripe, Resend, Supabase, etc.
    generalTools: InfraItem[] // GitHub, Figma, Linear, etc.
}
```

### 6.9 Finanças, Riscos e SWOT (`FinancialsData`, `RisksData`, `SwotData`)

```typescript
interface FinancialsData {
    initialAndProjectedCosts: string // Detalhamento de custos de servidores, ferramentas e burn rate
}

interface RisksData {
    technical: string
    market: string
    team: string
    mitigationStrategies: string
}

interface SwotData {
    strengths: string[] // Forças
    weaknesses: string[] // Fraquezas
    opportunities: string[] // Oportunidades
    threats: string[] // Ameaças
}
```

---

## 7. O Sistema de IA: "Indie Copilot Engine"

### 7.1 Como conectar a qualquer IA compatível com a API da OpenAI

A API de Chat Completions da OpenAI (`POST /v1/chat/completions`) tornou-se o padrão da indústria para modelos de linguagem. O Indie Copilot precisa apenas instanciar o cliente apontando para a base URL do provedor escolhido:

```typescript
import OpenAI from "openai"

export function createAiClient(provider: { baseUrl: string; apiKey?: string }) {
    return new OpenAI({
        baseURL: provider.baseUrl,
        apiKey: provider.apiKey || "dummy-key-for-local-models",
        dangerouslyAllowBrowser: true, // Quando executando no ambiente desktop frontend
    })
}
```

#### Exemplos de Conexão:

- **Ollama Local (Offline)**:  
  `baseURL`: `http://localhost:11434/v1` | `apiKey`: `ollama` | Modelos: `llama3.3:70b`, `deepseek-r1:14b`, `mistral:latest`.
- **LM Studio (Offline)**:  
  `baseURL`: `http://localhost:1234/v1` | `apiKey`: `lm-studio` | Modelos: Qualquer GGUF carregado.
- **OpenAI**:  
  `baseURL`: `https://api.openai.com/v1` | `apiKey`: `sk-...` | Modelos: `gpt-4o`, `gpt-4o-mini`, `o3-mini`.
- **DeepSeek API**:  
  `baseURL`: `https://api.deepseek.com/v1` | `apiKey`: `sk-...` | Modelos: `deepseek-chat`, `deepseek-reasoner`.
- **Groq (Ultrarrápido)**:  
  `baseURL`: `https://api.groq.com/openai/v1` | `apiKey`: `gsk_...` | Modelos: `llama-3.3-70b-versatile`.
- **OpenRouter (Acesso a centenas de modelos)**:  
  `baseURL`: `https://openrouter.ai/api/v1` | `apiKey`: `sk-or-...` | Modelos: Claude 3.5 Sonnet, Gemini 2.0 Flash, etc.

---

### 7.2 Engenharia de Prompt e Injeção de Contexto (Context Injection)

O diferencial do **Indie Copilot** é que a IA **conhece o projeto**. Toda vez que uma mensagem é enviada, o sistema monta um _System Prompt_ dinâmico com o estado atual do projeto:

```typescript
export function buildCopilotSystemPrompt(project: Project): string {
    return `Você é o "Indie Copilot", um co-fundador especialista em startups, estratégia de produtos digitais, modelos de negócios bootstrap, validação lean e engenharia de software para criadores solo (Indie Hackers).

Seu objetivo é ajudar o usuário a planejar, validar, criticar de forma construtiva e acelerar a execução do projeto atual.

--- CONTEXTO COMPLETO DO PROJETO ATUAL ---
Nome: ${project.name}
Slogan: ${project.slogan || "Não informado"}
Descrição: ${project.description || "Não informado"}
Categoria: ${project.category?.name || "Não categorizado"}
Website: ${project.website || "Não informado"}
Já existe no mercado: ${project.alreadyExists ? "Sim" : "Não (em fase de ideação/construção)"}

[PROBLEMA E SOLUÇÃO]
${project.problemSolution ? project.problemSolution : "Ainda não preenchido."}

[PÚBLICO-ALVO]
${project.targetAudience ? project.targetAudience : "Ainda não preenchido."}

[MERCADO E CONCORRÊNCIA]
${project.competition ? project.competition : "Ainda não preenchido."}

[MODELO DE NEGÓCIO]
${project.businessModel ? project.businessModel : "Ainda não preenchido."}

[AQUISIÇÃO DE USUÁRIOS]
${project.userAcquisition ? project.userAcquisition : "Ainda não preenchido."}

[MARKETING]
${project.marketing ? project.marketing : "Ainda não preenchido."}

[ROADMAP]
${project.roadmap ? project.roadmap : "Ainda não preenchido."}

[RISCOS]
${project.risks ? project.risks : "Ainda não preenchido."}

[ANÁLISE SWOT]
${project.swot ? project.swot : "Ainda não preenchido."}

[FINANÇAS]
${project.financials ? project.financials : "Ainda não preenchido."}

--- DIRETRIZES DE RESPOSTA ---
1. Seja pragmático, direto e com mentalidade 'Indie Hacker': valorize validação rápida, foco no MVP, redução de custos e tração orgânica.
2. Seja proativo: se identificar fraquezas graves no modelo ou inconsistência entre público-alvo e preço, aponte imediatamente com delicadeza profissional.
3. Se o usuário pedir para gerar ou revisar uma seção (ex: SWOT, riscos, concorrentes), forneça uma resposta completa e clara. Quando apropriado, apresente o resultado em bloco de código JSON para facilitar a aplicação direta na interface.`
}
```

---

### 7.3 Funcionalidades Específicas do Copilot

O Indie Copilot não se limita a um chat genérico na barra lateral. Ele oferece botões de ação contextuais em cada página do projeto:

1. **"Assistente de Preenchimento" (AI Auto-Fill / Suggest)**:
    - Em qualquer formulário (ex: SWOT ou Riscos), o usuário clica em _“Sugerir com IA”_. O Copilot lê as seções anteriores (Problema, Solução, Concorrência) e pré-preenche o formulário.
2. **"Advogado do Diabo" (Devil's Advocate Review)**:
    - Uma análise crítica e impiedosa gerada pela IA, apontando:
        - Por que esse produto pode falhar?
        - Qual concorrente pode engolir essa proposta de valor?
        - Onde estão os custos ocultos de infraestrutura ou suporte?
3. **"Gerador de Persona e Entrevistas de Validação"**:
    - Criação automática de um roteiro com 5 perguntas abertas para entrevistar clientes em potencial com base nas dores cadastradas.
4. **"Simulador de Precificação e Unit Economics"**:
    - Avaliação do preço em relação aos concorrentes cadastrados e sugestão de planos (Freemium vs. Free Trial vs. Pago Único).
5. **Streaming de Resposta (SSE)**:
    - Respostas geradas token a token com digitação fluida em tempo real e suporte a Markdown com realce de sintaxe e tabelas.

---

## 8. Estrutura de Pastas do Novo Repositório (Indie Copilot)

Uma estrutura monorepo limpa ou aplicação desktop integrada (recomenda-se **Tauri v2 + React**):

```
indie-copilot/
├── src-tauri/                     # Camada Desktop Nativa (Rust / Tauri v2)
│   ├── src/
│   │   ├── main.rs                # Ponto de entrada Tauri
│   │   ├── commands/              # Comandos nativos (armazenamento de API keys, diálogos de arquivo)
│   │   └── database.rs            # Inicialização e migrations do SQLite local
│   ├── Cargo.toml
│   └── tauri.conf.json            # Configurações do app (janela, permissões, ícone)
│
├── prisma/                        # Schema do banco de dados local
│   ├── schema.prisma              # Definição das tabelas SQLite
│   └── migrations/                # Histórico de migrações automáticas
│
├── src/                           # Frontend React 19 + TypeScript
│   ├── assets/                    # Ícones e ilustrações
│   ├── components/                # Componentes da interface
│   │   ├── copilot/               # Módulo do Indie Copilot
│   │   │   ├── copilot-chat.tsx          # Janela de chat / Drawer lateral
│   │   │   ├── copilot-message.tsx       # Renderização de mensagens (Markdown/Code)
│   │   │   ├── copilot-context-badge.tsx # Indicador visual do contexto ativo
│   │   │   └── quick-actions.tsx         # Ações rápidas (Criticar, Sugerir, Expandir)
│   │   ├── layout/                # Sidebar, Header, AppContainer
│   │   │   ├── app-sidebar.tsx
│   │   │   └── project-navigation.tsx
│   │   ├── project/               # Páginas e formulários de cada seção
│   │   │   ├── overview/
│   │   │   ├── problem-solution/
│   │   │   ├── competition/
│   │   │   ├── target-audience/
│   │   │   ├── business-model/
│   │   │   ├── user-acquisition/
│   │   │   ├── marketing/
│   │   │   ├── roadmap/
│   │   │   ├── team/
│   │   │   ├── infrastructure/
│   │   │   ├── financials/
│   │   │   ├── risks/
│   │   │   ├── swot-analysis/
│   │   │   └── notes/
│   │   ├── settings/              # Tela de configuração de modelos e API Keys
│   │   │   ├── ai-providers-settings.tsx
│   │   │   └── backup-export-settings.tsx
│   │   └── ui/                    # Componentes Shadcn UI (Dialog, Button, Input, etc.)
│   │
│   ├── contexts/                  # Contextos globais do React
│   │   ├── active-project-context.tsx  # Projeto selecionado no momento
│   │   ├── ai-settings-context.tsx     # Provedor e modelo selecionado
│   │   └── theme-context.tsx           # Tema escuro/claro
│   │
│   ├── hooks/                     # Custom hooks
│   │   ├── use-copilot-chat.ts    # Hook de controle do chat e streaming OpenAI
│   │   ├── use-projects.ts        # Operações de CRUD de projetos locais
│   │   └── use-pdf-export.ts      # Exportação local de PDF
│   │
│   ├── lib/                       # Bibliotecas e utilitários
│   │   ├── ai/
│   │   │   ├── client-factory.ts  # Instanciação do SDK da OpenAI com BaseURL dinâmica
│   │   │   ├── prompt-builder.ts  # Montagem do prompt com injeção de contexto do projeto
│   │   │   └── tool-definitions.ts# Definições de tools/functions (se suportado pelo modelo)
│   │   ├── db/
│   │   │   ├── database-client.ts # Conexão com SQLite local
│   │   │   └── repositories/      # Funções de busca e gravação
│   │   ├── pdf/
│   │   │   └── generate-report.ts # Geração do relatório do projeto sem depender de servidor
│   │   └── utils.ts
│   │
│   ├── types/                     # Interfaces TypeScript e Schemas Zod
│   ├── App.tsx                    # Roteador e casca da aplicação
│   ├── main.tsx                   # Inicialização React
│   └── index.css                  # Estilos globais Tailwind
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md                      # Documentação para a comunidade Open Source
```

---

## 9. Plano de Ação e Roadmap de Implementação

### Fase 1: Fundação do App Desktop e Banco Local (Semana 1)

- [ ] Inicializar o projeto com **Tauri v2 + React + Vite + TypeScript**.
- [ ] Configurar o **SQLite local** e criar as tabelas com base no `schema.prisma`.
- [ ] Implementar a camada de repositório local (CRUD de Projetos, Categorias e Notas).
- [ ] Migrar o sistema de componentes visuais (`Shadcn UI` + `Tailwind CSS`) do `ip-frontend-v2`.

### Fase 2: Módulos de Planejamento (Semana 2)

- [ ] Reutilizar as 12 páginas de formulários já testadas do `ip-frontend-v2`:
    - Visão Geral, Problema & Solução, Concorrência, Público-Alvo, Modelo de Negócios, Aquisição, Marketing, Roadmap, Equipe, Infraestrutura, Finanças, Riscos e SWOT.
- [ ] Salvar os dados diretamente no SQLite local em tempo real (Auto-save com debounce).
- [ ] Implementar upload/armazenamento local de logos e imagens (salvos em pasta local do app).

### Fase 3: Motor de IA & Indie Copilot (Semana 3)

- [ ] Criar a tela de **Configurações de IA**:
    - Cadastro de provedores (Nome, Base URL, API Key, Modelo padrão).
    - Teste de conexão em tempo real (`Ping / List Models`).
    - Suporte predefinido para Ollama (1-click setup) e OpenAI.
- [ ] Desenvolver o drawer/sidebar do **Indie Copilot Chat**:
    - Integração com streaming via SDK da OpenAI (`stream: true`).
    - Injeção automática do snapshot completo do projeto ativo no `system prompt`.
    - Histórico de conversas persistido no SQLite por projeto.
- [ ] Implementar ações rápidas de IA:
    - _“Preencher com IA”_ nos formulários.
    - _“Revisar com a mentalidade do Advogado do Diabo”_.

### Fase 4: Exportação, Polimento e Lançamento Open Source (Semana 4)

- [ ] Implementar exportação do dossiê do projeto em **PDF local** e **Markdown/JSON**.
- [ ] Funcionalidade de **Backup e Restauração** (Exportar arquivo `.indie` ou `.sqlite`).
- [ ] Pipeline de CI/CD via GitHub Actions para gerar os instaladores multiplataforma (Windows `.exe`, Mac `.dmg`, Linux `.AppImage`).
- [ ] Publicação do repositório no GitHub com documentação completa para contribuidores.

---

## 10. Conclusão

A transformação do **Indie Planner v2** em **Indie Copilot** representa uma evolução natural para atender com perfeição a comunidade de desenvolvedores independentes:

- **Zero custo operacional** para os mantenedores e para o usuário final.
- **100% privado e local**, sem risco de vazamento de planos de negócio.
- **Liberdade total de modelos**, desde LLMs locais rodando via Ollama até os modelos mais avançados de nuvem via API compatível com OpenAI.
- **Aproveitamento quase total da base de código frontend já desenvolvida** no projeto atual, acelerando drasticamente o lançamento da versão open source.
