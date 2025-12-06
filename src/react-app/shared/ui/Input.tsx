/**
 * Input.tsx - 通用輸入框組件
 * 
 * 功能說明：
 * 1. 提供統一樣式的輸入框
 * 2. 支援標籤顯示
 * 3. 支援所有原生 input 屬性
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/**
 * 通用輸入框組件
 * @param label - 輸入框標籤（選填）
 * @returns 樣式化的輸入框
 */
export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div>
      {label && (
        <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">
          {label}
        </label>
      )}
      <input
        className={`w-full bg-white p-3 rounded-xl text-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm ${className}`}
        {...props}
      />
    </div>
  );
};
