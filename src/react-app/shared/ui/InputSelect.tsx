// InputSelect component

import { ArrowDownCircle, PlusCircle, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface Option {
  value: string;
  label: string;
}

interface InputSelectProps {
  label?: string;
  options: Option[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  onCreate?: (value: string) => void;
  placeholder?: string;
  className?: string;
  multiple?: boolean;
}

export const InputSelect: React.FC<InputSelectProps> = ({
  label,
  options,
  value,
  onChange,
  onCreate,
  placeholder,
  className = '',
  multiple = false,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // When value prop changes for single select, update input text
  useEffect(() => {
    if (!multiple) {
      const selectedOption = options.find(opt => opt.value === value);
      setInputValue(selectedOption ? selectedOption.label : (value as string) || '');
    }
  }, [value, options, multiple]);

  // Handle clicks outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef]);

  const handleSingleSelect = (option: Option) => {
    if (multiple) return;
    onChange(option.value);
    setInputValue(option.label);
    setShowOptions(false);
  };
  
  const handleMultiSelect = (option: Option) => {
    if (!multiple) return;
    const currentValues = (value as string[] || []);
    const newValues = currentValues.includes(option.value)
      ? currentValues.filter(v => v !== option.value)
      : [...currentValues, option.value];
    onChange(newValues);
    setInputValue(''); // Clear input after selection
  };
  
  const handleRemove = (val: string) => {
    if (!multiple) return;
    onChange((value as string[]).filter(v => v !== val));
  };

  const handleCreate = () => {
    if (!canCreateNew) return;
    
    onCreate(inputValue);
    
    if (multiple) {
      setInputValue('');
    } else {
      setInputValue(inputValue);
    }
    setShowOptions(false);
  };
  
  const selectedMulti = multiple ? options.filter(opt => (value as string[] || []).includes(opt.value)) : [];

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase()) &&
    !(multiple && (value as string[] || []).includes(option.value)) // Exclude already selected
  );
  
  const canCreateNew = onCreate && inputValue && !options.some(opt => opt.label.toLowerCase() === inputValue.toLowerCase());

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">
          {label}
        </label>
      )}
      <div 
        className="w-full bg-white p-2 rounded-xl text-gray-800 border-none focus-within:ring-2 focus-within:ring-blue-500 outline-none shadow-sm flex flex-wrap gap-1 items-center"
        onClick={() => inputRef.current?.focus()}
      >
        {multiple && selectedMulti.map(opt => (
          <span key={opt.value} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
            {opt.label}
            <button onClick={(e) => { e.stopPropagation(); handleRemove(opt.value); }} className="focus:outline-none">
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
            if (!multiple && e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={() => setShowOptions(true)}
          placeholder={placeholder}
          className="flex-1 bg-transparent focus-visible:outline-none! p-1 min-w-[60px]"
        />
        <ArrowDownCircle
          size={16}
          className="text-gray-400 cursor-pointer"
          onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
        />
      </div>

      {showOptions && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-30 max-h-60 overflow-y-auto">
          <ul>
            {filteredOptions.map(option => (
              <li
                key={option.value}
                onClick={() => multiple ? handleMultiSelect(option) : handleSingleSelect(option)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                {option.label}
              </li>
            ))}
            {canCreateNew && (
              <li
                onClick={handleCreate}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2 text-blue-500"
              >
                <PlusCircle size={16} />
                新增 "{inputValue}"
              </li>
            )}
            {filteredOptions.length === 0 && !canCreateNew && (
                <li className="px-4 py-2 text-gray-500">無符合項目</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};
