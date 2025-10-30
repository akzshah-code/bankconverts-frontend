// src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // A reliable library to decode JWTs

// Interface for the user object, decoded from the token
interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  // Add any other fields that your JWT 'sub' claim contains
}

// Interface for the decoded JWT payload
interface DecodedToken {
  sub: User;
  exp: number;
}

// Interface for the context's value
interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean; // Add a loading state for initialization
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Start as true

  // --- THIS IS THE CRITICAL FIX ---
  // On initial component mount, try to load the token from localStorage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        const decodedToken: DecodedToken = jwtDecode(storedToken);
        
        // Check if the token is expired
        if (decodedToken.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser(decodedToken.sub);
        } else {
          // Token is expired, remove it
          localStorage.removeItem('authToken');
        }
      }
    } catch (error) {
      // If decoding fails, the token is invalid. Ensure it's cleared.
      localStorage.removeItem('authToken');
      console.error("Failed to decode token on initial load:", error);
    } finally {
      setIsLoading(false); // Finished loading, set to false
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedToken: DecodedToken = jwtDecode(newToken);
      localStorage.setItem('authToken', newToken); // Save to localStorage
      setToken(newToken);
      setUser(decodedToken.sub);
    } catch (error) {
      console.error("Failed to decode token on login:", error);
      // Ensure we don't set a bad token
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken'); // Remove from localStorage
    setToken(null);
    setUser(null);
  };

  // Determine authentication status based on the presence of a valid token
  const isAuthenticated = !!token;

  const value = {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    isLoading
  };
  
  // Render a loading screen while checking for the token to prevent UI flicker
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
