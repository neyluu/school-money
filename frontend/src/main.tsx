import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";

import "./index.css";

import App from "./App";
import { Demo } from "./components/demo";
import { GuestOnly } from "./components/guest-only";
import { RedirectAdminOutsidePanel } from "./components/redirect-admin-outside-panel";
import { RequireAdmin } from "./components/require-admin";
import { RequireAuth } from "./components/require-auth";
import { AuthProvider } from "./contexts/auth-provider";

import { AdminClassesPage } from "./pages/admin-classes-page";
import { AdminDashboardPage } from "./pages/admin-dashboard-page";
import { AdminFundraisingsPage } from "./pages/admin-fundraisings-page";
import { AdminReportsPage } from "./pages/admin-reports-page";
import { AdminTreasurersPage } from "./pages/admin-treasurers-page";
import { AdminUsersPage } from "./pages/admin-users-page";
import { ChatPage } from "./pages/chat-page";
import { ChildrenPage } from "./pages/children-page";
import { ClassDetailsPage } from "./pages/class-details-page";
import { ClassesPage } from "./pages/classes-page";
import { DashboardPage } from "./pages/dashboard-page";
import { FundraisingDetailsPage } from "./pages/fundraising-details-page";
import { FundraisingEditPage } from "./pages/fundraising-edit-page";
import { FundraisingNewPage } from "./pages/fundraising-new-page";
import { FundraisingsPage } from "./pages/fundraisings-page";
import { LoginPage } from "./pages/login-page";
import { PaymentsPage } from "./pages/payments-page";
import { RegisterPage } from "./pages/register-page";
import { ReportsPage } from "./pages/reports-page";
import { SettingsPage } from "./pages/settings-page";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<GuestOnly />}>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route element={<RequireAdmin />}>
              <Route path="/dashboard/admin" element={<AdminDashboardPage />} />
              <Route
                path="/dashboard/admin/users"
                element={<AdminUsersPage />}
              />
              <Route
                path="/dashboard/admin/treasurers"
                element={<AdminTreasurersPage />}
              />
              <Route
                path="/dashboard/admin/fundraisings"
                element={<AdminFundraisingsPage />}
              />
              <Route
                path="/dashboard/admin/reports"
                element={<AdminReportsPage />}
              />
              <Route
                path="/dashboard/admin/classes"
                element={<AdminClassesPage />}
              />
            </Route>

            <Route element={<RedirectAdminOutsidePanel />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/dashboard/payments" element={<PaymentsPage />} />
              <Route path="/dashboard/children" element={<ChildrenPage />} />
              <Route path="/dashboard/class" element={<ClassesPage />} />
              <Route
                path="/dashboard/class/:classId"
                element={<ClassDetailsPage />}
              />
              <Route path="/dashboard/chat" element={<ChatPage />} />
              <Route path="/dashboard/reports" element={<ReportsPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
              <Route
                path="/dashboard/fundraisers"
                element={<FundraisingsPage />}
              />
              <Route
                path="/dashboard/fundraisers/new"
                element={<FundraisingNewPage />}
              />
              <Route
                path="/dashboard/fundraisers/:fundraisingId"
                element={<FundraisingDetailsPage />}
              />
              <Route
                path="/dashboard/fundraisers/:fundraisingId/edit"
                element={<FundraisingEditPage />}
              />
            </Route>
          </Route>

          <Route path="/demo" element={<Demo />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
