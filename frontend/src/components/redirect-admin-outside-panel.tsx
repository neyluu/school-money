import * as React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import {
  getCurrentUser,
  loadCurrentUser,
  subscribeCurrentUser,
} from "@/lib/current-user";

const ADMIN_HOME = "/dashboard/admin";
const ALLOWED_FOR_ADMIN = ["/dashboard/chat", ADMIN_HOME];

function isAllowedForAdmin(pathname: string): boolean {
  return ALLOWED_FOR_ADMIN.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function RedirectAdminOutsidePanel() {
  const user = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser);
  const { pathname } = useLocation();

  React.useEffect(() => {
    void loadCurrentUser();
  }, []);

  if (user == null) {
    return null;
  }

  if (user.role === "ADMIN" && !isAllowedForAdmin(pathname)) {
    return <Navigate to={ADMIN_HOME} replace />;
  }

  return <Outlet />;
}

export { RedirectAdminOutsidePanel };
