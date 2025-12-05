// Local storage management

import { Account, Category, Currency, Merchant, Tag, Transaction } from '../types';

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

export const storage = {
  // Transactions
  getTransactions: (): Transaction[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  setTransactions: (transactions: Transaction[]): void => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  },
  
  // Accounts
  getAccounts: (): Account[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return data ? JSON.parse(data) : [];
  },
  
  setAccounts: (accounts: Account[]): void => {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },
  
  // Categories
  getCategories: (): Category[] => {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return data ? JSON.parse(data) : [];
  },
  
  setCategories: (categories: Category[]): void => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  },
  
  // Tags
  getTags: (): Tag[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TAGS);
    return data ? JSON.parse(data) : [];
  },
  
  setTags: (tags: Tag[]): void => {
    localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
  },
  
  // Merchants
  getMerchants: (): Merchant[] => {
    const data = localStorage.getItem(STORAGE_KEYS.MERCHANTS);
    return data ? JSON.parse(data) : [];
  },
  
  setMerchants: (merchants: Merchant[]): void => {
    localStorage.setItem(STORAGE_KEYS.MERCHANTS, JSON.stringify(merchants));
  },

  // Currencies
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

  setCurrencies: (currencies: Currency[]): void => {
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));
  },
  
  // Last Sync
  getLastSync: (): string => {
    return localStorage.getItem(STORAGE_KEYS.LAST_SYNC) || '尚未備份';
  },
  
  setLastSync: (time: string): void => {
    localStorage.setItem(STORAGE_KEYS.LAST_SYNC, time);
  },
  
  // Clear all data
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
  
  // Authentication
  getAuthToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
  
  setAuthToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },
  
  removeAuthToken: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  getAuthTokenExpiresAt: (): number | null => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT);
    const parsed = data ? Number(data) : NaN;
    return isNaN(parsed) ? null : parsed;
  },

  setAuthTokenExpiresAt: (timestamp: number): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT, String(timestamp));
  },

  removeAuthTokenExpiresAt: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN_EXPIRES_AT);
  },
  
  getUserInfo: (): { name: string; email: string; picture: string } | null => {
    const data = localStorage.getItem(STORAGE_KEYS.USER_INFO);
    return data ? JSON.parse(data) : null;
  },
  
  setUserInfo: (userInfo: { name: string; email: string; picture: string }): void => {
    localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  },
  
  removeUserInfo: (): void => {
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
  },

  // Auto-sync settings
  getAutoSyncEnabled: (): boolean => {
    const data = localStorage.getItem(STORAGE_KEYS.AUTO_SYNC_ENABLED);
    return data === null ? true : data === 'true'; // Default to true
  },

  setAutoSyncEnabled: (enabled: boolean): void => {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC_ENABLED, String(enabled));
  },
};
