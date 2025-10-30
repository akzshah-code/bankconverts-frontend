// src/context/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the context data
interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  isLoading: boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start loading until we verify the session

  const apiUrl = import.meta.env.VITE_API_URL;

  // This function checks if a valid session cookie exists
  const checkLoginStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/status`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const login = () => {
    // After a successful login API call, we just update the state.
    // The browser handles the cookie automatically.
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await fetch(`${apiUrl}/api/logout`, { method: 'POST' });
    } finally {
      // Always update state, even if the API call fails
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
