/**
 * CurrencyForm.tsx - 幣別管理表單組件
 *
 * 功能說明：
 * 1. 顯示現有幣別列表
 * 2. 新增幣別（代碼、名稱、符號）
 * 3. 編輯幣別資訊
 * 4. 刪除幣別（確認後刪除）
 */

import { Pencil, Trash2 } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../app/AppContext';
import { useToast } from '../../app/ToastContext';
import { generateId } from '../../shared/lib/utils';
import { Currency } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';

interface CurrencyFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CurrencyForm: React.FC<CurrencyFormProps> = ({ isOpen, onClose }) => {
  const { currencies, addCurrency, updateCurrency, deleteCurrency } = useAppContext();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState<Partial<Currency>>({
    code: '',
    name: '',
    symbol: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ code: '', name: '', symbol: '' });
      setIsEditing(false);
    }
  }, [isOpen]);

  const handleEdit = (currency: Currency) => {
    setFormData(currency);
    setIsEditing(true);
  };
  
  const handleSubmit = () => {
    if (!formData.code || !formData.name || !formData.symbol) {
      showToast('請填寫所有欄位', 'error');
      return;
    }
    
    if (isEditing) {
      updateCurrency(formData as Currency);
    } else {
      const newCurrency: Currency = {
        id: generateId(),
        code: formData.code!,
        name: formData.name!,
        symbol: formData.symbol!,
      };
      addCurrency(newCurrency);
    }

    setFormData({ code: '', name: '', symbol: '' });
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這個幣別嗎？相關帳戶的幣別將會需要手動更新。')) {
      deleteCurrency(id);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? '編輯幣別' : '管理幣別'}>
      <div className="space-y-4">
        {/* 現有幣別列表 */}
        <div className="max-h-60 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-2">
            目前有 {currencies.length} 個幣別
          </p>
          {currencies.length > 0 ? (
            <div className="space-y-2">
              {currencies.map((currency) => (
                <div 
                  key={currency.id} 
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <div className="font-mono text-sm">
                    <span className="font-semibold">{currency.code}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span>{currency.name}</span>
                    <span className="text-gray-500 mx-2">|</span>
                    <span>{currency.symbol}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(currency)}
                      className="text-gray-400 hover:text-blue-500 p-1"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(currency.id)}
                      className="text-gray-400 hover:text-red-500 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">尚無幣別</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            {isEditing ? '編輯幣別' : '新增幣別'}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
              placeholder="代碼 (e.g. TWD)"
            />
            <Input
              type="text"
              value={formData.name || ''}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="名稱 (e.g. 新台幣)"
            />
            <Input
              type="text"
              value={formData.symbol || ''}
              onChange={(e) => setFormData({...formData, symbol: e.target.value})}
              placeholder="符號 (e.g. NT$)"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            {isEditing && (
              <Button onClick={() => { setIsEditing(false); setFormData({ code: '', name: '', symbol: '' }); }} variant="secondary">
                取消編輯
              </Button>
            )}
            <Button onClick={handleSubmit} className="px-4">
              {isEditing ? '儲存變更' : '新增'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
