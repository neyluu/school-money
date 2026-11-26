import * as React from "react";
import { Navigate, Outlet } from "react-router";
import {
  getCurrentUser,
  loadCurrentUser,
  subscribeCurrentUser,
} from "@/lib/current-user";

function RequireAdmin() {
  const user = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser);

  React.useEffect(() => {
    void loadCurrentUser();
  }, []);

  if (user == null) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export { RequireAdmin };
