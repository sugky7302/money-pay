// Input component

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

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
