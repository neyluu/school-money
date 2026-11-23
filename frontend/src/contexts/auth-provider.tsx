import * as React from "react";
import { me, logout as authLogout } from "@/lib/auth";
import { getToken } from "@/lib/auth-store";
import { AuthContext } from "./auth-context";
import type { AuthContextValue } from "./auth-context";

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthContextValue["user"]>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const refreshUser = React.useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      return;
    }

    try {
      setUser(await me());
    } catch {
      setUser(null);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        if (!getToken()) return;

        const currentUser = await me();

        if (active) {
          setUser(currentUser);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    initialize().catch(() => {
      if (active) {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    authLogout();
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user != null,
    isLoading,
    refreshUser,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthProvider };
