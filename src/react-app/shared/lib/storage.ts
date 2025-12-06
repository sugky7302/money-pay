/**
 * storage.ts - 本地儲存管理模組
 * 
 * 功能說明：
 * 1. 交易記錄的儲存與讀取
 * 2. 帳戶資料的儲存與讀取
 * 3. 分類資料的儲存與讀取
 * 4. 標籤資料的儲存與讀取
 * 5. 商家資料的儲存與讀取
 * 6. 幣別資料的儲存與讀取
 * 7. 認證 Token 的儲存與讀取
 * 8. 使用者資訊的儲存與讀取
 * 9. 同步設定的儲存與讀取
 * 10. 資料清除功能
 */

import { Account, Category, Currency, Merchant, Tag, Transaction } from '../types';

/** localStorage 儲存鍵定義 */
const STORAGE_KEYS = {
  TRANSACTIONS: 'cloudbudget_transactions',
  ACCOUNTS: 'cloudbudget_accounts',
  CATEGORIES: 'cloudbudget_categories',
  TAGS: 'cloudbudget_tags',
  MERCHANTS: 'cloudbudget_merchants',
  CURRENCIES: 'cloudbudget_currencies',
  LAST_SYNC: 'cloudbudget_last_sync',
  AUTH_TOKEN: 'cloudbudget_auth_token',
  AUTH_TOKEN_EXPIRES_AT: 'cloudbudget_auth_token_expires_at',
  USER_INFO: 'cloudbudget_user_info',
  AUTO_SYNC_ENABLED: 'cloudbudget_auto_sync_enabled',
};

/** 本地儲存管理服務 */
export const storage = {
  // ===== 交易記錄 =====
  
  /** 取得所有交易記錄 */
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  /** 儲存交易記錄 */
  setTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  
  // ===== 帳戶 =====
  
  /** 取得所有帳戶 */
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  
  /** 儲存帳戶 */
  setAccounts: (accounts: Account[]): void => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  
  // ===== 分類 =====
  
  /** 取得所有分類 */
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  
  /** 儲存分類 */
  setCategories: (categories: Category[]): void => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  
  // ===== 標籤 =====
  
  /** 取得所有標籤 */
  getTags: (): Tag[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  },
  
  /** 儲存標籤 */
  setTags: (tags: Tag[]): void => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  },
  
  // ===== 商家 =====
  
  /** 取得所有商家 */
  getMerchants: (): Merchant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return data ? JSON.parse(data) : [];
  },
  
  /** 儲存商家 */
  setMerchants: (merchants: Merchant[]): void => {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  },

  // ===== 幣別 =====
  
  /** 取得所有幣別 */
  getCurrencies: (): Currency[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENCIES);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing currencies from localStorage', e);
        return [];
      }
    }
    return [];
  },

  /** 儲存幣別 */
  setCurrencies: (currencies: Currency[]): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  },
  
  // ===== 同步設定 =====
  
  /** 取得上次同步時間 */
  getLastSync: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '尚未備份';
  },
  
  /** 設定上次同步時間 */
  setLastSync: (time: string): void => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, time);
  },
  
  // ===== 資料清除 =====
  
  /** 清除所有資料（保留認證資訊） */
  clearAll: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => {
      // Keep auth info
      if (
        key !== STORAGE_KEYS.AUTH_TOKEN &&
        key !== STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT &&
        key !== STORAGE_KEYS.USER_INFO &&
        key !== STORAGE_KEYS.AUTO_SYNC_ENABLED
      ) {
        localStorage.removeItem(key);
      }
    });
  },
  
  // ===== 認證 =====
  
  /** 取得認證 Token */
  getAuthToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  /** 儲存認證 Token */
  setAuthToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  /** 移除認證 Token */
  removeAuthToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /** 取得 Token 過期時間戳記 */
  getAuthTokenExpiresAt: (): number | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT);
    const parsed = data ? Number(data) : NaN;
    return isNaN(parsed) ? null : parsed;
  },

  /** 設定 Token 過期時間戳記 */
  setAuthTokenExpiresAt: (timestamp: number): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT, String(timestamp));
  },

  /** 移除 Token 過期時間戳記 */
  removeAuthTokenExpiresAt: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT);
  },
  
  /** 取得使用者資訊 */
  getUserInfo: (): { name: string; email: string; picture: string } | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return data ? JSON.parse(data) : null;
  },
  
  /** 儲存使用者資訊 */
  setUserInfo: (userInfo: { name: string; email: string; picture: string }): void => {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  },
  
  /** 移除使用者資訊 */
  removeUserInfo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },

  // ===== 自動同步設定 =====
  
  /** 取得自動同步開關狀態（預設啟用） */
  getAutoSyncEnabled: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC_ENABLED);
    return data === null ? true : data === 'true'; // Default to true
  },

  /** 設定自動同步開關狀態 */
  setAutoSyncEnabled: (enabled: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC_ENABLED, String(enabled));
  },
};
