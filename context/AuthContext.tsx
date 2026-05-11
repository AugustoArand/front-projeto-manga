import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { api, loginUser, refreshToken } from "@/services/api";

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

  const login = useCallback(async (username: string, password: string) => {
    const data = await loginUser(username, password);
    setState({
      accessToken:  data.access_token,
      refreshToken: data.refresh_token,
      isAuthenticated: true,
    });
    // Inject token into all subsequent axios requests
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
  }, []);

  const logout = useCallback(() => {
    setState({ accessToken: null, refreshToken: null, isAuthenticated: false });
    delete api.defaults.headers.common["Authorization"];
  }, []);

  const refresh = useCallback(async () => {
    if (!state.refreshToken) return;
    const data = await refreshToken(state.refreshToken);
    setState(prev => ({ ...prev, accessToken: data.access_token, refreshToken: data.refresh_token }));
    api.defaults.headers.common["Authorization"] = `Bearer ${data.access_token}`;
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
