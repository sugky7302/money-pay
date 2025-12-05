// App context for state management

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Transaction, Account, Category, Tag, Merchant } from '../shared/types';
import { storage, DEFAULT_TRANSACTIONS, DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES } from '../shared/lib';

interface AppContextType {
  // State
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  merchants: Merchant[];
  lastSyncTime: string;
  isLoading: boolean;
  
  // Actions
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: number, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: number) => void;
  
  addAccount: (account: Account) => void;
  updateAccount: (id: number, account: Partial<Account>) => void;
  deleteAccount: (id: number) => void;
  
  addCategory: (category: Category) => void;
  deleteCategory: (id: number) => void;
  
  addTag: (tag: Tag) => void;
  deleteTag: (id: number) => void;
  
  addMerchant: (merchant: Merchant) => void;
  deleteMerchant: (id: number) => void;
  
  syncData: () => Promise<void>;
  clearAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState('尚未備份');
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize data from localStorage
  useEffect(() => {
    const loadInitialData = () => {
      const savedTransactions = storage.getTransactions();
      const savedAccounts = storage.getAccounts();
      const savedCategories = storage.getCategories();
      const savedTags = storage.getTags();
      const savedMerchants = storage.getMerchants();
      const savedSyncTime = storage.getLastSync();
      
      setTransactions(savedTransactions.length > 0 ? savedTransactions : DEFAULT_TRANSACTIONS);
      setAccounts(savedAccounts.length > 0 ? savedAccounts : DEFAULT_ACCOUNTS);
      setCategories(savedCategories.length > 0 ? savedCategories : DEFAULT_CATEGORIES);
      setTags(savedTags);
      setMerchants(savedMerchants);
      setLastSyncTime(savedSyncTime);
      setIsLoading(false);
    };
    
    loadInitialData();
  }, []);
  
  // Save to localStorage when data changes
  useEffect(() => {
    if (!isLoading) {
      storage.setTransactions(transactions);
    }
  }, [transactions, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setAccounts(accounts);
    }
  }, [accounts, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setCategories(categories);
    }
  }, [categories, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setTags(tags);
    }
  }, [tags, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setMerchants(merchants);
    }
  }, [merchants, isLoading]);
  
  // Transaction actions
  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    
    // Update account balances for transfers
    if (transaction.type === 'transfer' && transaction.fromAccount && transaction.toAccount) {
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          if (acc.name === transaction.fromAccount) {
            return { ...acc, balance: acc.balance - transaction.amount };
          }
          if (acc.name === transaction.toAccount) {
            return { ...acc, balance: acc.balance + transaction.amount };
          }
          return acc;
        })
      );
    }
  };
  
  const updateTransaction = (id: number, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prevTransactions =>
      prevTransactions.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
  };
  
  const deleteTransaction = (id: number) => {
    setTransactions(prevTransactions => prevTransactions.filter(t => t.id !== id));
  };
  
  // Account actions
  const addAccount = (account: Account) => {
    setAccounts([...accounts, account]);
  };
  
  const updateAccount = (id: number, updatedAccount: Partial<Account>) => {
    setAccounts(prevAccounts =>
      prevAccounts.map(a => a.id === id ? { ...a, ...updatedAccount } : a)
    );
  };
  
  const deleteAccount = (id: number) => {
    setAccounts(prevAccounts => prevAccounts.filter(a => a.id !== id));
  };
  
  // Category actions
  const addCategory = (category: Category) => {
    setCategories([...categories, category]);
  };
  
  const deleteCategory = (id: number) => {
    setCategories(prevCategories => prevCategories.filter(c => c.id !== id));
  };
  
  // Tag actions
  const addTag = (tag: Tag) => {
    setTags([...tags, tag]);
  };
  
  const deleteTag = (id: number) => {
    setTags(prevTags => prevTags.filter(t => t.id !== id));
  };
  
  // Merchant actions
  const addMerchant = (merchant: Merchant) => {
    setMerchants([...merchants, merchant]);
  };
  
  const deleteMerchant = (id: number) => {
    setMerchants(prevMerchants => prevMerchants.filter(m => m.id !== id));
  };
  
  // Sync data
  const syncData = async () => {
    // Create backup data
    const backupData = {
      transactions,
      accounts,
      categories,
      tags,
      merchants,
      exportDate: new Date().toISOString(),
    };
    
    // Download as JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `budget_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Update last sync time
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    setLastSyncTime(timeStr);
    storage.setLastSync(timeStr);
  };
  
  // Clear all data
  const clearAllData = () => {
    storage.clearAll();
    setTransactions([]);
    setAccounts([]);
    setCategories(DEFAULT_CATEGORIES);
    setTags([]);
    setMerchants([]);
    setLastSyncTime('尚未備份');
  };
  
  const value: AppContextType = {
    transactions,
    accounts,
    categories,
    tags,
    merchants,
    lastSyncTime,
    isLoading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addAccount,
    updateAccount,
    deleteAccount,
    addCategory,
    deleteCategory,
    addTag,
    deleteTag,
    addMerchant,
    deleteMerchant,
    syncData,
    clearAllData,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
