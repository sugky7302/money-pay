// Account Form Feature

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Account } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';

interface AccountFormProps {
  isOpen: boolean;
  onClose: () => void;
  account?: Account;
  mode?: 'add' | 'edit';
}

const ACCOUNT_TYPES = [
  { value: 'bank', label: '銀行帳戶' },
  { value: 'cash', label: '現金' },
  { value: 'e-wallet', label: '電子支付' },
  { value: 'credit-card', label: '信用卡' },
  { value: 'other', label: '其他' },
];

const COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const AccountForm: React.FC<AccountFormProps> = ({ 
  isOpen, 
  onClose, 
  account,
  mode = 'add'
}) => {
  const { addAccount, updateAccount, currencies } = useAppContext();

  const currencyOptions = currencies.map(c => ({
    value: c.code,
    label: `${c.name} (${c.code})`,
  }));
  
  const [formData, setFormData] = useState<Partial<Account>>({
    name: '',
    type: 'cash',
    balance: 0,
    currency: 'TWD',
    isVirtual: false,
    color: COLORS[0],
  });
  
  useEffect(() => {
    const loadFormData = () => {
      if (account && mode === 'edit') {
        setFormData({
          ...account,
          currency: account.currency || 'TWD', // 相容舊資料
          isVirtual: Boolean(account.isVirtual),
        });
      } else {
        setFormData({
          name: '',
          type: 'cash',
          balance: 0,
          currency: 'TWD',
          isVirtual: false,
          color: COLORS[0],
        });
      }
    };
    
    loadFormData();
  }, [account, mode]);
  
  const handleSubmit = () => {
    if (!formData.name) {
      alert('請輸入帳戶名稱');
      return;
    }
    
    if (mode === 'add') {
      const newAccount: Account = {
        id: generateId(),
        name: formData.name,
        type: formData.type as Account['type'],
        balance: Number(formData.balance) || 0,
        currency: formData.currency || 'TWD',
        isVirtual: Boolean(formData.isVirtual),
        color: formData.color,
      };
      addAccount(newAccount);
    } else if (account) {
      updateAccount(account.id, formData);
    }
    
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? '新增帳戶' : '編輯帳戶'}>
      <div className="space-y-4">
        <Input
          type="text"
          label="帳戶名稱"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="例如：中國信託"
          autoFocus
        />
        
        <Select
          label="帳戶類型"
          options={ACCOUNT_TYPES}
          value={formData.type}
          onChange={(e) => setFormData({...formData, type: e.target.value as Account['type']})}
        />
        
        <Select
          label="幣別"
          options={currencyOptions}
          value={formData.currency}
          onChange={(e) => setFormData({...formData, currency: e.target.value})}
        />
        
        <Input
          type="number"
          label="餘額"
          value={formData.balance}
          onChange={(e) => setFormData({...formData, balance: Number(e.target.value)})}
          placeholder="0"
        />
        
        <label className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={Boolean(formData.isVirtual)}
            onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div>
            <p className="font-medium">虛擬帳戶</p>
            <p className="text-xs text-gray-500">僅做記錄，不列入總資產</p>
          </div>
        </label>
        
        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-2 block">
            選擇顏色
          </label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({...formData, color})}
                className={`w-10 h-10 rounded-full transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <Button 
          onClick={handleSubmit}
          className="w-full py-4 text-lg"
        >
          {mode === 'add' ? '新增帳戶' : '更新帳戶'}
        </Button>
      </div>
    </Modal>
  );
};
