/**
 * BalanceCard.tsx - 餘額卡片組件
 *
 * 功能說明：
 * 1. 顯示總餘額（所有帳戶加總）
 * 2. 顯示本月支出和收入統計
 * 3. 顯示信用卡總欠款（如果有）
 * 4. 深色設計風格卡片
 */

import { ArrowDownCircle, ArrowUpCircle, Landmark } from 'lucide-react';
import React from 'react';
import { useAppContext } from '../../app/AppContext';
import { calculateAccountBalance, calculateTotalBalance, formatCurrency, getCurrentMonth } from '../../shared/lib/utils';

export const BalanceCard: React.FC = () => {
  const { transactions, accounts } = useAppContext();
  
  // Calculate total balance (帳戶初始餘額 + 收入 - 支出 ± 轉帳)
  const totalBalance = calculateTotalBalance(accounts, transactions);

  const creditCardBalance = accounts
    .filter(a => a.type === 'credit-card')
    .reduce((total, account) => total + calculateAccountBalance(account, transactions), 0);
  
  // Calculate monthly stats
  const currentMonth = getCurrentMonth();
  const monthlyExpense = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const monthlyIncome = transactions
    .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
    .reduce((acc, curr) => acc + curr.amount, 0);
  
  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-xl shadow-gray-300/50 mb-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="relative z-10">
        <p className="text-gray-400 text-sm font-medium mb-1">總餘額</p>
        <h2 className="text-4xl font-bold mb-6 tracking-tight">{formatCurrency(totalBalance)}</h2>
        <div className="flex gap-8">
          <div>
            <div className="flex items-center gap-1 text-red-300 text-xs mb-1">
              <ArrowDownCircle size={12} />
              本月支出
            </div>
            <p className="font-semibold text-lg">{formatCurrency(monthlyExpense).split('.')[0]}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-green-300 text-xs mb-1">
              <ArrowUpCircle size={12} />
              本月收入
            </div>
            <p className="font-semibold text-lg">{formatCurrency(monthlyIncome).split('.')[0]}</p>
          </div>
          {creditCardBalance < 0 && (
            <div>
              <div className="flex items-center gap-1 text-orange-300 text-xs mb-1">
                <Landmark size={12} />
                信用卡餘額
              </div>
              <p className="font-semibold text-lg">{formatCurrency(creditCardBalance).split('.')[0]}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
