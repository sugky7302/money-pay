// Default data for the application

import { Transaction, Account, Category } from '../types';

export const DEFAULT_TRANSACTIONS: Transaction[] = [
  { 
    id: 1, 
    type: 'expense', 
    amount: 120, 
    category: '餐飲', 
    date: '2023-10-27', 
    note: '午餐便當',
    account: '現金'
  },
  { 
    id: 2, 
    type: 'expense', 
    amount: 45, 
    category: '交通', 
    date: '2023-10-27', 
    note: '捷運',
    account: '悠遊卡'
  },
];

export const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 1,
    name: '現金',
    type: 'cash',
    balance: 5000,
    color: '#10b981',
  },
  {
    id: 2,
    name: '悠遊卡',
    type: 'e-wallet',
    balance: 500,
    color: '#3b82f6',
  },
];

export const DEFAULT_CATEGORIES: Category[] = [
  // Expense categories
  { id: 1, name: '餐飲', type: 'expense' },
  { id: 2, name: '交通', type: 'expense' },
  { id: 3, name: '購物', type: 'expense' },
  { id: 4, name: '娛樂', type: 'expense' },
  { id: 5, name: '居住', type: 'expense' },
  { id: 6, name: '醫療', type: 'expense' },
  { id: 7, name: '教育', type: 'expense' },
  { id: 8, name: '其他', type: 'expense' },
  
  // Income categories
  { id: 9, name: '薪水', type: 'income' },
  { id: 10, name: '獎金', type: 'income' },
  { id: 11, name: '投資', type: 'income' },
  { id: 12, name: '兼職', type: 'income' },
  { id: 13, name: '紅包', type: 'income' },
  { id: 14, name: '其他', type: 'income' },
];
