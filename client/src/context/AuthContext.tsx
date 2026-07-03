import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import * as authApi from "@/api/auth";
import { ApiRequestError } from "@/api/client";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string, captchaId: string, captchaInput: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi
      .me()
      .then(({ user }) => setUser(user))
      .catch((err) => {
        if (!(err instanceof ApiRequestError && err.status === 401)) {
          console.error("Failed to load session", err);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string, captchaId: string, captchaInput: string) => {
    const { user } = await authApi.login(email, password, captchaId, captchaInput);
    setUser(user);
    return user;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { user } = await authApi.register(name, email, password);
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
