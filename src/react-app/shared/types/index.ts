// Shared types for the budgeting app

export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';

// Supported currencies
export type Currency = 'TWD' | 'USD' | 'EUR' | 'JPY' | 'CNY' | 'HKD' | 'GBP' | 'KRW' | 'SGD' | 'THB';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  TWD: 'NT$',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  CNY: '¥',
  HKD: 'HK$',
  GBP: '£',
  KRW: '₩',
  SGD: 'S$',
  THB: '฿',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  TWD: '新台幣',
  USD: '美元',
  EUR: '歐元',
  JPY: '日圓',
  CNY: '人民幣',
  HKD: '港幣',
  GBP: '英鎊',
  KRW: '韓元',
  SGD: '新加坡元',
  THB: '泰銖',
};

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
  fee?: number;         // Transfer fee (deducted from source account)
  exchangeRate?: number; // Exchange rate for cross-currency transfers (target/source)
  toAmount?: number;     // Amount received in target account (for cross-currency transfers)
}

export interface Account {
  id: number;
  name: string;
  type: 'bank' | 'cash' | 'e-wallet' | 'credit-card' | 'other';
  balance: number;
  currency: Currency;
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
