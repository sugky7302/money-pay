// Authentication context for managing user authentication state

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { googleSheetsService, storage } from '../shared/lib';

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (token: string, userInfo: UserInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    storage.removeAuthToken();
    storage.removeUserInfo();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  useEffect(() => {
    // Check for existing authentication token on mount
    const checkAuth = () => {
      const token = storage.getAuthToken();
      const savedUserInfo = storage.getUserInfo();
      
      if (token && savedUserInfo) {
        setIsAuthenticated(true);
        setUserInfo(savedUserInfo);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();

    // Set up token expiration callback
    googleSheetsService.onTokenExpired = () => {
      logout();
    };

    return () => {
      googleSheetsService.onTokenExpired = null;
    };
  }, []);

  const login = (token: string, user: UserInfo) => {
    storage.setAuthToken(token);
    storage.setUserInfo(user);
    setIsAuthenticated(true);
    setUserInfo(user);
  };

  const value: AuthContextType = {
    isAuthenticated,
    userInfo,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
