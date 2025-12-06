// Credit Card Payment Form Feature

import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { generateId, getCurrentDate } from '../../shared/lib/utils';
import { Transaction } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';

interface CreditCardPaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditCardPaymentForm: React.FC<CreditCardPaymentFormProps> = ({ 
  isOpen, 
  onClose, 
}) => {
  const { accounts, addTransaction } = useAppContext();
  
  const [fromAccount, setFromAccount] = useState<string>('');
  const [toAccount, setToAccount] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(getCurrentDate());

  const nonCreditCardAccounts = accounts
    .filter(a => a.type !== 'credit-card')
    .map(a => ({ value: a.name, label: a.name }));

  const creditCardAccounts = accounts
    .filter(a => a.type === 'credit-card')
    .map(a => ({ value: a.name, label: a.name }));

  useEffect(() => {
    if (isOpen) {
      if (nonCreditCardAccounts.length > 0) {
        setFromAccount(nonCreditCardAccounts[0].value);
      }
      if (creditCardAccounts.length > 0) {
        setToAccount(creditCardAccounts[0].value);
      }
      setAmount(0);
      setDate(getCurrentDate());
    }
  }, [isOpen, nonCreditCardAccounts, creditCardAccounts]);
  
  const handleSubmit = () => {
    if (!fromAccount || !toAccount || amount <= 0) {
      alert('請填寫完整資訊');
      return;
    }
    
    const newTransaction: Transaction = {
      id: generateId(),
      type: 'transfer',
      fromAccount,
      toAccount,
      amount,
      date,
      note: '繳交卡費',
    };
    addTransaction(newTransaction);
    
    onClose();
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="繳交卡費">
      <div className="space-y-4">
        <Select
          label="付款帳戶"
          options={nonCreditCardAccounts}
          value={fromAccount}
          onChange={(e) => setFromAccount(e.target.value)}
        />
        
        <Select
          label="信用卡"
          options={creditCardAccounts}
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
        />
        
        <Input
          type="number"
          label="金額"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          placeholder="0"
        />

        <Input
          type="date"
          label="日期"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        
        <Button 
          onClick={handleSubmit}
          className="w-full py-4 text-lg"
        >
          儲存
        </Button>
      </div>
    </Modal>
  );
};
