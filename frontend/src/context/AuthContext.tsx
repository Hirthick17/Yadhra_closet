// src/context/AuthContext.tsx
// Global auth state — login, register, logout, session restore on page refresh.
// WHY context: every component (header, cart, admin guard) needs to know who's logged in.

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { apiFetch, setAccessToken } from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

interface AuthResponse {
  success: boolean;
  accessToken: string;
  user: AuthUser;
}

interface AuthContextValue {
  user:     AuthUser | null;
  loading:  boolean;       // true while checking if cookie session is still valid
  login:    (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout:   () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true); // Start true — checking cookie

  // ── Restore session on every page load ────────────────────────────────
  // WHY: The access token lives in memory — lost on page refresh.
  // The refresh-token cookie persists. On mount, call /auth/refresh
  // to silently get a new access token without making user re-login.
  useEffect(() => {
    const restore = async () => {
      try {
        const data = await apiFetch<AuthResponse>('/auth/refresh', { method: 'POST' });
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        // No valid cookie — user not logged in. That's fine.
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  // ── Listen for session expiry events from apiFetch ────────────────────
  useEffect(() => {
    const handle = () => { setUser(null); setAccessToken(null); };
    window.addEventListener('auth:expired', handle);
    return () => window.removeEventListener('auth:expired', handle);
  }, []);

  // ── Login ─────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  // ── Register ──────────────────────────────────────────────────────────
  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook — throws if used outside AuthProvider ────────────────────────────
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
