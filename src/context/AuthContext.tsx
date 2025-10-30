// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// Interface for the user object, decoded from the token
interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
}

// Interface for the decoded JWT payload
interface DecodedToken {
  sub: User;
  exp: number;
}

// COMPLETE interface for the context's value
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decodedToken.sub);
        } else {
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      localStorage.removeItem('authToken');
      console.error("Failed to process token on initial load:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken: DecodedToken = jwtDecode(newToken);
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(decodedToken.sub);
    } catch (error) {
      console.error("Failed to process token on login:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;

  const value: AuthContextType = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading,
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><p>Loading application...</p></div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
