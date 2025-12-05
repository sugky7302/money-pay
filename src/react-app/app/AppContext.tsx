// App context for state management

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { DEFAULT_ACCOUNTS, DEFAULT_CATEGORIES, DEFAULT_TRANSACTIONS, googleSheetsService, storage } from '../shared/lib';
import { Account, Category, Merchant, Tag, Transaction } from '../shared/types';

// Auto-sync debounce delay (30 seconds to avoid rate limiting)
const AUTO_SYNC_DELAY = 30000;
// Minimum interval between syncs (60 seconds)
const MIN_SYNC_INTERVAL = 60000;

interface AppContextType {
  // State
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  tags: Tag[];
  merchants: Merchant[];
  lastSyncTime: string;
  isLoading: boolean;
  isSyncing: boolean;
  autoSyncEnabled: boolean;
  
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
  
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  downloadBackup: () => void;
  clearAllData: () => void;
  toggleAutoSync: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState('尚未備份');
  const [isLoading, setIsLoading] = useState(true);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  
  // Ref for debounce timer
  const syncTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to track if initial load is complete
  const initialLoadComplete = useRef(false);
  // Ref to track last sync time for rate limiting
  const lastSyncTimeRef = useRef<number>(0);
  // Ref to store current data for sync
  const dataRef = useRef({ transactions: [] as Transaction[], accounts: [] as Account[], categories: [] as Category[], tags: [] as Tag[], merchants: [] as Merchant[] });

  // Update data ref when state changes
  useEffect(() => {
    dataRef.current = { transactions, accounts, categories, tags, merchants };
  }, [transactions, accounts, categories, tags, merchants]);

  // Silent sync function (no alerts, for auto-sync)
  const performAutoSync = useCallback(async () => {
    if (isSyncing) return;

    // Check minimum interval
    const now = Date.now();
    if (now - lastSyncTimeRef.current < MIN_SYNC_INTERVAL) {
      console.log('Skipping sync - too soon since last sync');
      // Schedule another sync after the minimum interval
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
      syncTimerRef.current = setTimeout(() => {
        performAutoSync();
      }, MIN_SYNC_INTERVAL - (now - lastSyncTimeRef.current));
      return;
    }
    
    setIsSyncing(true);
    
    try {
      const backupData = {
        ...dataRef.current,
        exportDate: new Date().toISOString(),
      };
      
      await googleSheetsService.saveToGoogleSheets(backupData);
      
      lastSyncTimeRef.current = Date.now();
      
      // Update last sync time
      const nowDate = new Date();
      const timeStr = `${nowDate.getFullYear()}/${(nowDate.getMonth()+1).toString().padStart(2, '0')}/${nowDate.getDate().toString().padStart(2, '0')} ${nowDate.getHours().toString().padStart(2, '0')}:${nowDate.getMinutes().toString().padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      storage.setLastSync(timeStr);
      
      console.log('Auto-sync completed:', timeStr);
    } catch (error) {
      console.error('Auto-sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing]);

  // Trigger auto-sync with debounce
  const scheduleAutoSync = useCallback(() => {
    if (!autoSyncEnabled || !initialLoadComplete.current) return;
    
    // Clear existing timer
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
    }
    
    // Schedule sync after delay
    syncTimerRef.current = setTimeout(() => {
      performAutoSync();
    }, AUTO_SYNC_DELAY);
  }, [autoSyncEnabled, performAutoSync]);
  
  // Initialize data from localStorage
  useEffect(() => {
    const loadInitialData = () => {
      const savedTransactions = storage.getTransactions();
      const savedAccounts = storage.getAccounts();
      const savedCategories = storage.getCategories();
      const savedTags = storage.getTags();
      const savedMerchants = storage.getMerchants();
      const savedSyncTime = storage.getLastSync();
      const savedAutoSync = storage.getAutoSyncEnabled();
      
      setTransactions(savedTransactions.length > 0 ? savedTransactions : DEFAULT_TRANSACTIONS);
      setAccounts(savedAccounts.length > 0 ? savedAccounts : DEFAULT_ACCOUNTS);
      setCategories(savedCategories.length > 0 ? savedCategories : DEFAULT_CATEGORIES);
      setTags(savedTags);
      setMerchants(savedMerchants);
      setLastSyncTime(savedSyncTime);
      setAutoSyncEnabled(savedAutoSync);
      setIsLoading(false);
      
      // Mark initial load as complete after a short delay
      setTimeout(() => {
        initialLoadComplete.current = true;
      }, 1000);
    };
    
    loadInitialData();
    
    // Cleanup timer on unmount
    return () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
      }
    };
  }, []);
  
  // Save to localStorage when data changes and trigger auto-sync
  useEffect(() => {
    if (!isLoading) {
      storage.setTransactions(transactions);
      scheduleAutoSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setAccounts(accounts);
      scheduleAutoSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setCategories(categories);
      scheduleAutoSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setTags(tags);
      scheduleAutoSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tags, isLoading]);
  
  useEffect(() => {
    if (!isLoading) {
      storage.setMerchants(merchants);
      scheduleAutoSync();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchants, isLoading]);
  
  // Transaction actions
  const addTransaction = (transaction: Transaction) => {
    setTransactions([transaction, ...transactions]);
    
    // Update account balances
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
    } else if (transaction.account) {
      // Update account balance for regular income/expense transactions
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => {
          if (acc.name === transaction.account) {
            const balanceChange = transaction.type === 'income' 
              ? transaction.amount 
              : -transaction.amount;
            return { ...acc, balance: acc.balance + balanceChange };
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
  
  // Sync to Google Sheets
  const syncToCloud = async () => {
    setIsSyncing(true);
    try {
      const backupData = {
        transactions,
        accounts,
        categories,
        tags,
        merchants,
        exportDate: new Date().toISOString(),
      };
      
      await googleSheetsService.saveToGoogleSheets(backupData);
      
      // Update last sync time
      const now = new Date();
      const timeStr = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      setLastSyncTime(timeStr);
      storage.setLastSync(timeStr);
      
      alert('已成功同步到 Google Drive！');
    } catch (error) {
      console.error('Sync to cloud failed:', error);
      alert(`同步失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Load from Google Sheets
  const loadFromCloud = async () => {
    setIsSyncing(true);
    try {
      const data = await googleSheetsService.loadFromGoogleSheets();
      
      if (data) {
        setTransactions(data.transactions);
        setAccounts(data.accounts);
        setCategories(data.categories);
        setTags(data.tags);
        setMerchants(data.merchants);
        
        // Update last sync time
        const now = new Date();
        const timeStr = `${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        setLastSyncTime(timeStr);
        storage.setLastSync(timeStr);
        
        alert('已成功從 Google Drive 載入資料！');
      } else {
        alert('Google Drive 中尚無備份資料');
      }
    } catch (error) {
      console.error('Load from cloud failed:', error);
      alert(`載入失敗：${error instanceof Error ? error.message : '未知錯誤'}`);
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Download backup as JSON file
  const downloadBackup = () => {
    const backupData = {
      transactions,
      accounts,
      categories,
      tags,
      merchants,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `budget_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
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

  // Toggle auto-sync
  const toggleAutoSync = () => {
    const newValue = !autoSyncEnabled;
    setAutoSyncEnabled(newValue);
    storage.setAutoSyncEnabled(newValue);
  };
  
  const value: AppContextType = {
    transactions,
    accounts,
    categories,
    tags,
    merchants,
    lastSyncTime,
    isLoading,
    isSyncing,
    autoSyncEnabled,
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
    syncToCloud,
    loadFromCloud,
    downloadBackup,
    clearAllData,
    toggleAutoSync,
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
