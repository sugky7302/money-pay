// Login Page with Google Sign-In

import { Wallet } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { useAuth } from "../../app/AuthContext";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

// Google Client ID - In production, this should be configured via environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleGoogleSignIn = useCallback(
    (response: { credential: string }) => {
      try {
        // Decode the JWT token to get user info
        // Note: This is only for display purposes. The token should be validated
        // on the server side for any security-sensitive operations.
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

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      // Check if Google Client ID is configured
      if (!GOOGLE_CLIENT_ID) {
        setConfigError(
          "Google Client ID 未設定。請參考 GOOGLE_OAUTH_SETUP.md 文件進行設定。"
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      script.onerror = () => {
        setConfigError("無法載入 Google 登入服務，請檢查網路連線。");
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      // Double-check GOOGLE_CLIENT_ID is available before initializing
      if (!GOOGLE_CLIENT_ID) {
        setConfigError(
          "Google Client ID 未設定。請參考 GOOGLE_OAUTH_SETUP.md 文件進行設定。"
        );
        return;
      }

      try {
        // Initialize Google Sign-In
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
        });

        // Render the Google Sign-In button
        const buttonDiv = document.getElementById("googleSignInButton");
        if (buttonDiv) {
          window.google.accounts.id.renderButton(buttonDiv, {
            theme: "outline",
            size: "large",
            text: "signin_with",
            shape: "rectangular",
            locale: "zh_TW",
          });
        }

        // Show the One Tap prompt only on initial load for better UX
        // This can be commented out if the behavior is too intrusive
        // window.google.accounts.id.prompt();
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error);
        setConfigError(
          "初始化 Google 登入失敗，請重新整理頁面或聯絡系統管理員。"
        );
      }
    }
  }, [isGoogleLoaded, handleGoogleSignIn]);

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
            {configError ? (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm text-center">
                  {configError}
                </p>
                <p className="text-red-600 text-xs text-center mt-2">
                  請聯絡系統管理員或參考 GOOGLE_OAUTH_SETUP.md 文件
                </p>
              </div>
            ) : (
              <>
                <div
                  id="googleSignInButton"
                  className="w-full flex justify-center"
                ></div>

                {!isGoogleLoaded && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="text-gray-500 text-sm">載入中...</span>
                  </div>
                )}
              </>
            )}
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
