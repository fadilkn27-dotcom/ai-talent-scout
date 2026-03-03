import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "client" | "worker" | "hr";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const mockUsers: Record<UserRole, User> = {
  client: { id: "c1", name: "Sarah Chen", email: "sarah@techcorp.com", role: "client" },
  worker: { id: "w1", name: "Alex Rivera", email: "alex@dev.com", role: "worker" },
  hr: { id: "h1", name: "Jordan Taylor", email: "jordan@hr.com", role: "hr" },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (_email: string, _password: string, role: UserRole) => {
    await new Promise((r) => setTimeout(r, 800));
    setUser(mockUsers[role]);
  }, []);

  const logout = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
