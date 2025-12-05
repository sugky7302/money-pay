// Select component

import React from 'react';
import { ArrowDownCircle } from 'lucide-react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

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
