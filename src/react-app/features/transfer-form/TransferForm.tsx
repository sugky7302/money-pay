// Transfer Form Feature

import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { calculateAccountBalance, generateId, getCurrentDate } from '../../shared/lib/utils';
import { CURRENCY_SYMBOLS, Transaction } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';

interface TransferFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TransferForm: React.FC<TransferFormProps> = ({ isOpen, onClose }) => {
  const { accounts, tags, transactions, addTransaction } = useAppContext();
  
  const [formData, setFormData] = useState({
    fromAccount: accounts.length > 0 ? accounts[0].name : '',
    toAccount: accounts.length > 1 ? accounts[1].name : '',
    amount: 0,
    fee: 0,
    exchangeRate: 1,
    date: getCurrentDate(),
    note: '',
    selectedTags: [] as string[],
  });

  // Get account objects
  const fromAccount = useMemo(() => 
    accounts.find(a => a.name === formData.fromAccount),
    [accounts, formData.fromAccount]
  );
  const toAccount = useMemo(() => 
    accounts.find(a => a.name === formData.toAccount),
    [accounts, formData.toAccount]
  );

  // Check if currencies are different
  const isCrossCurrency = useMemo(() => {
    if (!fromAccount || !toAccount) return false;
    const fromCurrency = fromAccount.currency || 'TWD';
    const toCurrency = toAccount.currency || 'TWD';
    return fromCurrency !== toCurrency;
  }, [fromAccount, toAccount]);

  // Calculate received amount in target currency
  const receivedAmount = useMemo(() => {
    if (!isCrossCurrency) return formData.amount;
    return formData.amount * formData.exchangeRate;
  }, [formData.amount, formData.exchangeRate, isCrossCurrency]);

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
      fee: formData.fee > 0 ? Number(formData.fee) : undefined,
      exchangeRate: isCrossCurrency ? Number(formData.exchangeRate) : undefined,
      toAmount: isCrossCurrency ? receivedAmount : undefined,
    };
    
    addTransaction(newTransfer);
    onClose();
    
    // Reset form
    setFormData({
      fromAccount: accounts.length > 0 ? accounts[0].name : '',
      toAccount: accounts.length > 1 ? accounts[1].name : '',
      amount: 0,
      fee: 0,
      exchangeRate: 1,
      date: getCurrentDate(),
      note: '',
      selectedTags: [],
    });
  };
  
  const accountOptions = accounts.map(a => ({ 
    value: a.name, 
    label: `${a.name} (${a.currency || 'TWD'})` 
  }));
  
  // Get currency symbols
  const fromCurrency = fromAccount?.currency || 'TWD';
  const toCurrency = toAccount?.currency || 'TWD';
  const fromSymbol = CURRENCY_SYMBOLS[fromCurrency] || '$';
  const toSymbol = CURRENCY_SYMBOLS[toCurrency] || '$';
  
  // Check if the from account has sufficient balance (including fee)
  const fromAccountBalance = fromAccount ? calculateAccountBalance(fromAccount, transactions) : 0;
  const totalDeduction = formData.amount + (formData.fee || 0);
  const hasInsufficientFunds = fromAccount && totalDeduction > 0 && totalDeduction > fromAccountBalance;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="轉帳">
      <div className="space-y-4">
        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">轉帳金額 ({fromCurrency})</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">{fromSymbol}</span>
            <input 
              type="number" 
              inputMode="decimal"
              value={formData.amount || ''}
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              className="w-full bg-white p-4 pl-10 rounded-xl text-2xl font-bold text-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-200"
              placeholder="0"
              autoFocus
            />
          </div>
          {hasInsufficientFunds && (
            <p className="text-red-500 text-sm font-medium mt-2 ml-1">金額不足</p>
          )}
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-1 block">手續費（從轉出帳戶扣除）</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{fromSymbol}</span>
            <input 
              type="number" 
              inputMode="decimal"
              value={formData.fee || ''}
              onChange={(e) => setFormData({...formData, fee: Number(e.target.value)})}
              className="w-full bg-white p-3 pl-10 rounded-xl text-lg font-medium text-gray-800 border-none focus:ring-2 focus:ring-blue-500 outline-none shadow-sm placeholder:text-gray-300"
              placeholder="0"
            />
          </div>
          {totalDeduction > 0 && (
            <p className="text-gray-500 text-xs mt-1 ml-1">
              總扣除金額：<span className="font-medium text-gray-700">{fromSymbol}{totalDeduction.toLocaleString()}</span>
            </p>
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
            
            {/* Exchange rate input for cross-currency transfers */}
            {isCrossCurrency && (
              <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                  <span>⚠️ 跨幣別轉帳</span>
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium mb-1 block">
                    匯率 (1 {fromCurrency} = ? {toCurrency})
                  </label>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    step="0.0001"
                    value={formData.exchangeRate || ''}
                    onChange={(e) => setFormData({...formData, exchangeRate: Number(e.target.value)})}
                    className="w-full bg-white p-3 rounded-xl text-lg font-medium text-gray-800 border border-amber-200 focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="1.0000"
                  />
                </div>
                {formData.amount > 0 && formData.exchangeRate > 0 && (
                  <p className="text-amber-800 text-sm">
                    實際轉入：<span className="font-bold">{toSymbol}{receivedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span> {toCurrency}
                  </p>
                )}
              </div>
            )}
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
