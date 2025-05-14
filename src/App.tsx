import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Landing Page
import LandingPage from "./pages/LandingPage";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Dashboard
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import VocabularyBuilder from "./pages/dashboard/VocabularyBuilder";
import ParaphraseHelper from "./pages/dashboard/ParaphraseHelper";
import ReadingComprehension from "./pages/dashboard/ReadingComprehension";
import StudyPlan from "./pages/dashboard/StudyPlan";
import Profile from "./pages/dashboard/Profile";
import DashboardNotFound from "./pages/dashboard/NotFound";

// Not Found Page
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="vocabulary" element={<VocabularyBuilder />} />
              <Route path="paraphrase" element={<ParaphraseHelper />} />
              <Route path="reading" element={<ReadingComprehension />} />
              <Route path="study-plan" element={<StudyPlan />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<DashboardNotFound />} />
            </Route>
            
            {/* 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
