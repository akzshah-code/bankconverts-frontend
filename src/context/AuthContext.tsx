// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  exp: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start in a loading state

  useEffect(() => {
    // This effect runs once when the provider mounts
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decodedToken = jwtDecode<DecodedToken>(token);
        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setIsAuthenticated(true);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Invalid token found in localStorage", error);
        localStorage.removeItem('access_token');
        setIsAuthenticated(false);
      }
    }
    // Finished checking, set loading to false
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    localStorage.setItem('access_token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
