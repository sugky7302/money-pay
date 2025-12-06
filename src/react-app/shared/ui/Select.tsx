/**
 * Select.tsx - 下拉選擇框組件
 * 
 * 功能說明：
 * 1. 提供統一樣式的下拉選擇框
 * 2. 支援標籤顯示
 * 3. 支援所有原生 select 屬性
 */

import React from 'react';
import { ArrowDownCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

/**
 * 下拉選擇框組件
 * @param label - 選擇框標籤（選填）
 * @param options - 選項陣列
 * @returns 樣式化的下拉選擇框
 */
export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div>
      {label && (
        <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`w-full bg-white p-3 rounded-xl text-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ArrowDownCircle 
          size={16} 
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" 
        />
      </div>
    </div>
  );
};
