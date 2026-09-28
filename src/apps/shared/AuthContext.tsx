import React, { createContext, useContext, useState, useEffect } from 'react';
import { CustomerUser } from '../../packages/types';

interface AuthContextType {
  user: CustomerUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; user?: CustomerUser; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ti_auth_token') || null;
  });
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const activeToken = token || localStorage.getItem('ti_auth_token');
      const headers: Record<string, string> = {};
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`;
      }
      const res = await fetch('/api/auth/me', { headers });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.warn('Non-JSON response from /api/auth/me:', text);
      }

      if (res.ok && data) {
        setUser(data.user);
        if (!data.user && activeToken) {
          localStorage.removeItem('ti_auth_token');
          setToken(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch auth state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, [token]);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn('Non-JSON response from /api/auth/login:', text);
        return { success: false, error: 'Server temporarily unavailable. Please try again.' };
      }

      if (!res.ok) {
        return { success: false, error: data?.error || 'Authentication failed' };
      }

      setToken(data.token);
      localStorage.setItem('ti_auth_token', data.token);
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      const activeToken = token || localStorage.getItem('ti_auth_token');
      if (activeToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${activeToken}` },
        });
      }
    } catch (e) {
      // Ignore
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('ti_auth_token');
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
