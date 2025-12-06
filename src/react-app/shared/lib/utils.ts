/**
 * utils.ts - 共用工具函數庫
 * 
 * 功能說明：
 * 1. 貨幣格式化
 * 2. 日期時間處理
 * 3. ID 生成
 * 4. 帳戶餘額計算
 * 5. 總資產計算
 */

/**
 * 格式化金額為台幣貨幣格式
 * @param amount - 要格式化的金額
 * @returns 格式化後的貨幣字串（例如：NT$1,000）
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', { 
    style: 'currency', 
    currency: 'TWD', 
    minimumFractionDigits: 0 
  }).format(amount);
};

/**
 * 取得當前月份字串
 * @returns 當前月份（格式：YYYY-MM）
 */
export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

/**
 * 取得當前日期字串
 * @returns 當前日期（格式：YYYY-MM-DD）
 */
export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

/**
 * 格式化時間
 * @param date - Date 物件
 * @returns 格式化的時間字串（格式：HH:MM）
 */
export const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * 生成唯一 ID
 * 結合時間戳記和隨機數以降低碰撞風險
 * @returns 唯一的數字 ID
 */
export const generateId = (): number => {
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
        // 跨幣別轉帳使用 toAmount，否則使用 amount
        balance += t.toAmount ?? t.amount;
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
  return accounts
    .filter(account => account.type !== 'credit-card')
    .reduce((total, account) => {
      if (account.isVirtual) return total;
      return total + calculateAccountBalance(account, transactions);
    }, 0);
};
