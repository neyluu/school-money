import { Navigate, Outlet } from "react-router"
import { isAuthenticated } from "@/lib/auth-store"

function RequireAuth() {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

export { RequireAuth }
