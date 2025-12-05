// Main App Component

import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState } from "react";
import { TransactionForm } from "../features/transaction-form/TransactionForm";
import { TransferForm } from "../features/transfer-form/TransferForm";
import { AccountsPage } from "../pages/accounts/AccountsPage";
import { HomePage } from "../pages/home/HomePage";
import { LoginPage } from "../pages/login/LoginPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { useConfig } from "../shared/lib";
import { AddMenu } from "../shared/ui/AddMenu";
import { Tab, TabBar } from "../shared/ui/TabBar";
import { AppProvider } from "./AppContext";
import { AuthProvider, useAuth } from "./AuthContext";

// Loading Component
const LoadingScreen: React.FC<{ message?: string }> = ({
  message = "載入中...",
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
);

// Main Content Component (after authentication)
const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);

  const handleAddClick = () => {
    setShowAddMenu(true);
  };

  const handleSelectTransaction = () => {
    setShowAddMenu(false);
    setShowTransactionForm(true);
  };

  const handleSelectTransfer = () => {
    setShowAddMenu(false);
    setShowTransferForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans md:flex md:items-center md:justify-center md:bg-gray-200">
      <div className="w-full min-h-screen md:min-h-[800px] md:max-h-[850px] md:max-w-[400px] md:bg-gray-50 md:rounded-[40px] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-50" />

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === "home" && <HomePage />}
          {activeTab === "accounts" && <AccountsPage />}
          {activeTab === "reports" && <ReportsPage />}
          {activeTab === "settings" && (
            <SettingsPage setIsManagementModalOpen={setIsManagementModalOpen} />
          )}
        </div>

        {!isManagementModalOpen && (
          <TabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onAddClick={handleAddClick}
          />
        )}

        <AddMenu
          isOpen={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          onSelectTransaction={handleSelectTransaction}
          onSelectTransfer={handleSelectTransfer}
        />

        <TransactionForm
          isOpen={showTransactionForm}
          onClose={() => setShowTransactionForm(false)}
          mode="add"
        />

        <TransferForm
          isOpen={showTransferForm}
          onClose={() => setShowTransferForm(false)}
        />
      </div>
    </div>
  );
};

// App Content with Auth Check
const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen message="驗證中..." />;
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <MainContent />;
};

// Google OAuth Wrapper - waits for config to load
const GoogleOAuthWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { config, loading, error } = useConfig();

  if (loading) {
    return <LoadingScreen message="載入設定中..." />;
  }

  console.log("Config in GoogleOAuthWrapper:", config, error);

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

// Main App Export
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
