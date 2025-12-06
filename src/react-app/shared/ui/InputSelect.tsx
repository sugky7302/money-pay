/**
 * InputSelect.tsx - 可輸入的下拉選擇框組件
 * 
 * 功能說明：
 * 1. 支援单選和多選模式
 * 2. 支援搜尋過濾選項
 * 3. 支援新增自訂選項
 * 4. 手機版使用底部彈出選單，避免鍵盤遮擋
 * 5. 桌面版使用傳統下拉選單
 */

import { ArrowDownCircle, Check, PlusCircle, Search, X } from 'lucide-react';
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

/** 偵測是否為觸控裝置 */
const isTouchDevice = () => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

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
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [mobileSearchValue, setMobileSearchValue] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // When value prop changes for single select, update input text
  useEffect(() => {
    if (!multiple && !showOptions && !showMobileModal) {
      const selectedOption = options.find(opt => opt.value === value);
      setInputValue(selectedOption ? selectedOption.label : (value as string) || '');
    }
  }, [value, options, multiple, showOptions, showMobileModal]);

  // Handle clicks outside to close dropdown (desktop only)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // 當手機 modal 開啟時，自動 focus 搜尋框
  useEffect(() => {
    if (showMobileModal) {
      setMobileSearchValue('');
      setTimeout(() => mobileInputRef.current?.focus(), 100);
    }
  }, [showMobileModal]);

  const handleSingleSelect = (option: Option) => {
    if (multiple) return;
    onChange(option.value);
    setInputValue(option.label);
    setShowOptions(false);
    setShowMobileModal(false);
    inputRef.current?.blur();
  };
  
  const handleMultiSelect = (option: Option) => {
    if (!multiple) return;
    const currentValues = (value as string[] || []);
    const newValues = currentValues.includes(option.value)
      ? currentValues.filter(v => v !== option.value)
      : [...currentValues, option.value];
    onChange(newValues);
    setInputValue('');
    // 多選不關閉，讓用戶繼續選
  };
  
  const handleRemove = (val: string) => {
    if (!multiple) return;
    onChange((value as string[]).filter(v => v !== val));
  };

  const handleCreate = (searchText: string) => {
    const trimmedValue = searchText.trim();
    if (!trimmedValue || options.some(opt => opt.label.toLowerCase() === trimmedValue.toLowerCase())) return;
    
    onCreate?.(trimmedValue);
    
    if (multiple) {
      const currentValues = (value as string[] || []);
      if (!currentValues.includes(trimmedValue)) {
        onChange([...currentValues, trimmedValue]);
      }
      setInputValue('');
      setMobileSearchValue('');
    } else {
      onChange(trimmedValue);
      setInputValue(trimmedValue);
      setShowOptions(false);
      setShowMobileModal(false);
    }
    inputRef.current?.blur();
  };
  
  const selectedMulti = multiple ? options.filter(opt => (value as string[] || []).includes(opt.value)) : [];

  // 根據搜尋文字過濾（桌面用 inputValue，手機用 mobileSearchValue）
  const getFilteredOptions = (searchText: string) => {
    return options.filter(option =>
      option.label.toLowerCase().includes(searchText.toLowerCase()) &&
      !(multiple && (value as string[] || []).includes(option.value))
    );
  };

  const filteredOptions = getFilteredOptions(inputValue);
  const mobileFilteredOptions = getFilteredOptions(mobileSearchValue);
  
  const canCreateNew = (searchText: string) => 
    onCreate && searchText.trim() && !options.some(opt => opt.label.toLowerCase() === searchText.trim().toLowerCase());

  // 點擊輸入框時的處理
  const handleInputClick = () => {
    if (isTouchDevice()) {
      // 手機：開啟底部 modal
      setShowMobileModal(true);
    } else {
      // 桌面：聚焦輸入框
      inputRef.current?.focus();
    }
  };

  const handleInputFocus = () => {
    if (!isTouchDevice()) {
      setShowOptions(true);
    }
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      {label && (
        <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">
          {label}
        </label>
      )}
      <div 
        className="w-full bg-white p-2 rounded-xl text-gray-800 border-none focus-within:ring-2 focus-within:ring-blue-500 outline-none shadow-sm flex flex-wrap gap-1 items-center cursor-pointer"
        onClick={handleInputClick}
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
          onFocus={handleInputFocus}
          placeholder={multiple && selectedMulti.length > 0 ? '' : placeholder}
          className="flex-1 bg-transparent focus-visible:outline-none p-1 min-w-[60px]"
          readOnly={isTouchDevice()}
        />
        <ArrowDownCircle
          size={16}
          className="text-gray-400 shrink-0"
        />
      </div>

      {/* 桌面版下拉選單 */}
      {showOptions && !isTouchDevice() && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border border-gray-100 z-30 max-h-60 overflow-y-auto">
          <ul>
            {filteredOptions.map(option => (
              <li
                key={option.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => multiple ? handleMultiSelect(option) : handleSingleSelect(option)}
                className="px-4 py-3 hover:bg-gray-100 active:bg-gray-200 cursor-pointer border-b border-gray-50 last:border-b-0"
              >
                {option.label}
              </li>
            ))}
            {canCreateNew(inputValue) && (
              <li
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleCreate(inputValue)}
                className="px-4 py-3 hover:bg-blue-50 active:bg-blue-100 cursor-pointer flex items-center gap-2 text-blue-600 font-medium"
              >
                <PlusCircle size={16} />
                新增「{inputValue.trim()}」
              </li>
            )}
            {filteredOptions.length === 0 && !canCreateNew(inputValue) && (
              <li className="px-4 py-3 text-gray-400 text-center">無符合項目</li>
            )}
          </ul>
        </div>
      )}

      {/* 手機版底部彈出選單 */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
            onClick={() => setShowMobileModal(false)} 
          />
          <div className="bg-white w-full rounded-t-3xl relative z-10 shadow-2xl max-h-[70vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            {/* 拖曳條 */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3 shrink-0" />
            
            {/* 標題與關閉 */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">{label || '選擇項目'}</h3>
              <button 
                onClick={() => setShowMobileModal(false)}
                className="text-gray-400 p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* 搜尋框 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
                <Search size={18} className="text-gray-400 shrink-0" />
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={mobileSearchValue}
                  onChange={(e) => setMobileSearchValue(e.target.value)}
                  placeholder="搜尋或輸入新項目..."
                  className="flex-1 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                />
                {mobileSearchValue && (
                  <button onClick={() => setMobileSearchValue('')}>
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
            </div>

            {/* 選項列表 */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <ul className="py-1">
                {mobileFilteredOptions.map(option => {
                  const isSelected = multiple 
                    ? (value as string[] || []).includes(option.value)
                    : value === option.value;
                  
                  return (
                    <li
                      key={option.value}
                      onClick={() => multiple ? handleMultiSelect(option) : handleSingleSelect(option)}
                      className={`px-5 py-4 flex items-center justify-between active:bg-gray-100 border-b border-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <span className={isSelected ? 'text-blue-600 font-medium' : 'text-gray-800'}>
                        {option.label}
                      </span>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </li>
                  );
                })}
                
                {canCreateNew(mobileSearchValue) && (
                  <li
                    onClick={() => handleCreate(mobileSearchValue)}
                    className="px-5 py-4 flex items-center gap-3 active:bg-blue-50 text-blue-600 font-medium"
                  >
                    <PlusCircle size={20} />
                    新增「{mobileSearchValue.trim()}」
                  </li>
                )}
                
                {mobileFilteredOptions.length === 0 && !canCreateNew(mobileSearchValue) && (
                  <li className="px-5 py-8 text-gray-400 text-center">
                    {mobileSearchValue ? '無符合項目' : '目前沒有選項'}
                  </li>
                )}
              </ul>
            </div>

            {/* 多選確認按鈕 */}
            {multiple && (
              <div className="p-4 border-t border-gray-100 bg-white">
                <button
                  onClick={() => setShowMobileModal(false)}
                  className="w-full bg-blue-500 text-white py-3 rounded-xl font-medium active:bg-blue-600"
                >
                  完成 ({selectedMulti.length} 個已選)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
