// Add Menu Component

import { ArrowLeftRight, Plus } from "lucide-react";
import React from "react";

interface AddMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction: () => void;
  onSelectTransfer: () => void;
}

export const AddMenu: React.FC<AddMenuProps> = ({
  isOpen,
  onClose,
  onSelectTransaction,
  onSelectTransfer,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />

        <h2 className="text-xl font-bold text-gray-800 mb-4">新增紀錄</h2>

        <div className="space-y-3">
          <button
            onClick={onSelectTransaction}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold">收入 / 支出</h3>
              <p className="text-xs text-blue-600">記錄一般交易</p>
            </div>
          </button>

          <button
            onClick={onSelectTransfer}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-green-500 text-white p-3 rounded-full">
              <ArrowLeftRight size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold">轉帳</h3>
              <p className="text-xs text-green-600">帳戶之間轉帳</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
