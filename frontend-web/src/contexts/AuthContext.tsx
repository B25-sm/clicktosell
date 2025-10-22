'use client';

import React, { createContext, useContext } from 'react';

type User = {
  id?: string;
  firstName?: string;
  profilePicture?: { url?: string };
} | null;

type AuthContextValue = {
  user: User;
  isAuthenticated: boolean;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAuthenticated: false,
  logout: () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <AuthContext.Provider value={{ user: null, isAuthenticated: false, logout: () => {} }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}


