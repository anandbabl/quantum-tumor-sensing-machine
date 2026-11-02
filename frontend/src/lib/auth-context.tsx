"use client";

import React, { createContext, useContext, useState } from "react";
import { User } from "@/types";

interface AuthContextType {
  user: User;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string, role?: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEFAULT_OPERATOR: User = {
  id: "system-operator-001",
  email: "operator@quantumtumor.ai",
  full_name: "Dr. Alex Rivera (Lead Clinical Operator)",
  role: "medical_professional",
  is_active: true,
  created_at: "2026-01-01T00:00:00.000Z"
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_OPERATOR,
  token: null,
  isLoading: false,
  login: async () => DEFAULT_OPERATOR,
  register: async () => DEFAULT_OPERATOR,
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user] = useState<User>(DEFAULT_OPERATOR);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        isLoading: false,
        login: async () => DEFAULT_OPERATOR,
        register: async () => DEFAULT_OPERATOR,
        logout: () => {},
        refreshUser: async () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
