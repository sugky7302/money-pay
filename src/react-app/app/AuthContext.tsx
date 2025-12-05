// Authentication context for managing user authentication state

import React, { createContext, ReactNode, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { googleSheetsService, storage } from '../shared/lib';
import { useConfig } from '../shared/lib/useConfig';

interface UserInfo {
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  login: (token: string, expiresInSeconds: number, userInfo: UserInfo) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { config } = useConfig();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const refreshTimerRef = useRef<number | null>(null);
  const scopes = useMemo(
    () => 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets',
    []
  );

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const scheduleRefresh = (expiresAt: number) => {
    clearRefreshTimer();
    const now = Date.now();
    const refreshInMs = Math.max(expiresAt - now - 60_000, 5_000); // refresh 1 minute early
    refreshTimerRef.current = window.setTimeout(() => {
      void refreshAccessToken();
    }, refreshInMs);
  };

  const refreshAccessToken = async (): Promise<void> => {
    if (!config?.googleClientId) return logout();
    // GIS client refreshes silently if the user still has an active session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const googleGlobal = (window as any).google;
    if (!googleGlobal?.accounts?.oauth2?.initTokenClient) {
      return logout();
    }

    return new Promise((resolve) => {
      const tokenClient = googleGlobal.accounts.oauth2.initTokenClient({
        client_id: config.googleClientId,
        scope: scopes,
        prompt: '', // silent refresh
        callback: (response: any) => {
          if (response?.access_token) {
            const expiresAt = Date.now() + ((response.expires_in || 3600) - 60) * 1000;
            storage.setAuthToken(response.access_token);
            storage.setAuthTokenExpiresAt(expiresAt);
            setIsAuthenticated(true);
            scheduleRefresh(expiresAt);
          } else {
            logout();
          }
          resolve();
        },
      });

      tokenClient.requestAccessToken({ prompt: '' });
    });
  };

  const logout = () => {
    clearRefreshTimer();
    storage.removeAuthToken();
    storage.removeAuthTokenExpiresAt();
    storage.removeUserInfo();
    setIsAuthenticated(false);
    setUserInfo(null);
  };

  useEffect(() => {
    // Check for existing authentication token on mount
    const checkAuth = () => {
      const token = storage.getAuthToken();
      const savedUserInfo = storage.getUserInfo();
      const expiresAt = storage.getAuthTokenExpiresAt();
      
      if (token && savedUserInfo) {
        setIsAuthenticated(true);
        setUserInfo(savedUserInfo);
        if (expiresAt) {
          scheduleRefresh(expiresAt);
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();

    // Set up token expiration callback
    googleSheetsService.onTokenExpired = () => {
      void refreshAccessToken();
    };

    return () => {
      googleSheetsService.onTokenExpired = null;
      clearRefreshTimer();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const login = (token: string, expiresInSeconds: number, user: UserInfo) => {
    const expiresAt = Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000; // pad by 1 minute
    clearRefreshTimer();
    storage.setAuthToken(token);
    storage.setAuthTokenExpiresAt(expiresAt);
    storage.setUserInfo(user);
    setIsAuthenticated(true);
    setUserInfo(user);
    scheduleRefresh(expiresAt);
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
