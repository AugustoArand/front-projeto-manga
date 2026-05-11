import {
  createContext, useContext, useState,
  useCallback, useEffect, ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, registerUser, loginAppUser, logoutUser, getMe } from "@/services/api";

export interface AppUser {
  id: number;
  name: string;
  username: string;
  email: string;
  vip: boolean;
  level: number;
  xp: number;
  xp_needed: number;
  avatar_color: string;
  initials: string;
  member_since: number;
}

interface UserAuthState {
  user: AppUser | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
}

interface UserAuthContextType extends UserAuthState {
  register: (name: string, username: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const TOKEN_KEY = "@mangaverse:token";

const UserAuthContext = createContext<UserAuthContextType | null>(null);

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserAuthState>({
    user: null, token: null, isLoggedIn: false, isLoading: true,
  });

  // Restore session on app start
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(TOKEN_KEY);
        if (stored) {
          api.defaults.headers.common["X-User-Token"] = stored;
          const data = await getMe();
          setState({ user: data.user, token: stored, isLoggedIn: true, isLoading: false });
        } else {
          setState(s => ({ ...s, isLoading: false }));
        }
      } catch {
        await AsyncStorage.removeItem(TOKEN_KEY);
        setState(s => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  const persistToken = useCallback(async (token: string, user: AppUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common["X-User-Token"] = token;
    setState({ user, token, isLoggedIn: true, isLoading: false });
  }, []);

  const register = useCallback(async (
    name: string, username: string, email: string,
    password: string, passwordConfirmation: string,
  ) => {
    const data = await registerUser({ name, username, email, password, password_confirmation: passwordConfirmation });
    await persistToken(data.token, data.user);
  }, [persistToken]);

  const login = useCallback(async (identifier: string, password: string) => {
    const data = await loginAppUser(identifier, password);
    await persistToken(data.token, data.user);
  }, [persistToken]);

  const logout = useCallback(async () => {
    try { await logoutUser(); } catch { /* ignore */ }
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common["X-User-Token"];
    setState({ user: null, token: null, isLoggedIn: false, isLoading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!state.token) return;
    const data = await getMe();
    setState(s => ({ ...s, user: data.user }));
  }, [state.token]);

  return (
    <UserAuthContext.Provider value={{ ...state, register, login, logout, refreshUser }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be inside UserAuthProvider");
  return ctx;
}
