// App Content with Auth Check

import React from "react";
import { LoginPage } from "../pages/login/LoginPage";
import { LoadingScreen } from "../shared/ui/LoadingScreen";
import { useAuth } from "./AuthContext";
import { MainContent } from "./MainContent";

export const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="驗證中..." />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainContent />;
};
