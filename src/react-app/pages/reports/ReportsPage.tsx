/**
 * ReportsPage.tsx - 報表頁面
 * 
 * 功能說明：
 * 1. 顯示收支統計摘要
 * 2. 提供月份/時間範圍選擇
 * 3. 顯示分類支出排行
 * 4. 計算平均月支出/收入
 * 5. 顯示淨收支狀況
 * 6. 支援自訂時間範圍
 * 7. AI 收支建議
 */

import { BarChart3, Calendar, TrendingDown, TrendingUp, PieChart, List, Tags as TagsIcon, Sparkles, RefreshCw } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useAppContext } from '../../app/AppContext';
import { getAiAdvice, AiAdviceRequest } from '../../shared/lib/aiAdvice';
import { formatCurrency } from '../../shared/lib/utils';
import { CategoryPieChart } from './ui/CategoryPieChart';

/** 月度資料介面 */
interface MonthlyData {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

/** 分類資料介面 */
interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

/** 排序選項 */
type SortOption = 'month' | 'income' | 'expense' | 'balance';

type CategoryView = 'list' | 'pie';
type TagView = 'list' | 'pie';

/**
 * 報表頁面組件
 * 顯示收支統計和分析
 * @returns 報表頁面 UI
 */
export const ReportsPage: React.FC = () => {
  const { transactions, accounts } = useAppContext();
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
  const [categoryView, setCategoryView] = useState<CategoryView>('list');
  const [tagView, setTagView] = useState<TagView>('list');
  
  // AI 建議狀態
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [adviceSource, setAdviceSource] = useState<'ai' | 'fallback' | 'error' | ''>('');

  const filteredTransactions = useMemo(() => {
    const creditCardAccountNames = accounts
      .filter(a => a.type === 'credit-card')
      .map(a => a.name);

    return transactions.filter(t => {
      if (t.type === 'transfer' && t.toAccount && creditCardAccountNames.includes(t.toAccount)) {
        return false; // Exclude credit card payments
      }
      return true;
    });
  }, [transactions, accounts]);

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
    filteredTransactions.forEach(t => {
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
  }, [filteredTransactions, parsedMonthRange, sortBy]);
  
  // Calculate top expense categories for the selected period
  const { categoryTotalsList, categoryTotalExpense } = useMemo(() => {
    const categoryTotals: { [key: string]: number } = {};
    let totalExpense = 0;
    
    // Filter transactions by selected period
    filteredTransactions.forEach(t => {
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
    
    const categoryTotalsList = Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    return { categoryTotalsList, categoryTotalExpense: totalExpense };
  }, [filteredTransactions, parsedMonthRange]);

  const topExpenseCategories = useMemo((): CategoryData[] => {
    return categoryTotalsList.slice(0, 5).map((item) => ({
      ...item,
      percentage: categoryTotalExpense > 0 ? (item.amount / categoryTotalExpense) * 100 : 0,
    }));
  }, [categoryTotalsList, categoryTotalExpense]);

  const categoryChartData = useMemo((): CategoryData[] => {
    return categoryTotalsList.map((item) => ({
      ...item,
      percentage: categoryTotalExpense > 0 ? (item.amount / categoryTotalExpense) * 100 : 0,
    }));
  }, [categoryTotalsList, categoryTotalExpense]);

  const topExpenseTags = useMemo((): (CategoryData & { count: number })[] => {
    const tagTotals: Record<string, { amount: number; count: number }> = {};
    let totalExpense = 0;

    filteredTransactions.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      if (
        t.type === 'expense' &&
        monthKey >= parsedMonthRange.startKey &&
        monthKey <= parsedMonthRange.endKey &&
        t.tags?.length
      ) {
        totalExpense += t.amount;
        t.tags.forEach((tag) => {
          if (!tagTotals[tag]) {
            tagTotals[tag] = { amount: 0, count: 0 };
          }
          tagTotals[tag].amount += t.amount;
          tagTotals[tag].count += 1;
        });
      }
    });

    const tags = Object.entries(tagTotals)
      .map(([tag, info]) => ({
        category: tag,
        amount: info.amount,
        percentage: totalExpense > 0 ? (info.amount / totalExpense) * 100 : 0,
        count: info.count,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return tags;
  }, [filteredTransactions, parsedMonthRange]);
  
  // Calculate overall stats
  const totalIncome = monthlyData.reduce((sum, m) => sum + m.income, 0);
  const totalExpense = monthlyData.reduce((sum, m) => sum + m.expense, 0);
  const netBalance = totalIncome - totalExpense;
  const avgMonthlyExpense = monthlyData.length > 0 ? totalExpense / monthlyData.length : 0;
  const avgMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0;

  // 期間標籤
  const periodLabel = useMemo(() => {
    if (selectedPeriod === '6months') return '近 6 個月';
    if (selectedPeriod === '12months') return '近 12 個月';
    return `${customStartMonth} ~ ${customEndMonth}`;
  }, [selectedPeriod, customStartMonth, customEndMonth]);

  /**
   * 取得 AI 收支建議
   */
  const fetchAiAdvice = useCallback(async () => {
    setIsLoadingAdvice(true);
    setAiAdvice('');
    setAdviceSource('');

    const requestData: AiAdviceRequest = {
      totalIncome,
      totalExpense,
      netBalance,
      avgMonthlyExpense,
      avgMonthlyIncome,
      topCategories: topExpenseCategories,
      monthlyTrend: monthlyData.map(m => ({
        month: m.month,
        income: m.income,
        expense: m.expense,
      })),
      period: periodLabel,
    };

    const result = await getAiAdvice(requestData);
    setAiAdvice(result.advice);
    setAdviceSource(result.source);
    setIsLoadingAdvice(false);
  }, [totalIncome, totalExpense, netBalance, avgMonthlyExpense, avgMonthlyIncome, topExpenseCategories, monthlyData, periodLabel]);
  
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
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">支出分類排行</h2>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setCategoryView('list')} className={`p-1.5 rounded-md ${categoryView === 'list' ? 'bg-white shadow' : ''}`}><List size={16} /></button>
            <button onClick={() => setCategoryView('pie')} className={`p-1.5 rounded-md ${categoryView === 'pie' ? 'bg-white shadow' : ''}`}><PieChart size={16} /></button>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          {topExpenseCategories.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">尚無支出資料</p>
            </div>
          ) : (
            <>
              {categoryView === 'list' && (
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
              {categoryView === 'pie' && <CategoryPieChart data={categoryChartData} />}
            </>
          )}
        </div>
      </section>

      {/* Top Tags */}
      <section className="mt-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TagsIcon size={20} className="text-gray-700" />
            <h2 className="text-lg font-bold text-gray-800">支出標籤排行</h2>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTagView('list')}
              className={`p-1.5 rounded-md ${tagView === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setTagView('pie')}
              className={`p-1.5 rounded-md ${tagView === 'pie' ? 'bg-white shadow' : ''}`}
            >
              <PieChart size={16} />
            </button>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100">
          {topExpenseTags.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <p className="text-sm">尚無標籤資料</p>
            </div>
          ) : (
            <>
              {tagView === 'list' && (
                <div className="space-y-4">
                  {topExpenseTags.map((tag, index) => (
                    <div key={tag.category}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                          <span className="text-sm font-medium text-gray-800">{tag.category}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatCurrency(tag.amount).replace('NT$', '')}</p>
                          <p className="text-xs text-gray-400">{tag.percentage.toFixed(1)}% · {tag.count} 筆</p>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-linear-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                          style={{ width: `${tag.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {tagView === 'pie' && <CategoryPieChart data={topExpenseTags} />}
            </>
          )}
        </div>
      </section>

      {/* AI 收支建議 */}
      <section className="mt-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-purple-600" />
            <h2 className="text-lg font-bold text-gray-800">AI 收支建議</h2>
          </div>
          <button
            onClick={fetchAiAdvice}
            disabled={isLoadingAdvice || transactions.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isLoadingAdvice || transactions.length === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isLoadingAdvice ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Sparkles size={14} />
                取得建議
              </>
            )}
          </button>
        </div>

        <div className="bg-linear-to-br from-purple-50 to-indigo-50 p-4 sm:p-5 rounded-2xl shadow-sm border border-purple-100">
          {!aiAdvice && !isLoadingAdvice && (
            <div className="text-center py-6">
              <Sparkles size={32} className="mx-auto text-purple-300 mb-3" />
              <p className="text-gray-500 text-sm">
                {transactions.length === 0 
                  ? '尚無交易資料，請先新增交易記錄'
                  : '點擊「取得建議」讓 AI 分析您的收支狀況'}
              </p>
            </div>
          )}

          {isLoadingAdvice && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-2 text-purple-600">
                <RefreshCw size={20} className="animate-spin" />
                <span className="text-sm font-medium">AI 正在分析您的收支資料...</span>
              </div>
            </div>
          )}

          {aiAdvice && !isLoadingAdvice && (
            <div className="space-y-3">
              {adviceSource === 'ai' && (
                <div className="flex items-center gap-1.5 text-xs text-purple-600 mb-2">
                  <Sparkles size={12} />
                  <span>由 AI 生成</span>
                </div>
              )}
              <div className="prose prose-sm max-w-none text-gray-700 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-headings:text-gray-800 prose-strong:text-purple-700">
                <ReactMarkdown>
                  {aiAdvice}
                </ReactMarkdown>
              </div>
              {adviceSource === 'fallback' && (
                <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-purple-100">
                  * 此為系統預設建議，完整 AI 分析功能需要設定 Cloudflare Workers AI
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
