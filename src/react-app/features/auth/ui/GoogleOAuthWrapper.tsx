// Google OAuth Provider Wrapper

import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { useConfig } from "../../../shared/lib";
import { LoadingScreen } from "../../../shared/ui/LoadingScreen";

interface GoogleOAuthWrapperProps {
  children: React.ReactNode;
}

export const GoogleOAuthWrapper: React.FC<GoogleOAuthWrapperProps> = ({
  children,
}) => {
  const { config, loading, error } = useConfig();

  if (loading) {
    return <LoadingScreen message="載入設定中..." />;
  }

  if (error || !config?.googleClientId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">設定錯誤</h2>
          <p className="text-gray-600">
            {error?.message ||
              "Google Client ID 未設定。請參考 GOOGLE_OAUTH_SETUP.md 文件進行設定。"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={config.googleClientId}>
      {children}
    </GoogleOAuthProvider>
  );
};
