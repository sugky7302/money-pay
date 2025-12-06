/**
 * Modal.tsx - 彈出視窗組件
 * 
 * 功能說明：
 * 1. 顯示底部彈出式對話框（手機版）
 * 2. 顯示置中彈出視窗（桌面版）
 * 3. 點擊背景可關閉
 * 4. 支援滾動內容
 */

import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/**
 * 彈出視窗組件
 * 提供統一的彈出視窗樣式，支援手機和桌面版型
 * @param isOpen - 是否顯示
 * @param onClose - 關閉回調函數
 * @param title - 視窗標題
 * @param children - 視窗內容
 * @returns 彈出視窗組件
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-gray-50 w-full md:w-[450px] md:rounded-2xl rounded-t-3xl p-6 pb-safe relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="text-gray-500 font-medium text-sm">
            取消
          </button>
        </div>
        
        {children}
      </div>
    </div>
  );
};
