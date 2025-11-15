// src/context/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

interface User {
  id: number;
  email: string;
  role?: 'user' | 'admin';
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: 'user' | 'admin' | null;
  nextUrl: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; nextUrl?: string; message?: string }>;
  logout: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const apiUrl = import.meta.env.VITE_API_URL || 'https://api.bankconverts.com';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'user' | 'admin' | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.logged_in && data.user) {
          setIsAuthenticated(true);
          setUser({
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
          });
          setRole(data.user.role === 'admin' ? 'admin' : 'user');
          setNextUrl(data.next_url || (data.user.role === 'admin' ? '/admin' : '/dashboard'));
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setRole(null);
          setNextUrl(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setRole(null);
        setNextUrl(null);
      }
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setNextUrl(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ ok: boolean; nextUrl?: string; message?: string }> => {
    try {
      const response = await fetch(`${apiUrl}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { ok: false, message: data.message || 'Login failed.' };
      }

      // Backend returns { message, role, next_url }
      await refreshStatus();

      const urlFromApi = data.next_url || (data.role === 'admin' ? '/admin' : '/dashboard');
      setNextUrl(urlFromApi);

      return { ok: true, nextUrl: urlFromApi, message: data.message };
    } catch (error) {
      return { ok: false, message: 'An error occurred during login. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setRole(null);
      setNextUrl(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        role,
        nextUrl,
        isLoading,
        login,
        logout,
        refreshStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
