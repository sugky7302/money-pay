// Reports Page

import { BarChart3, Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { formatCurrency } from '../../shared/lib/utils';

interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

type SortOption = 'month' | 'income' | 'expense' | 'balance';

export const ReportsPage: React.FC = () => {
  const { transactions } = useAppContext();
  const [selectedPeriod, setSelectedPeriod] = useState<'6months' | '12months' | 'custom'>('6months');
  const [customStartMonth, setCustomStartMonth] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 5);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [customEndMonth, setCustomEndMonth] = useState<string>(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });
  const [sortBy, setSortBy] = useState<SortOption>('month');

  const parsedMonthRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    const parseMonthString = (value: string) => {
      const [y, m] = value.split('-').map(Number);
      if (!y || !m) return undefined;
      return new Date(y, m - 1, 1);
    };

    let rangeStart = new Date(start);
    let rangeEnd = new Date(end);

    if (selectedPeriod === '6months') {
      rangeStart.setMonth(rangeStart.getMonth() - 5);
    } else if (selectedPeriod === '12months') {
      rangeStart.setMonth(rangeStart.getMonth() - 11);
    } else {
      const parsedStart = parseMonthString(customStartMonth);
      const parsedEnd = parseMonthString(customEndMonth);

      if (parsedStart) rangeStart = parsedStart;
      if (parsedEnd) rangeEnd = parsedEnd;
      if (rangeEnd < rangeStart) {
        rangeEnd = new Date(rangeStart);
      }
    }

    const monthRange: Date[] = [];
    const cursor = new Date(rangeStart);
    while (cursor <= rangeEnd) {
      monthRange.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }

    const toMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    return {
      startKey: toMonthKey(rangeStart),
      endKey: toMonthKey(rangeEnd),
      monthRange,
    };
  }, [selectedPeriod, customStartMonth, customEndMonth]);
  
  // Calculate monthly data for trends
  const monthlyData = useMemo((): MonthlyData[] => {
    const data: { [key: string]: MonthlyData } = {};
    
    // Initialize months within range (use local month key to avoid timezone shift)
    parsedMonthRange.monthRange.forEach(date => {
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'short' });
      data[monthKey] = {
        month: monthLabel,
        income: 0,
        expense: 0,
        balance: 0,
      };
    });
    
    // Aggregate transactions by month within range
    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7);
      if (monthKey >= parsedMonthRange.startKey && monthKey <= parsedMonthRange.endKey && data[monthKey]) {
        if (t.type === 'income') {
          data[monthKey].income += t.amount;
        } else if (t.type === 'expense') {
          data[monthKey].expense += t.amount;
        }
      }
    });
    
    // Calculate balance
    Object.values(data).forEach(d => {
      d.balance = d.income - d.expense;
    });
    
    const result = Object.values(data);
    
    // Apply sorting
    switch (sortBy) {
      case 'income':
        return [...result].sort((a, b) => b.income - a.income);
      case 'expense':
        return [...result].sort((a, b) => b.expense - a.expense);
      case 'balance':
        return [...result].sort((a, b) => b.balance - a.balance);
      case 'month':
      default:
        // Already in chronological order
        return result;
    }
  }, [transactions, parsedMonthRange, sortBy]);
  
  // Calculate top expense categories for the selected period
  const topExpenseCategories = useMemo((): CategoryData[] => {
    const categoryTotals: { [key: string]: number } = {};
    let totalExpense = 0;
    
    // Filter transactions by selected period
    transactions.forEach(t => {
      const monthKey = t.date.slice(0, 7);
      if (
        t.type === 'expense' &&
        monthKey >= parsedMonthRange.startKey &&
        monthKey <= parsedMonthRange.endKey
      ) {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalExpense += t.amount;
      }
    });
    
    const categories = Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    return categories;
  }, [transactions, parsedMonthRange]);
  
  // Calculate overall stats
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
  const netBalance = totalIncome - totalExpense;
  const avgMonthlyExpense = monthlyData.length > 0 ? totalExpense / monthlyData.length : 0;
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;
  
  // Find max value for chart scaling
  const maxAmount = Math.max(1, ...monthlyData.map(m => Math.max(m.income, m.expense)));
  
  return (
    <div className="pb-24 pt-12 px-4 sm:px-6 lg:px-10 max-w-5xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">收支報表</h1>
        <p className="text-sm text-gray-500">統計分析與趨勢圖表</p>
      </header>
      
      {/* Period Selector */}
      <div className="flex flex-wrap gap-2 mb-2">
        <button
          onClick={() => setSelectedPeriod('6months')}
          className={`flex-1 min-w-[120px] sm:w-auto py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
            selectedPeriod === '6months'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          近 6 個月
        </button>
        <button
          onClick={() => setSelectedPeriod('12months')}
          className={`flex-1 min-w-[120px] sm:w-auto py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
            selectedPeriod === '12months'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          近 12 個月
        </button>
        <button
          onClick={() => setSelectedPeriod('custom')}
          className={`flex-1 min-w-[120px] sm:w-auto py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
            selectedPeriod === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          自訂區間
        </button>
      </div>
      {selectedPeriod === 'custom' && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <input
              type="month"
              value={customStartMonth}
              onChange={(e) => setCustomStartMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          <span className='text-sm text-gray-700'>到</span>
            <input
              type="month"
              value={customEndMonth}
              onChange={(e) => setCustomEndMonth(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
        </div>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-medium">總收入</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalIncome).replace('NT$', '')}</p>
          <p className="text-xs text-gray-400 mt-1">平均 {formatCurrency(avgMonthlyIncome).replace('NT$', '')}/月</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-red-600 mb-2">
            <TrendingDown size={16} />
            <span className="text-xs font-medium">總支出</span>
          </div>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(totalExpense).replace('NT$', '')}</p>
          <p className="text-xs text-gray-400 mt-1">平均 {formatCurrency(avgMonthlyExpense).replace('NT$', '')}/月</p>
        </div>
        
        <div className="bg-linear-to-br from-blue-500 to-blue-600 p-4 rounded-2xl shadow-sm col-span-2 sm:col-span-3">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <BarChart3 size={16} />
            <span className="text-xs font-medium">淨收支</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance).replace('NT$', '')}
          </p>
          <p className="text-xs text-white/70 mt-1">
            {netBalance >= 0 ? '收入大於支出' : '支出大於收入'}
          </p>
        </div>
      </div>
      
      {/* Trend Chart */}
      <section className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">收支趨勢</h2>
          </div>
          
          {/* Sort Buttons */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setSortBy('month')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'month'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="按月份排序"
            >
              月份
            </button>
            <button
              onClick={() => setSortBy('income')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'income'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="按收入排序"
            >
              收入
            </button>
            <button
              onClick={() => setSortBy('expense')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'expense'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="按支出排序"
            >
              支出
            </button>
            <button
              onClick={() => setSortBy('balance')}
              className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                sortBy === 'balance'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title="按結餘排序"
            >
              結餘
            </button>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-medium text-gray-600">{data.month}</span>
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-600">+{formatCurrency(data.income).replace('NT$', '')}</span>
                    <span className="text-red-600">-{formatCurrency(data.expense).replace('NT$', '')}</span>
                  </div>
                </div>
                <div className="flex h-8">
                  <div 
                    className="bg-green-500 rounded-l-full transition-all"
                    style={{ width: `${maxAmount > 0 ? (data.income / maxAmount) * 100 : 0}%` }}
                    title={`收入: ${formatCurrency(data.income)}`}
                  />
                  <div 
                    className="bg-red-500 rounded-r-full transition-all"
                    style={{ width: `${maxAmount > 0 ? (data.expense / maxAmount) * 100 : 0}%` }}
                    title={`支出: ${formatCurrency(data.expense)}`}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs text-gray-600">收入</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-xs text-gray-600">支出</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Top Categories */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={20} className="text-gray-700" />
          <h2 className="text-lg font-bold text-gray-800">支出分類排行</h2>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          {topExpenseCategories.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">尚無支出資料</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topExpenseCategories.map((cat, index) => (
                <div key={cat.category}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className="text-sm font-medium text-gray-800">{cat.category}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatCurrency(cat.amount).replace('NT$', '')}</p>
                      <p className="text-xs text-gray-400">{cat.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-linear-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
