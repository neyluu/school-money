import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/use-auth";

function GuestOnly() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export { GuestOnly };
