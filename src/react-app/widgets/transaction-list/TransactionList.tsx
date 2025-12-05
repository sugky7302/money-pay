// Transaction List Widget

import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Edit, Trash2 } from 'lucide-react';
import React from 'react';
import { useAppContext } from '../../app/AppContext';
import { formatCurrency } from '../../shared/lib/utils';
import { Transaction } from '../../shared/types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit }) => {
  const { deleteTransaction } = useAppContext();
  
  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      deleteTransaction(id);
    }
  };
  
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return <ArrowDownCircle size={20} />;
      case 'income':
        return <ArrowUpCircle size={20} />;
      case 'transfer':
        return <ArrowLeftRight size={20} />;
    }
  };
  
  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return 'bg-red-50 text-red-500';
      case 'income':
        return 'bg-green-50 text-green-500';
      case 'transfer':
        return 'bg-blue-50 text-blue-500';
    }
  };
  
  const getAmountColor = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return 'text-gray-800';
      case 'income':
        return 'text-green-600';
      case 'transfer':
        return 'text-blue-600';
    }
  };
  
  const getAmountPrefix = (type: Transaction['type']) => {
    switch (type) {
      case 'expense':
        return '-';
      case 'income':
        return '+';
      case 'transfer':
        return '→';
    }
  };
  
  return (
    <div className="space-y-1">
      {transactions.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-4 rounded-2xl flex items-center justify-between mb-3 shadow-sm border border-gray-100"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-full ${getTransactionColor(item.type)}`}>
              {getTransactionIcon(item.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">{item.category}</h4>
              <p className="text-xs text-gray-400">
                {item.type === 'transfer' 
                  ? `${item.fromAccount} → ${item.toAccount}`
                  : (item.note || item.date)
                }
              </p>
              {item.account && item.type !== 'transfer' && (
                <p className="text-xs text-gray-400">{item.account}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-bold ${getAmountColor(item.type)}`}>
              {getAmountPrefix(item.type)}{formatCurrency(item.amount).replace('NT$', '')}
            </span>
            {onEdit && (
              <button 
                onClick={() => onEdit(item)} 
                className="text-gray-300 hover:text-blue-400 p-2"
              >
                <Edit size={16} />
              </button>
            )}
            <button 
              onClick={() => handleDelete(item.id)} 
              className="text-gray-300 hover:text-red-400 p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
