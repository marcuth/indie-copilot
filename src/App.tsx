import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import {
    TargetAudiencePage,
    CompetitionPage,
    BusinessModelPage,
    UserAcquisitionPage,
    MarketingPage,
    RoadmapPage,
    TeamPage,
    InfrastructurePage,
    FinancialsPage,
    RisksPage,
    SwotAnalysisPage,
} from "./components/project/planning-pages"
import { ProblemSolutionPage } from "./components/project/problem-solution/problem-solution-page"
import { OverviewPage } from "./components/project/overview/overview-page"
import { ActiveProjectProvider } from "./contexts/active-project-context"
import { SidebarProvider, SidebarInset } from "./components/ui/sidebar"
import { AiSettingsProvider } from "./contexts/ai-settings-context"
import { SettingsPage } from "./components/settings/settings-page"
import { NotesPage } from "./components/project/notes/notes-page"
import { WelcomePage } from "./components/layout/welcome-page"
import { AppSidebar } from "./components/layout/app-sidebar"
import { TooltipProvider } from "./components/ui/tooltip"
import { ThemeProvider } from "./contexts/theme-context"
import "./App.css"

function App() {
    return (
        <ThemeProvider>
            <AiSettingsProvider>
                <ActiveProjectProvider>
                    <TooltipProvider>
                        <BrowserRouter>
                            <SidebarProvider>
                                <AppSidebar />
                                <SidebarInset className="min-h-screen overflow-hidden">
                                    <Routes>
                                        <Route
                                            path="/"
                                            element={<WelcomePage />}
                                        />
                                        <Route
                                            path="/project/:projectId/overview"
                                            element={<OverviewPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/problem-solution"
                                            element={<ProblemSolutionPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/target-audience"
                                            element={<TargetAudiencePage />}
                                        />
                                        <Route
                                            path="/project/:projectId/competition"
                                            element={<CompetitionPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/business-model"
                                            element={<BusinessModelPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/user-acquisition"
                                            element={<UserAcquisitionPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/marketing"
                                            element={<MarketingPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/roadmap"
                                            element={<RoadmapPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/team"
                                            element={<TeamPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/infrastructure"
                                            element={<InfrastructurePage />}
                                        />
                                        <Route
                                            path="/project/:projectId/financials"
                                            element={<FinancialsPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/risks"
                                            element={<RisksPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/swot-analysis"
                                            element={<SwotAnalysisPage />}
                                        />
                                        <Route
                                            path="/project/:projectId/notes"
                                            element={<NotesPage />}
                                        />
                                        <Route
                                            path="/settings"
                                            element={<SettingsPage />}
                                        />
                                        <Route
                                            path="*"
                                            element={
                                                <Navigate to="/" replace />
                                            }
                                        />
                                    </Routes>
                                </SidebarInset>
                            </SidebarProvider>
                        </BrowserRouter>
                    </TooltipProvider>
                </ActiveProjectProvider>
            </AiSettingsProvider>
        </ThemeProvider>
    )
}

export default App
