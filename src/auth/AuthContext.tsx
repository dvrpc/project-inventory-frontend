// src/auth/AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  setToken: (token: string, expiry: number) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const token = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('access_token_expiry');
    return !!(token && expiry && Date.now() < parseInt(expiry));
  });

  function setToken(token: string, expiry: number) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('access_token_expiry', String(expiry));
    setIsAuthenticated(true);
  }

  function clearToken() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expiry');
    setIsAuthenticated(false);
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setToken, clearToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
