// Home Page

import { ArrowDownUp, Cloud, CreditCard, Filter, RefreshCw, Search as SearchIcon, X } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { Search } from '../../features/search/Search';
import { TransactionForm } from '../../features/transaction-form/TransactionForm';
import { useUIStore } from '../../shared/stores/useUIStore';
import { Transaction, TransactionType } from '../../shared/types';
import { BalanceCard } from '../../widgets/balance-card/BalanceCard';
import { TransactionList } from '../../widgets/transaction-list/TransactionList';

type SortOrder = 'newest' | 'oldest';
type FilterState = 'none' | 'include' | 'exclude';
const PAGE_SIZE = 20;

const TYPE_LABELS: Record<TransactionType, string> = {
  expense: '支出',
  income: '收入',
  transfer: '轉帳',
  adjustment: '校正',
};

export const HomePage: React.FC = () => {
  const { transactions, lastSyncTime, syncToCloud, isSyncing } = useAppContext();
  const { isSearchModalOpen, setSearchModalOpen } = useUIStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [displayLimit, setDisplayLimit] = useState<number>(PAGE_SIZE);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
  // 篩選狀態
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterTypeStates, setFilterTypeStates] = useState<Record<TransactionType, FilterState>>({
    expense: 'none',
    income: 'none',
    transfer: 'none',
    adjustment: 'none',
  });
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

  // 切換類型篩選狀態：none -> include -> exclude -> none
  const toggleFilterType = (type: TransactionType) => {
    setFilterTypeStates(prev => {
      const currentState = prev[type];
      const nextState: FilterState = 
        currentState === 'none' ? 'include' :
        currentState === 'include' ? 'exclude' : 'none';
      return { ...prev, [type]: nextState };
    });
  };

  // 取得所有類別（從交易中）
  const allCategories = useMemo(() => {
    const categorySet = new Set<string>();
    transactions.forEach(t => {
      if (t.category) categorySet.add(t.category);
    });
    return Array.from(categorySet).sort();
  }, [transactions]);

  // 取得包含和排除的類型（共用邏輯）
  const { includeTypes, excludeTypes } = useMemo(() => {
    const types = Object.keys(filterTypeStates) as TransactionType[];
    return {
      includeTypes: types.filter(type => filterTypeStates[type] === 'include'),
      excludeTypes: types.filter(type => filterTypeStates[type] === 'exclude'),
    };
  }, [filterTypeStates]);

  // 檢查是否有啟用篩選
  const hasActiveFilter = Object.values(filterTypeStates).some(state => state !== 'none') || filterCategory !== 'all';

  // 清除篩選
  const clearFilters = () => {
    const allTypes = Object.keys(TYPE_LABELS) as TransactionType[];
    setFilterTypeStates(
      Object.fromEntries(allTypes.map(type => [type, 'none'])) as Record<TransactionType, FilterState>
    );
    setFilterCategory('all');
  };

  // Sort and limit transactions
  const displayedTransactions = useMemo(() => {
    let sourceTransactions = isSearchActive ? filteredTransactions : transactions;
    
    // 套用類型篩選：如果有 include 篩選，只顯示這些類型
    if (includeTypes.length > 0) {
      sourceTransactions = sourceTransactions.filter(t => includeTypes.includes(t.type));
    }
    
    // 排除指定類型
    if (excludeTypes.length > 0) {
      sourceTransactions = sourceTransactions.filter(t => !excludeTypes.includes(t.type));
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
    return sorted.slice(0, displayLimit);
  }, [isSearchActive, filteredTransactions, transactions, sortOrder, displayLimit, includeTypes, excludeTypes, filterCategory]);

  // 篩選後的總數
  const filteredCount = useMemo(() => {
    let source = isSearchActive ? filteredTransactions : transactions;
    
    if (includeTypes.length > 0) {
      source = source.filter(t => includeTypes.includes(t.type));
    }
    
    if (excludeTypes.length > 0) {
      source = source.filter(t => !excludeTypes.includes(t.type));
    }
    
    if (filterCategory !== 'all') {
      source = source.filter(t => t.category === filterCategory);
    }
    return source.length;
  }, [isSearchActive, filteredTransactions, transactions, includeTypes, excludeTypes, filterCategory]);

  const totalCount = isSearchActive ? filteredTransactions.length : transactions.length;
  const canLoadMore = displayedTransactions.length < filteredCount;

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !canLoadMore) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setDisplayLimit(prev => {
            const next = prev + PAGE_SIZE;
            return next >= filteredCount ? filteredCount : next;
          });
        }
      });
    }, { rootMargin: '200px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [canLoadMore, filteredCount]);

  useEffect(() => {
    const updateHeight = () => setHeaderHeight(headerRef.current?.offsetHeight || 0);
    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);
  
  return (
    <div className="pb-24">
      <header ref={headerRef} className="px-6 pt-12 pb-6 bg-gradient-to-b from-gray-50 to-gray-100 sticky top-0 z-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">我的資產</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => setSearchModalOpen(true)}
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
        <div 
          className="flex justify-between items-center py-2 mb-4 sticky z-10 bg-white/90 backdrop-blur border-b border-gray-100"
          style={{ top: headerHeight }}
        >
          <h3 className="text-lg font-bold text-gray-800">
            {isSearchActive ? '搜尋結果' : '近期交易'}
          </h3>
          <div className="flex items-center gap-2">
            {/* Filter Button */}
            <div className="relative">
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
                    {Object.values(filterTypeStates).filter(state => state !== 'none').length + (filterCategory !== 'all' ? 1 : 0)}
                  </span>
                )}
              </button>
              
              {showFilterMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowFilterMenu(false)} 
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-20 min-w-[200px]">
                    {/* 類型篩選 */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">交易類型</label>
                      <div className="flex flex-wrap gap-1">
                        {(Object.keys(TYPE_LABELS) as TransactionType[]).map(type => {
                          const state = filterTypeStates[type];
                          return (
                            <button
                              key={type}
                              onClick={() => toggleFilterType(type)}
                              className={`px-2 py-1 text-xs rounded-md transition-colors ${
                                state === 'include' 
                                  ? 'bg-green-500 text-white' 
                                  : state === 'exclude' 
                                  ? 'bg-red-500 text-white' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              {TYPE_LABELS[type]}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* 類別篩選 */}
                    <div className="mb-3">
                      <label className="text-xs font-medium text-gray-500 mb-1.5 block">類別</label>
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">全部類別</option>
                        {allCategories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* 清除篩選 */}
                    {hasActiveFilter && (
                      <button
                        onClick={() => {
                          clearFilters();
                          setShowFilterMenu(false);
                        }}
                        className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-xs text-red-500 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                      >
                        <X size={12} />
                        清除篩選
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Sort Button */}
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              <ArrowDownUp size={12} />
              {sortOrder === 'newest' ? '最新' : '最舊'}
            </button>
            
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
            {(Object.keys(filterTypeStates) as TransactionType[]).map(type => {
              const state = filterTypeStates[type];
              if (state === 'none') return null;
              
              return (
                <span 
                  key={type}
                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${
                    state === 'include' 
                      ? 'bg-green-50 text-green-600' 
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {state === 'include' ? '✓' : '✗'} {TYPE_LABELS[type]}
                  <button 
                    onClick={() => toggleFilterType(type)} 
                    className={state === 'include' ? 'hover:text-green-800' : 'hover:text-red-800'}
                  >
                    <X size={12} />
                  </button>
                </span>
              );
            })}
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
        {canLoadMore && (
          <div ref={loadMoreRef} className="h-10" />
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
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSearch={handleSearch}
      />
    </div>
  );
};
