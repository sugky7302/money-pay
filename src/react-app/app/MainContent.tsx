// Main Content Component - Primary app layout after authentication

import React, { useState } from "react";
import { TransactionForm } from "../features/transaction-form/TransactionForm";
import { TransferForm } from "../features/transfer-form/TransferForm";
import { AccountsPage } from "../pages/accounts/AccountsPage";
import { HomePage } from "../pages/home/HomePage";
import { AddMenu } from "../pages/home/ui/AddMenu";
import { Tab, TabBar } from "../pages/home/ui/TabBar";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { SettingsPage } from "../pages/settings/SettingsPage";
import { useUIStore } from "../shared/stores/useUIStore";

// Page registry - easy to add new pages
const PAGES = {
  home: HomePage,
  accounts: AccountsPage,
  reports: ReportsPage,
} as const;

export const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const { isAnyModalOpen } = useUIStore();

  // Render active page
  const renderPage = () => {
    // Settings page is handled separately in PAGES now
    if (activeTab === "settings") {
      return <SettingsPage />;
    }

    const PageComponent = PAGES[activeTab as keyof typeof PAGES];
    return PageComponent ? <PageComponent /> : null;
  };

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
      <div className="w-full min-h-screen md:bg-gray-50 md:rounded-[40px] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {renderPage()}
        </div>

        {!isAnyModalOpen() && (
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
