import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { TripSessionProvider } from "@/context/TripSessionContext";
import { AuthProvider } from "@/context/AuthContext";
import { PageTransition } from "@/components/PageTransition";
import { Header } from "@/components/Header";
import { LookupPage } from "@/pages/LookupPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { PassengerDashboardPage } from "@/pages/PassengerDashboardPage";
import { StaffDashboardPage } from "@/pages/StaffDashboardPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TripStatusPage } from "@/pages/TripStatusPage";
import { RebookingPage } from "@/pages/RebookingPage";
import { RebookingConfirmationPage } from "@/pages/RebookingConfirmationPage";
import { RefundStatusPage } from "@/pages/RefundStatusPage";
import { SupportTicketPage } from "@/pages/SupportTicketPage";
import { TicketDetailsPage } from "@/pages/TicketDetailsPage";
import { EscalationConfirmationPage } from "@/pages/EscalationConfirmationPage";

function page(element: ReactNode) {
  return <PageTransition>{element}</PageTransition>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={page(<LookupPage />)} />
        <Route path="/login" element={page(<LoginPage />)} />
        <Route path="/register" element={page(<RegisterPage />)} />
        <Route
          path="/dashboard"
          element={page(
            <ProtectedRoute role="passenger">
              <PassengerDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin"
          element={page(
            <ProtectedRoute role="staff">
              <StaffDashboardPage />
            </ProtectedRoute>
          )}
        />
        <Route path="/trip/:id" element={page(<TripStatusPage />)} />
        <Route path="/trip/:id/rebook" element={page(<RebookingPage />)} />
        <Route path="/trip/:id/rebook/confirmation" element={page(<RebookingConfirmationPage />)} />
        <Route path="/trip/:id/refund" element={page(<RefundStatusPage />)} />
        <Route path="/trip/:id/support" element={page(<SupportTicketPage />)} />
        <Route path="/trip/:id/support/:ticketId" element={page(<TicketDetailsPage />)} />
        <Route path="/trip/:id/escalated" element={page(<EscalationConfirmationPage />)} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <AuthProvider>
      <TripSessionProvider>
        <BrowserRouter>
          <Header />
          <AnimatedRoutes />
        </BrowserRouter>
      </TripSessionProvider>
    </AuthProvider>
  );
}

export default App;
