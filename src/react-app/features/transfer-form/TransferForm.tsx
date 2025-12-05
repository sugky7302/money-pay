// Transfer Form Feature

import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { generateId, getCurrentDate } from '../../shared/lib/utils';
import { Transaction } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ isOpen, onClose }) => {
  const { accounts, tags, addTransaction } = useAppContext();
  
  const [formData, setFormData] = useState({
    fromAccount: accounts.length > 0 ? accounts[0].name : '',
    toAccount: accounts.length > 1 ? accounts[1].name : '',
    amount: 0,
    date: getCurrentDate(),
    note: '',
    selectedTags: [] as string[],
  });

  const handleTagToggle = (tagName: string) => {
    if (formData.selectedTags.includes(tagName)) {
      setFormData({
        ...formData,
        selectedTags: formData.selectedTags.filter(t => t !== tagName),
      });
    } else {
      setFormData({
        ...formData,
        selectedTags: [...formData.selectedTags, tagName],
      });
    }
  };
  
  const handleSubmit = () => {
    if (!formData.amount || formData.amount <= 0) return;
    if (!formData.fromAccount || !formData.toAccount) return;
    if (formData.fromAccount === formData.toAccount) {
      alert('轉出帳戶和轉入帳戶不能相同');
      return;
    }
    
    const newTransfer: Transaction = {
      id: generateId(),
      type: 'transfer',
      amount: Number(formData.amount),
      category: '轉帳',
      date: formData.date,
      note: formData.note,
      tags: formData.selectedTags,
      fromAccount: formData.fromAccount,
      toAccount: formData.toAccount,
    };
    
    addTransaction(newTransfer);
    onClose();
    
    // Reset form
    setFormData({
      fromAccount: accounts.length > 0 ? accounts[0].name : '',
      toAccount: accounts.length > 1 ? accounts[1].name : '',
      amount: 0,
      date: getCurrentDate(),
      note: '',
      selectedTags: [],
    });
  };
  
  const accountOptions = accounts.map(a => ({ value: a.name, label: a.name }));
  
  // Check if the from account has sufficient balance
  const fromAccount = accounts.find(a => a.name === formData.fromAccount);
  const hasInsufficientFunds = fromAccount && formData.amount > 0 && formData.amount > fromAccount.balance;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="轉帳">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">轉帳金額</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">$</span>
            <input 
              type="number" 
              inputMode="decimal"
              value={formData.amount || ''}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full bg-white p-4 pl-8 rounded-xl text-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-200"
              placeholder="0"
              autoFocus
            />
          </div>
          {hasInsufficientFunds && (
            <p className="text-red-500 text-sm font-medium mt-2 ml-1">金額不足</p>
          )}
        </div>

        {accountOptions.length > 0 && (
          <>
            <Select
              label="轉出帳戶"
              options={accountOptions}
              value={formData.fromAccount}
              onChange={(e) => setFormData({...formData, fromAccount: e.target.value})}
            />
            
            <Select
              label="轉入帳戶"
              options={accountOptions}
              value={formData.toAccount}
              onChange={(e) => setFormData({...formData, toAccount: e.target.value})}
            />
          </>
        )}

        <Input
          type="date"
          label="日期"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
        />

        <Input
          type="text"
          label="備註"
          value={formData.note}
          onChange={(e) => setFormData({...formData, note: e.target.value})}
          placeholder="例如：定期存款轉入"
        />

        {tags.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 font-medium ml-1 mb-2 block">
              標籤（選填）
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = formData.selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.name)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      isSelected
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    style={isSelected ? { backgroundColor: tag.color } : undefined}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Button 
          onClick={handleSubmit}
          className="w-full py-4 text-lg"
        >
          確認轉帳
        </Button>
      </div>
    </Modal>
  );
};
