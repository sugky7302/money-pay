// Home Page

import React, { useState } from 'react';
import { Cloud, RefreshCw, CreditCard, Search as SearchIcon } from 'lucide-react';
import { useAppContext } from '../../app/AppContext';
import { BalanceCard } from '../../widgets/balance-card/BalanceCard';
import { TransactionList } from '../../widgets/transaction-list/TransactionList';
import { Transaction } from '../../shared/types';
import { TransactionForm } from '../../features/transaction-form/TransactionForm';
import { Search } from '../../features/search/Search';

export const HomePage: React.FC = () => {
  const { transactions, lastSyncTime, syncData } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    setTimeout(() => setIsSyncing(false), 1500);
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };
  
  const handleSearch = (results: Transaction[]) => {
    setFilteredTransactions(results);
    setIsSearchActive(true);
  };
  
  const displayedTransactions = isSearchActive ? filteredTransactions : transactions;
  
  return (
    <div className="pb-24">
      <header className="px-6 pt-12 pb-6 bg-gradient-to-b from-gray-50 to-gray-100 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">我的資產</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white text-gray-500 shadow-sm hover:text-blue-500 transition-all"
            >
              <SearchIcon size={14}/>
              搜尋
            </button>
            <button 
              onClick={handleSync} 
              disabled={isSyncing}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                isSyncing ? 'bg-blue-100 text-blue-600' : 'bg-white text-gray-500 shadow-sm hover:text-blue-500'
              }`}
            >
              {isSyncing ? <RefreshCw className="animate-spin" size={14}/> : <Cloud size={14}/>}
              {isSyncing ? '備份中' : '備份'}
            </button>
          </div>
        </div>
        
        <BalanceCard />

        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/50 py-1 px-3 rounded-full w-fit backdrop-blur-sm">
          <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400 animate-pulse' : 'bg-green-500'}`} />
          狀態: {isSyncing ? '備份中...' : `上次備份 ${lastSyncTime}`}
        </div>
      </header>

      <div className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isSearchActive ? '搜尋結果' : '近期交易'}
          </h3>
          <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">
            {displayedTransactions.length} 筆
          </span>
        </div>
        
        {displayedTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CreditCard size={48} className="mx-auto mb-3 opacity-20" />
            <p>{isSearchActive ? '沒有符合的交易紀錄' : '目前沒有交易紀錄'}</p>
          </div>
        ) : (
          <TransactionList 
            transactions={displayedTransactions} 
            onEdit={handleEdit}
          />
        )}
      </div>
      
      <TransactionForm 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingTransaction(undefined);
        }}
        transaction={editingTransaction}
        mode="edit"
      />
      
      <Search
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};
