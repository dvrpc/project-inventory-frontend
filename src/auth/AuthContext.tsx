// src/auth/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

interface AuthContextValue {
  isAuthenticated: boolean;
  setToken: (token: string, expiry: number) => void;
  clearToken: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_EXPIRED_EVENT = 'authExpired';

function getStoredExpiry(): number {
  return Number(localStorage.getItem('access_token_expiry') ?? 0);
}

function hasValidToken(): boolean {
  const token = localStorage.getItem('access_token');
  const expiry = getStoredExpiry();
  return Boolean(token && expiry && Date.now() < expiry);
}

function notifyAuthExpired() {
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(hasValidToken());
  const expiryTimeout = useRef<number | null>(null);

  function clearExistingExpiryTimeout() {
    if (expiryTimeout.current !== null) {
      window.clearTimeout(expiryTimeout.current);
      expiryTimeout.current = null;
    }
  }

  function clearToken() {
    clearExistingExpiryTimeout();
    localStorage.removeItem('access_token');
    localStorage.removeItem('access_token_expiry');
    setIsAuthenticated(false);
  }

  function setToken(token: string, expiry: number) {
    localStorage.setItem('access_token', token);
    localStorage.setItem('access_token_expiry', String(expiry));
    setIsAuthenticated(true);
  }

  useEffect(() => {
    function handleAuthExpired() {
      clearToken();
    }

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, []);

  useEffect(() => {
    clearExistingExpiryTimeout();

    if (!isAuthenticated) return;

    const expiry = getStoredExpiry();
    const timeUntilExpiry = expiry - Date.now();

    if (timeUntilExpiry <= 0) {
      notifyAuthExpired();
      return;
    }

    expiryTimeout.current = window.setTimeout(() => {
      notifyAuthExpired();
    }, timeUntilExpiry);

    return clearExistingExpiryTimeout;
  }, [isAuthenticated]);

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
