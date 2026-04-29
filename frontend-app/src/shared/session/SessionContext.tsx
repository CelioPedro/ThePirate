import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, getStoredApiBase, getStoredToken, storeApiBase, storeToken } from "../api/client";
import type { AuthResponse, AuthUser } from "../types";

interface SessionContextValue {
  apiBase: string;
  token: string | null;
  user: AuthUser | null;
  isReady: boolean;
  isLive: boolean;
  isDevFallback: boolean;
  lastError: string | null;
  setApiBase: (value: string) => Promise<void>;
  refreshSession: () => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [apiBase, setApiBaseState] = useState(getStoredApiBase());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  async function refreshSession() {
    try {
      await apiClient.getProducts(apiBase);
      setIsLive(true);
      setLastError(null);
      try {
        const me = await apiClient.getMe(apiBase, token);
        setUser(me);
      } catch {
        setUser(null);
      }
    } catch {
      setUser(null);
      setIsLive(false);
      setLastError(`Nao foi possivel conectar em ${apiBase}`);
    } finally {
      setIsReady(true);
    }
  }

  useEffect(() => {
    void refreshSession();
  }, [apiBase]);

  async function applyAuth(action: Promise<AuthResponse>) {
    const response = await action;
    setToken(response.token);
    setUser(response.user);
    setIsLive(true);
    storeToken(response.token);
  }

  const value = useMemo<SessionContextValue>(() => ({
    apiBase,
    token,
    user,
    isReady,
    isLive,
    isDevFallback: Boolean(user && !token),
    lastError,
    async setApiBase(value) {
      storeApiBase(value);
      setApiBaseState(value);
    },
    refreshSession,
    async login(payload) {
      await applyAuth(apiClient.login(payload, apiBase));
    },
    async register(payload) {
      await applyAuth(apiClient.register(payload, apiBase));
    },
    logout() {
      setToken(null);
      setUser(null);
      storeToken(null);
    }
  }), [apiBase, isLive, isReady, lastError, token, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
