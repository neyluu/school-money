import * as React from "react";
import type { AuthUser } from "@/lib/auth";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

export const AuthContext = React.createContext<AuthContextValue | null>(null);
