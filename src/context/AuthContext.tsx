import { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRoles: string[];
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
    if (token) {
      setIsAuthenticated(true);
      // Here you might want to decode the token to get user roles
    }
    setIsLoading(false);
  }, [token]);

    const login = (token: string) => {
    localStorage.setItem('authToken', token);
    setToken(token);
    setIsAuthenticated(true);
  };

    const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setIsAuthenticated(false);
    setUserRoles([]);
  };

  return (
        <AuthContext.Provider value={{ isAuthenticated, userRoles, login, logout, isLoading, token }}>
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
