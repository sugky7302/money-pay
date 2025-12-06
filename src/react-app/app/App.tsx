/**
 * App.tsx - 主應用程式組件
 * 
 * 功能說明：
 * 1. 整合 Google OAuth 認證包裝器
 * 2. 提供全域認證狀態管理 (AuthProvider)
 * 3. 提供全域應用狀態管理 (AppProvider)
 * 4. 作為應用程式的根組件入口點
 */

import { GoogleOAuthWrapper } from "../features/auth/ui/GoogleOAuthWrapper";
import { AppContent } from "./AppContent";
import { AppProvider } from "./AppContext";
import { AuthProvider } from "./AuthContext";

/**
 * 主應用程式組件
 * 包裝所有必要的 Context Provider，建立應用程式的基礎架構
 * @returns 完整包裝的應用程式組件樹
 */
export default function App() {
  return (
    <GoogleOAuthWrapper>
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </GoogleOAuthWrapper>
  );
};
