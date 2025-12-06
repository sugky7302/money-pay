/**
 * MainContent.tsx - 主要內容組件
 * 
 * 功能說明：
 * 1. 管理頁面導航狀態（首頁、帳戶、報表、設定）
 * 2. 處理新增交易/轉帳/信用卡繳款的流程
 * 3. 管理發票掃描功能入口
 * 4. 整合底部導航列
 * 5. 控制新增選單的顯示
 */

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
import { CreditCardPaymentForm } from "../features/credit-card-payment-form/CreditCardPaymentForm";

/** 頁面註冊表 - 方便新增頁面 */
const PAGES = {
  home: HomePage,
  accounts: AccountsPage,
  reports: ReportsPage,
} as const;

/**
 * 主要內容組件
 * 負責渲染主要頁面內容和處理頁面間的導航
 * @returns 主要內容區域和導航控制元件
 */
export const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [startWithInvoiceScan, setStartWithInvoiceScan] = useState(false);
  const [showCreditCardPaymentForm, setShowCreditCardPaymentForm] = useState(false);
  const { isAnyModalOpen } = useUIStore();

  /**
   * 根據當前 activeTab 渲染對應頁面
   * @returns 對應的頁面組件
   */
  const renderPage = () => {
    // Settings page is handled separately in PAGES now
    if (activeTab === "settings") {
      return <SettingsPage />;
    }

    const PageComponent = PAGES[activeTab as keyof typeof PAGES];
    return PageComponent ? <PageComponent /> : null;
  };

  /** 處理新增按鈕點擊事件，顯示新增選單 */
  const handleAddClick = () => {
    setShowAddMenu(true);
  };

  /** 處理選擇新增交易，關閉選單並開啟交易表單 */
  const handleSelectTransaction = () => {
    setShowAddMenu(false);
    setShowTransactionForm(true);
  };

  /** 處理選擇轉帳，關閉選單並開啟轉帳表單 */
  const handleSelectTransfer = () => {
    setShowAddMenu(false);
    setShowTransferForm(true);
  };

  /** 處理選擇發票掃描，關閉選單並開啟帶有發票掃描的交易表單 */
  const handleSelectInvoiceScan = () => {
    setShowAddMenu(false);
    setStartWithInvoiceScan(true);
    setShowTransactionForm(true);
  };

  /** 處理選擇信用卡繳款，關閉選單並開啟信用卡繳款表單 */
  const handleSelectCreditCardPayment = () => {
    setShowAddMenu(false);
    setShowCreditCardPaymentForm(true);
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
          onSelectInvoiceScan={handleSelectInvoiceScan}
          onSelectCreditCardPayment={handleSelectCreditCardPayment}
        />

        <TransactionForm
          isOpen={showTransactionForm}
          onClose={() => {
            setShowTransactionForm(false);
            setStartWithInvoiceScan(false);
          }}
          mode="add"
          startWithInvoiceScan={startWithInvoiceScan}
        />

        <TransferForm
          isOpen={showTransferForm}
          onClose={() => setShowTransferForm(false)}
        />

        <CreditCardPaymentForm
          isOpen={showCreditCardPaymentForm}
          onClose={() => setShowCreditCardPaymentForm(false)}
        />
      </div>
    </div>
  );
};

