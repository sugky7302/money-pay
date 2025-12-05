// Transaction Form Feature

import React, { useState, useEffect } from 'react';
import { Transaction } from '../../shared/types';
import { useAppContext } from '../../app/AppContext';
import { generateId, getCurrentDate } from '../../shared/lib/utils';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { Button } from '../../shared/ui/Button';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  mode?: 'add' | 'edit';
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  transaction,
  mode = 'add'
}) => {
  const { categories, accounts, merchants, addTransaction, updateTransaction } = useAppContext();
  
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'expense',
    amount: 0,
    category: '',
    date: getCurrentDate(),
    note: '',
    tags: [],
    merchant: '',
    account: '',
  });
  
  useEffect(() => {
    const loadFormData = () => {
      if (transaction && mode === 'edit') {
        setFormData(transaction);
      } else {
        const expenseCategories = categories.filter(c => c.type === 'expense');
        const defaultAccount = accounts.length > 0 ? accounts[0].name : '';
        setFormData({
          type: 'expense',
          amount: 0,
          category: expenseCategories.length > 0 ? expenseCategories[0].name : '',
          date: getCurrentDate(),
          note: '',
          tags: [],
          merchant: '',
          account: defaultAccount,
        });
      }
    };
    
    loadFormData();
  }, [transaction, mode, categories, accounts]);
  
  const handleTypeChange = (type: 'expense' | 'income') => {
    const filteredCategories = categories.filter(c => c.type === type);
    setFormData({
      ...formData,
      type,
      category: filteredCategories.length > 0 ? filteredCategories[0].name : '',
    });
  };
  
  const handleSubmit = () => {
    if (!formData.amount || formData.amount <= 0) return;
    
    if (mode === 'add') {
      const newTransaction: Transaction = {
        id: generateId(),
        type: formData.type as 'expense' | 'income',
        amount: Number(formData.amount),
        category: formData.category || '',
        date: formData.date || getCurrentDate(),
        note: formData.note,
        tags: formData.tags,
        merchant: formData.merchant,
        account: formData.account,
      };
      addTransaction(newTransaction);
    } else if (transaction) {
      updateTransaction(transaction.id, formData);
    }
    
    onClose();
  };
  
  const currentCategories = categories.filter(c => c.type === formData.type);
  const categoryOptions = currentCategories.map(c => ({ value: c.name, label: c.name }));
  const accountOptions = accounts.map(a => ({ value: a.name, label: a.name }));
  const merchantOptions = merchants.map(m => ({ value: m.name, label: m.name }));
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? '新增交易' : '編輯交易'}>
      <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
        <button 
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            formData.type === 'expense' ? 'bg-white shadow text-red-500' : 'text-gray-500'
          }`}
          onClick={() => handleTypeChange('expense')}
        >
          支出
        </button>
        <button 
          className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
            formData.type === 'income' ? 'bg-white shadow text-green-500' : 'text-gray-500'
          }`}
          onClick={() => handleTypeChange('income')}
        >
          收入
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">金額</label>
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
        </div>

        <div className="grid grid-cols-2 gap-4">
          {categoryOptions.length > 0 && (
            <Select
              label="分類"
              options={categoryOptions}
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            />
          )}
          <Input
            type="date"
            label="日期"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
          />
        </div>

        {accountOptions.length > 0 && (
          <Select
            label="帳戶"
            options={accountOptions}
            value={formData.account}
            onChange={(e) => setFormData({...formData, account: e.target.value})}
          />
        )}

        {merchantOptions.length > 0 && (
          <Select
            label="商家（選填）"
            options={[{ value: '', label: '不指定' }, ...merchantOptions]}
            value={formData.merchant}
            onChange={(e) => setFormData({...formData, merchant: e.target.value})}
          />
        )}

        <Input
          type="text"
          label="備註"
          value={formData.note}
          onChange={(e) => setFormData({...formData, note: e.target.value})}
          placeholder="例如：午餐"
        />

        <Button 
          onClick={handleSubmit}
          className="w-full py-4 text-lg"
        >
          {mode === 'add' ? '儲存交易' : '更新交易'}
        </Button>
      </div>
    </Modal>
  );
};
