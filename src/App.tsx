import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BookingProvider } from "./contexts/BookingContext";
import { AuthProvider } from "./contexts/AuthContext";

// Páginas públicas (cliente)
import HomePage from "./pages/client/HomePage";
import ServiceSelectionPage from "./pages/client/ServiceSelectionPage";
import CalendarPage from "./pages/client/CalendarPage";
import ClientFormPage from "./pages/client/ClientFormPage";
import ConfirmationPage from "./pages/client/ConfirmationPage";

// Páginas de administración (manicurista)
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import ServiceSettingsPage from "./pages/admin/ServiceSettingsPage";
import ScheduleSettingsPage from "./pages/admin/ScheduleSettingsPage";
import AppointmentsPage from "./pages/admin/AppointmentsPage";

// Layout y componentes protegidos
import AdminLayout from "./components/layouts/AdminLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <BookingProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />

            <Routes>
              {/* Rutas públicas (cliente) */}
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServiceSelectionPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/client-info" element={<ClientFormPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />

              {/* Ruta de login */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Rutas protegidas (manicurista) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="services" element={<ServiceSettingsPage />} />
                <Route path="schedule" element={<ScheduleSettingsPage />} />
                <Route path="appointments" element={<AppointmentsPage />} />
              </Route>

              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </BookingProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
