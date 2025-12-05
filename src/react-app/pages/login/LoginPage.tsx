// Login Page with Google Sign-In

import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { Wallet } from "lucide-react";
import React, { useCallback } from "react";
import { useAuth } from "../../app/AuthContext";

export const LoginPage: React.FC = () => {
  const { login } = useAuth();

  const handleGoogleSuccess = useCallback(
    (response: CredentialResponse) => {
      try {
        if (!response.credential) {
          throw new Error("No credential received");
        }

        const token = response.credential;

        // Validate token structure before parsing
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }

        // Parse JWT payload with proper error handling
        let payload;
        try {
          payload = JSON.parse(atob(parts[1]));
        } catch {
          throw new Error("Failed to parse token payload");
        }

        // Validate required fields exist
        if (!payload.name || !payload.email) {
          throw new Error("Invalid token data: missing required fields");
        }

        const userInfo = {
          name: payload.name,
          email: payload.email,
          picture: payload.picture || "",
        };

        // Call the login function from AuthContext
        login(token, userInfo);
      } catch (error) {
        console.error("Error during Google Sign-In:", error);
        const errorMessage =
          error instanceof Error ? error.message : "登入失敗";
        alert(`登入失敗：${errorMessage}。請稍後再試或聯絡系統管理員。`);
      }
    },
    [login]
  );

  const handleGoogleError = useCallback(() => {
    console.error("Google Sign-In failed");
    alert("Google 登入失敗，請稍後再試。");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-500 text-white p-4 rounded-full mb-4">
            <Wallet size={48} />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CloudBudget</h1>
          <p className="text-gray-600 text-center">智慧記帳 App</p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              歡迎使用
            </h2>
            <p className="text-gray-600 text-sm">
              請使用 Google 帳號登入以繼續使用
            </p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              locale="zh_TW"
            />
          </div>

          <div className="pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              使用 Google 登入即表示您同意我們的服務條款和隱私政策
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
