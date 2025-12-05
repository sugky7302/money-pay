// Home Page

import { ArrowDownUp, ChevronDown, Cloud, CreditCard, Filter, RefreshCw, Search as SearchIcon, X } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { Search } from '../../features/search/Search';
import { TransactionForm } from '../../features/transaction-form/TransactionForm';
import { Transaction, TransactionType } from '../../shared/types';
import { BalanceCard } from '../../widgets/balance-card/BalanceCard';
import { TransactionList } from '../../widgets/transaction-list/TransactionList';

type SortOrder = 'newest' | 'oldest';
type DisplayLimit = 10 | 20 | 50 | 100 | 'all';

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: '支出',
  income: '收入',
  transfer: '轉帳',
  adjustment: '校正',
};

export const HomePage: React.FC = () => {
  const { transactions, lastSyncTime, syncToCloud, isSyncing } = useAppContext();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [displayLimit, setDisplayLimit] = useState<DisplayLimit>(20);
  const [showLimitMenu, setShowLimitMenu] = useState(false);
  
  // 篩選狀態
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState<TransactionType | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  const handleSync = async () => {
    await syncToCloud();
  };
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditModal(true);
  };
  
  const handleSearch = (results: Transaction[]) => {
    setFilteredTransactions(results);
    setIsSearchActive(true);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest');
  };

  // 取得所有類別（從交易中）
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    transactions.forEach(t => {
      if (t.category) categorySet.add(t.category);
    });
    return Array.from(categorySet).sort();
  }, [transactions]);

  // 檢查是否有啟用篩選
  const hasActiveFilter = filterType !== 'all' || filterCategory !== 'all';

  // 清除篩選
  const clearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
  };

  // Sort and limit transactions
  const displayedTransactions = useMemo(() => {
    let sourceTransactions = isSearchActive ? filteredTransactions : transactions;
    
    // 套用類型篩選
    if (filterType !== 'all') {
      sourceTransactions = sourceTransactions.filter(t => t.type === filterType);
    }
    
    // 套用類別篩選
    if (filterCategory !== 'all') {
      sourceTransactions = sourceTransactions.filter(t => t.category === filterCategory);
    }
    
    // Sort by date
    const sorted = [...sourceTransactions].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
    
    // Apply limit
    if (displayLimit === 'all') {
      return sorted;
    }
    return sorted.slice(0, displayLimit);
  }, [isSearchActive, filteredTransactions, transactions, sortOrder, displayLimit, filterType, filterCategory]);

  // 篩選後的總數
  const filteredCount = useMemo(() => {
    let source = isSearchActive ? filteredTransactions : transactions;
    if (filterType !== 'all') {
      source = source.filter(t => t.type === filterType);
    }
    if (filterCategory !== 'all') {
      source = source.filter(t => t.category === filterCategory);
    }
    return source.length;
  }, [isSearchActive, filteredTransactions, transactions, filterType, filterCategory]);

  const totalCount = isSearchActive ? filteredTransactions.length : transactions.length;
  
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            {isSearchActive ? '搜尋結果' : '近期交易'}
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
                hasActiveFilter 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Filter size={12} />
              篩選
              {hasActiveFilter && (
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                  {(filterType !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort Button */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowDownUp size={12} />
              {sortOrder === 'newest' ? '最新' : '最舊'}
            </button>
            
            {/* Display Limit Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLimitMenu(!showLimitMenu)}
                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                {displayLimit === 'all' ? '全部' : `${displayLimit} 筆`}
                <ChevronDown size={12} />
              </button>
              
              {showLimitMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowLimitMenu(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 min-w-[80px]">
                    {([10, 20, 50, 100, 'all'] as DisplayLimit[]).map((limit) => (
                      <button
                        key={limit}
                        onClick={() => {
                          setDisplayLimit(limit);
                          setShowLimitMenu(false);
                        }}
                        className={`w-full px-3 py-1.5 text-left text-xs hover:bg-gray-50 transition-colors ${
                          displayLimit === limit ? 'text-blue-600 font-medium' : 'text-gray-600'
                        }`}
                      >
                        {limit === 'all' ? '全部' : `${limit} 筆`}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            {/* Count Badge */}
            <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded-md">
              {displayedTransactions.length === filteredCount 
                ? `${filteredCount} 筆` 
                : `${displayedTransactions.length}/${filteredCount} 筆`}
              {hasActiveFilter && filteredCount !== totalCount && (
                <span className="text-gray-300"> (共 {totalCount})</span>
              )}
            </span>
          </div>
        </div>
        
        {/* Active Filter Tags */}
        {hasActiveFilter && (
          <div className="flex flex-wrap gap-2 mb-3">
            {filterType !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                {TYPE_LABELS[filterType]}
                <button onClick={() => setFilterType('all')} className="hover:text-blue-800">
                  <X size={12} />
                </button>
              </span>
            )}
            {filterCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-full">
                {filterCategory}
                <button onClick={() => setFilterCategory('all')} className="hover:text-blue-800">
                  <X size={12} />
                </button>
              </span>
            )}
          </div>
        )}
        
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

      {/* Filter Modal - 從底部滑出 */}
      {showFilterMenu && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div 
            className="absolute inset-0 bg-black/30" 
            onClick={() => setShowFilterMenu(false)} 
          />
          <div className="relative bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">篩選交易</h3>
              <button 
                onClick={() => setShowFilterMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* 類型篩選 */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">交易類型</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                    filterType === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {(Object.keys(TYPE_LABELS) as TransactionType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-2 text-sm rounded-xl transition-colors ${
                      filterType === type ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* 類別篩選 */}
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-600 mb-2 block">類別</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              >
                <option value="all">全部類別</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* 按鈕 */}
            <div className="flex gap-3">
              {hasActiveFilter && (
                <button
                  onClick={clearFilters}
                  className="flex-1 py-3 text-sm text-red-500 bg-red-50 rounded-xl hover:bg-red-100 transition-colors"
                >
                  清除篩選
                </button>
              )}
              <button
                onClick={() => setShowFilterMenu(false)}
                className="flex-1 py-3 text-sm text-white bg-blue-500 rounded-xl hover:bg-blue-600 transition-colors"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
