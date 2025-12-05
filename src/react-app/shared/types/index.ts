// Shared types for the budgeting app

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  note?: string;
  tags?: string[];
  merchant?: string;
  account?: string;
  fromAccount?: string; // For transfers
  toAccount?: string;   // For transfers
}

export interface Account {
  id: number;
  name: string;
  type: 'bank' | 'cash' | 'e-wallet' | 'credit-card' | 'other';
  balance: number;
  icon?: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
}

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Merchant {
  id: number;
  name: string;
  category?: string;
}

export interface SearchFilters {
  startDate?: string;
  endDate?: string;
  tags?: string[];
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
  account?: string;
}
