import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { loginUser, refreshToken, setMdexTokens, clearMdexTokens, onMdexTokenChange } from "@/services/api";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    accessToken:  null,
    refreshToken: null,
    isAuthenticated: false,
  });

  // Mantém o estado em sincronia sempre que o token mudar — inclui a
  // renovação silenciosa feita pelo interceptor de api.ts quando um
  // request qualquer recebe 401 (token MangaDex expira a cada 15min).
  useEffect(() => {
    onMdexTokenChange((accessToken, refreshTokenValue) => {
      setState({ accessToken, refreshToken: refreshTokenValue, isAuthenticated: true });
    });
    return () => onMdexTokenChange(null);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginUser(username, password);
    setMdexTokens(data.access_token, data.refresh_token);
  }, []);

  const logout = useCallback(() => {
    setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
    clearMdexTokens();
  }, []);

  // Renovação manual (ex.: chamada explícita de uma tela). O interceptor em
  // services/api.ts já renova automaticamente em qualquer 401, então isso
  // só existe para os casos em que a tela precisa do token atualizado antes
  // de disparar outra chamada.
  const refresh = useCallback(async () => {
    if (!state.refreshToken) return;
    const data = await refreshToken(state.refreshToken);
    setMdexTokens(data.access_token, data.refresh_token);
  }, [state.refreshToken]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
