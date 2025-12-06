// Transaction Form Feature

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { ParsedInvoice } from '../../shared/lib/parseInvoice';
import { generateId, getCurrentDate } from '../../shared/lib/utils';
import { Category, Merchant, Tag, Transaction } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { InputSelect } from '../../shared/ui/InputSelect';
import { InvoiceScanModal } from '../../shared/ui/InvoiceScanModal';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  transaction?: Transaction;
  mode?: 'add' | 'edit';
  startWithInvoiceScan?: boolean;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({ 
  isOpen, 
  onClose, 
  transaction,
  mode = 'add',
  startWithInvoiceScan = false,
}) => {
  const { categories, accounts, merchants, tags, addTransaction, updateTransaction, addCategory, addMerchant, addTag } = useAppContext();
  
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
  const [isScanOpen, setIsScanOpen] = useState(false);

  const resetForm = () => {
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
  };

  useEffect(() => {
    if (isOpen && startWithInvoiceScan) {
      setIsScanOpen(true);
    }
  }, [isOpen, startWithInvoiceScan]);
  
  useEffect(() => {
    const loadFormData = () => {
      if (transaction && mode === 'edit') {
        setFormData(transaction);
      } else {
        resetForm();
      }
    };
    
    if (isOpen) {
      loadFormData();
    }
  }, [transaction, mode, categories, accounts, isOpen]);
  
  const handleTypeChange = (type: 'expense' | 'income') => {
    const filteredCategories = categories.filter(c => c.type === type);
    setFormData({
      ...formData,
      type,
      category: filteredCategories.length > 0 ? filteredCategories[0].name : '',
    });
  };

  const handleCreateCategory = (name: string) => {
    const newCategory: Category = {
      id: generateId(),
      name,
      type: formData.type as 'expense' | 'income',
    };
    addCategory(newCategory);
    // InputSelect 的 onChange 會處理選中
  };

  const handleCreateMerchant = (name: string) => {
    const newMerchant: Merchant = {
      id: generateId(),
      name,
    };
    addMerchant(newMerchant);
    // InputSelect 的 onChange 會處理選中
  };

  const handleCreateTag = (name: string) => {
    // 如果標籤已存在，不需要再創建
    if (tags.some(tag => tag.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];
    const newTag: Tag = {
      id: generateId(),
      name,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    addTag(newTag);
    // 不在這裡更新 formData.tags，讓 InputSelect 的 onChange 來處理
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
      resetForm();
    } else if (transaction) {
      updateTransaction(transaction.id, formData);
    }
    
    onClose();
  };
  
  const currentCategories = categories.filter(c => c.type === formData.type);
  const categoryOptions = currentCategories.map(c => ({ value: c.name, label: c.name }));
  const accountOptions = accounts.map(a => ({ value: a.name, label: a.name }));
  const merchantOptions = merchants.map(m => ({ value: m.name, label: m.name }));
  const tagOptions = tags.map(t => ({ value: t.name, label: t.name }));

  const handleInvoiceParsed = (data: ParsedInvoice) => {
    setFormData((prev) => {
      const mergedNote = data.note ? [data.note, prev.note].filter(Boolean).join(' | ') : prev.note;
      const nextTags = new Set(prev.tags || []);
      nextTags.add('發票');

      let merchantName = prev.merchant;
      if (data.sellerId) {
        const foundMerchant = merchants.find((m) => String(m.id) === data.sellerId);
        if (foundMerchant) {
          merchantName = foundMerchant.name;
        }
      }

      return {
        ...prev,
        type: 'expense',
        amount: data.amount ?? prev.amount,
        date: data.date ?? prev.date,
        merchant: merchantName,
        note: mergedNote,
        tags: Array.from(nextTags),
      };
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'add' ? '新增交易' : '編輯交易'}>
      <InvoiceScanModal
        isOpen={isScanOpen}
        onClose={() => setIsScanOpen(false)}
        onParsed={handleInvoiceParsed}
      />

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

      <div className="mb-4">
        <Button
          type="button"
          variant="secondary"
          className="w-full py-3 border border-dashed border-gray-300 bg-white text-sm font-medium text-gray-700"
          onClick={() => setIsScanOpen(true)}
        >
          掃描電子發票填入
        </Button>
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
          <InputSelect
            label="分類"
            options={categoryOptions}
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as string })}
            onCreate={handleCreateCategory}
            placeholder="選擇或新增分類"
          />
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

        <InputSelect
          label="商家（選填）"
          options={merchantOptions}
          value={formData.merchant}
          onChange={(value) => setFormData({ ...formData, merchant: value as string })}
          onCreate={handleCreateMerchant}
          placeholder="選擇或新增商家"
        />

        <Input
          type="text"
          label="備註"
          value={formData.note}
          onChange={(e) => setFormData({...formData, note: e.target.value})}
          placeholder="例如：午餐"
        />

        <InputSelect
          label="標籤（選填）"
          options={tagOptions}
          value={formData.tags}
          onChange={(values) => setFormData({ ...formData, tags: values as string[] })}
          onCreate={handleCreateTag}
          placeholder="選擇或新增標籤"
          multiple
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
