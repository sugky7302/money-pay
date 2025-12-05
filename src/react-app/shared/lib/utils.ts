// Shared utility functions

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', { 
    style: 'currency', 
    currency: 'TWD', 
    minimumFractionDigits: 0 
  }).format(amount);
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const generateId = (): number => {
  // Combine timestamp with a random number to reduce collision risk
  return Date.now() + Math.floor(Math.random() * 1000);
};

import { Account, Transaction } from '../types';

/**
 * 計算單一帳戶的當前餘額
 * 當前餘額 = 初始餘額 + 該帳戶收入 - 該帳戶支出 + 轉入金額 - 轉出金額
 */
export const calculateAccountBalance = (
  account: Account,
  transactions: Transaction[]
): number => {
  let balance = account.balance; // 初始餘額
  
  transactions.forEach(t => {
    if (t.type === 'income' && t.account === account.name) {
      balance += t.amount;
    } else if (t.type === 'expense' && t.account === account.name) {
      balance -= t.amount;
    } else if (t.type === 'transfer') {
      if (t.fromAccount === account.name) {
        // 轉出金額 + 手續費
        balance -= t.amount + (t.fee || 0);
      }
      if (t.toAccount === account.name) {
        balance += t.amount;
      }
    } else if (t.type === 'adjustment' && t.account === account.name) {
      // 校正金額可正可負
      balance += t.amount;
    }
  });
  
  return balance;
};

/**
 * 計算所有帳戶的當前餘額總和
 */
export const calculateTotalBalance = (
  accounts: Account[],
  transactions: Transaction[]
): number => {
  return accounts.reduce((total, account) => {
    return total + calculateAccountBalance(account, transactions);
  }, 0);
};
