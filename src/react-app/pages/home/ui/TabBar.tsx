/**
 * TabBar.tsx - 底部導航列組件
 *
 * 功能說明：
 * 1. 顯示五個導航按鈕：首頁、帳戶、新增、報表、設定
 * 2. 高亮當前活動的分頁
 * 3. 中間的新增按鈕觸發新增選單
 * 4. 固定在畫面底部（適配 Safe Area）
 */

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
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 px-4 z-50 h-20">
    <div className="grid grid-cols-5 gap-2 items-center max-w-md mx-auto">
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
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-colors active:scale-95 justify-self-center"
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
  </div>
);
