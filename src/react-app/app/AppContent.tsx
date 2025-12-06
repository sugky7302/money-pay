/**
 * AppContent.tsx - 應用程式內容與認證檢查組件
 * 
 * 功能說明：
 * 1. 根據認證狀態決定顯示的頁面
 * 2. 顯示載入中畫面（驗證中）
 * 3. 未認證時顯示登入頁面
 * 4. 已認證時顯示主要內容
 */

import React from "react";
import { LoginPage } from "../pages/login/LoginPage";
import { LoadingScreen } from "../shared/ui/LoadingScreen";
import { useAuth } from "./AuthContext";
import { MainContent } from "./MainContent";

/**
 * 應用程式內容組件
 * 根據使用者的認證狀態，條件式渲染對應的頁面
 * @returns 根據認證狀態顯示的對應組件
 */
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
