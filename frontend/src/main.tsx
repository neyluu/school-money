import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './index.css'
import App from './App.tsx'
import { Demo } from './components/demo.tsx'
import { RequireAuth } from './components/require-auth.tsx'
import { DashboardPage } from './pages/dashboard-page.tsx'
import { LoginPage } from './pages/login-page.tsx'
import { PaymentsPage } from './pages/payments-page.tsx'
import { RegisterPage } from './pages/register-page.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<RequireAuth />}>
          <Route index element={<DashboardPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="/demo" element={<Demo />} />
        <Route path="/" element={<App />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
