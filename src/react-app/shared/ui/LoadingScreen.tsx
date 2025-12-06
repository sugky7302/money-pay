/**
 * LoadingScreen.tsx - 載入中畫面組件
 * 
 * 功能說明：
 * 1. 顯示全螢幕載入動畫
 * 2. 可自訂載入訊息
 * 3. 用於頁面載入、認證驗證等場景
 */

import React from "react";

interface LoadingScreenProps {
  message?: string;
}

/**
 * 載入中畫面組件
 * 顯示一個置中的旋轉動畫和載入訊息
 * @param message - 顯示的載入訊息，預設為「載入中...」
 * @returns 全螢幕載入畫面
 */
export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "載入中...",
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);
