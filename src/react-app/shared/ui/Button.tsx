/**
 * Button.tsx - 通用按鈕組件
 * 
 * 功能說明：
 * 1. 提供 primary、secondary、danger 三種樣式
 * 2. 支援所有原生 button 屬性
 * 3. 點擊時有縮放動畫效果
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
}

/**
 * 通用按鈕組件
 * @param variant - 按鈕樣式（primary/secondary/danger）
 * @param children - 按鈕內容
 * @returns 樣式化的按鈕
 */
export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  children, 
  className = '',
  ...props 
}) => {
  const baseStyles = 'px-4 py-2 rounded-xl font-medium transition-all active:scale-95';
  
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };
  
  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
