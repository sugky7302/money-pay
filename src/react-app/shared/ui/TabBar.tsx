// Tab Bar Component

import {
    BarChart3,
    CreditCard,
    Plus,
    Settings,
    Wallet,
} from "lucide-react";
import React from "react";

export type Tab = "home" | "accounts" | "reports" | "settings";

interface TabBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onAddClick: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  activeTab,
  setActiveTab,
  onAddClick,
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 px-6 flex justify-between items-center z-50 h-20 md:max-w-md md:mx-auto md:relative md:border-t-0 md:bg-transparent">
    <button
      onClick={() => setActiveTab("home")}
      className={`flex flex-col items-center space-y-1 ${
        activeTab === "home" ? "text-blue-500" : "text-gray-400"
      }`}
    >
      <Wallet size={24} />
      <span className="text-[10px] font-medium">錢包</span>
    </button>

    <button
      onClick={() => setActiveTab("accounts")}
      className={`flex flex-col items-center space-y-1 ${
        activeTab === "accounts" ? "text-blue-500" : "text-gray-400"
      }`}
    >
      <CreditCard size={24} />
      <span className="text-[10px] font-medium">帳戶</span>
    </button>

    <button
      onClick={onAddClick}
      className="bg-blue-500 text-white p-4 rounded-full shadow-lg transform -translate-y-4 hover:bg-blue-600 transition-colors active:scale-95"
    >
      <Plus size={28} />
    </button>

    <button
      onClick={() => setActiveTab("reports")}
      className={`flex flex-col items-center space-y-1 ${
        activeTab === "reports" ? "text-blue-500" : "text-gray-400"
      }`}
    >
      <BarChart3 size={24} />
      <span className="text-[10px] font-medium">報表</span>
    </button>

    <button
      onClick={() => setActiveTab("settings")}
      className={`flex flex-col items-center space-y-1 ${
        activeTab === "settings" ? "text-blue-500" : "text-gray-400"
      }`}
    >
      <Settings size={24} />
      <span className="text-[10px] font-medium">設定</span>
    </button>
  </div>
);
