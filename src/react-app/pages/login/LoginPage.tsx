// Login Page with Google Sign-In

import React, { useEffect, useState, useCallback } from 'react';
import { Wallet } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

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
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const handleGoogleSignIn = useCallback((response: { credential: string }) => {
    try {
      // Decode the JWT token to get user info
      const token = response.credential;
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const userInfo = {
        name: payload.name,
        email: payload.email,
        picture: payload.picture,
      };

      // Call the login function from AuthContext
      login(token, userInfo);
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      alert('登入失敗，請稍後再試');
    }
  }, [login]);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (isGoogleLoaded && window.google) {
      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleSignIn,
      });

      // Render the Google Sign-In button
      const buttonDiv = document.getElementById('googleSignInButton');
      if (buttonDiv) {
        window.google.accounts.id.renderButton(buttonDiv, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          locale: 'zh_TW',
        });
      }

      // Also show the One Tap prompt
      window.google.accounts.id.prompt();
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
            <h2 className="text-xl font-semibold text-gray-800 mb-2">歡迎使用</h2>
            <p className="text-gray-600 text-sm">請使用 Google 帳號登入以繼續使用</p>
          </div>

          <div className="flex flex-col items-center space-y-4">
            <div id="googleSignInButton" className="w-full flex justify-center"></div>
            
            {!isGoogleLoaded && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                <span className="text-gray-500 text-sm">載入中...</span>
              </div>
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
