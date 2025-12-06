/**
 * types/index.ts - 共用類型定義
 * 
 * 功能說明：
 * 1. 定義交易類型（TransactionType）
 * 2. 定義幣別介面（Currency）
 * 3. 定義交易介面（Transaction）
 * 4. 定義帳戶介面（Account）
 * 5. 定義分類介面（Category）
 * 6. 定義標籤介面（Tag）
 * 7. 定義商家介面（Merchant）
 * 8. 定義搜尋篩選介面（SearchFilters）
 */

/** 交易類型：支出、收入、轉帳、校正 */
export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment';

/** 幣別介面 */
export interface Currency {
export interface Currency {
  id: number;
  code: string;    // 幣別代碼，例如：TWD, USD
  name: string;    // 幣別名稱，例如：新台幣, 美元
  symbol: string;  // 幣別符號，例如：NT$, $
}

/** 交易記錄介面 */
export interface Transaction {
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
  fromAccount?: string;  // 轉帳用：轉出帳戶
  toAccount?: string;    // 轉帳用：轉入帳戶
  fee?: number;          // 轉帳手續費（從轉出帳戶扣除）
  exchangeRate?: number; // 跨幣別轉帳匯率（目標/來源）
  toAmount?: number;     // 跨幣別轉帳：轉入金額
}

/** 帳戶介面 */
export interface Account {
export interface Account {
  id: number;
  name: string;
  type: 'bank' | 'cash' | 'e-wallet' | 'credit-card' | 'other';
  balance: number;       // 初始餘額
  currency: string;      // 幣別代碼，例如 'TWD'
  isVirtual?: boolean;   // 虛擬帳戶不計入總資產
  group?: string;        // 分組標籤（選填）
  icon?: string;
  color?: string;
}

/** 分類介面 */
export interface Category {
export interface Category {
  id: number;
  name: string;
  type: 'expense' | 'income';
  icon?: string;
}

/** 標籤介面 */
export interface Tag {
  id: number;
  name: string;
  color?: string;
}

/** 商家介面 */
export interface Merchant {
  id: number;
  name: string;
  category?: string;
}

/** 搜尋篩選條件介面 */
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
