import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./contexts/AuthContext";
import { RequireAuth } from "./components/RequireAuth";
import { ThemeProvider } from "./contexts/ThemeContext";

// Eagerly load the landing page (above-the-fold) to keep first paint fast,
// lazy-load every other route to slash the initial JS bundle.
import Index from "./pages/Index.tsx";
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Chat = lazy(() => import("./pages/Chat.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Auth = lazy(() => import("./pages/Auth.tsx"));
const Profile = lazy(() => import("./pages/Profile.tsx"));
const Settings = lazy(() => import("./pages/Settings.tsx"));
const StudyCalendar = lazy(() => import("./pages/Calendar.tsx"));
const Syllabus = lazy(() => import("./pages/Syllabus.tsx"));
const InterLinkage = lazy(() => import("./pages/InterLinkage.tsx"));
const SurvivalPlanner = lazy(() => import("./pages/SurvivalPlanner.tsx"));
const Notes = lazy(() => import("./pages/Notes.tsx"));
const Music = lazy(() => import("./pages/Music.tsx"));
const Quiz = lazy(() => import("./pages/Quiz.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AIToolsHub = lazy(() => import("./pages/AIToolsHub.tsx"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">
    Loading…
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/chat" element={<RequireAuth><Chat /></RequireAuth>} />
        <Route path="/calendar" element={<RequireAuth><StudyCalendar /></RequireAuth>} />
        <Route path="/notes" element={<RequireAuth><Notes /></RequireAuth>} />
        <Route path="/syllabus" element={<RequireAuth><Syllabus /></RequireAuth>} />
        <Route path="/inter-linkage" element={<RequireAuth><InterLinkage /></RequireAuth>} />
        <Route path="/survival-planner" element={<RequireAuth><SurvivalPlanner /></RequireAuth>} />
        <Route path="/music" element={<RequireAuth><Music /></RequireAuth>} />
        <Route path="/quiz" element={<RequireAuth><Quiz /></RequireAuth>} />
        <Route path="/ai-tools" element={<RequireAuth><AIToolsHub /></RequireAuth>} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AnimatedRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
