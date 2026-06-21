import { create } from "zustand";
import * as storage from "./storage";
import type { User } from "./types";

const TOKEN_KEY = "movnly-token";
const USER_KEY = "movnly-user";

interface AuthState {
  user: User | null;
  token: string | null;
  hydrated: boolean;
  setAuth: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  hydrated: false,

  setAuth: async (user, token) => {
    await storage.setItem(TOKEN_KEY, token);
    await storage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, token });
  },

  logout: async () => {
    await storage.removeItem(TOKEN_KEY);
    await storage.removeItem(USER_KEY);
    set({ user: null, token: null });
  },

  hydrate: async () => {
    const token = await storage.getItem(TOKEN_KEY);
    const userRaw = await storage.getItem(USER_KEY);
    const user = userRaw ? (JSON.parse(userRaw) as User) : null;
    set({ token, user, hydrated: true });
  },
}));

export function getRoleHome(role: string): string {
  const routes: Record<string, string> = {
    PASSENGER: "/(passenger)",
    DRIVER: "/(driver)",
    PARTNER: "/(partner)",
    ADMIN: "/(admin)",
    MANAGER: "/(admin)",
    OPERATOR: "/(admin)",
    ACCOUNTANT: "/(admin)",
  };
  return routes[role] || "/(public)";
}
