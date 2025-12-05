// Transaction List Widget

import { ArrowDownCircle, ArrowLeftRight, ArrowUpCircle, Edit, Scale, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { formatCurrency } from '../../shared/lib/utils';
import { Transaction } from '../../shared/types';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
}

const TYPE_LABELS: Record<Transaction['type'], string> = {
  expense: '支出',
  income: '收入',
  transfer: '轉帳',
  adjustment: '校正',
};

export const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit }) => {
  const { deleteTransaction } = useAppContext();
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
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
      case 'adjustment':
        return <Scale size={20} />;
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
      case 'adjustment':
        return 'bg-orange-50 text-orange-500';
    }
  };
  
  const getAmountColor = (type: Transaction['type'], amount: number) => {
    switch (type) {
      case 'expense':
        return 'text-gray-800';
      case 'income':
        return 'text-green-600';
      case 'transfer':
        return 'text-blue-600';
      case 'adjustment':
        return amount >= 0 ? 'text-green-600' : 'text-red-600';
    }
  };
  
  const getAmountPrefix = (type: Transaction['type'], amount: number) => {
    switch (type) {
      case 'expense':
        return '-';
      case 'income':
        return '+';
      case 'transfer':
        return '→';
      case 'adjustment':
        return amount >= 0 ? '+' : '';
    }
  };
  
  return (
    <>
    <div className="space-y-1">
      {transactions.map((item) => (
        <div 
          key={item.id} 
          className="bg-white p-4 rounded-2xl flex items-center justify-between mb-3 shadow-sm border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setSelectedTransaction(item)}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-3 rounded-full ${getTransactionColor(item.type)}`}>
              {getTransactionIcon(item.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800">
                {item.type === 'transfer' ? '轉帳' : item.category}
              </h4>
              <p className="text-xs text-gray-400">
                {item.type === 'transfer' 
                  ? `${item.fromAccount} → ${item.toAccount}`
                  : item.merchant || ''
                }
              </p>
              <p className="text-xs text-gray-300">
                {item.date}{item.account && item.type !== 'transfer' ? ` · ${item.account}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-bold ${getAmountColor(item.type, item.amount)}`}>
              {getAmountPrefix(item.type, item.amount)}{formatCurrency(Math.abs(item.amount)).replace('NT$', '')}
            </span>
            {onEdit && item.type !== 'adjustment' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(item);
                }} 
                className="text-gray-300 hover:text-blue-400 p-2"
              >
                <Edit size={16} />
              </button>
            )}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(item.id);
              }} 
              className="text-gray-300 hover:text-red-400 p-2"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>

    {/* Transaction Detail Modal */}
    {selectedTransaction && (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedTransaction(null)}
      >
        <div 
          className="bg-white rounded-2xl w-full max-w-md shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-800">交易詳情</h3>
            <button 
              onClick={() => setSelectedTransaction(null)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Amount & Type */}
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-full ${getTransactionColor(selectedTransaction.type)}`}>
                {getTransactionIcon(selectedTransaction.type)}
              </div>
              <div>
                <p className={`text-2xl font-bold ${getAmountColor(selectedTransaction.type, selectedTransaction.amount)}`}>
                  {getAmountPrefix(selectedTransaction.type, selectedTransaction.amount)}{formatCurrency(Math.abs(selectedTransaction.amount))}
                </p>
                <p className="text-sm text-gray-500">{TYPE_LABELS[selectedTransaction.type]}</p>
              </div>
            </div>
            
            {/* Details */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              {selectedTransaction.type === 'transfer' ? (
                <div className="flex justify-between">
                  <span className="text-gray-500">帳戶</span>
                  <span className="text-gray-800 font-medium">
                    {selectedTransaction.fromAccount} → {selectedTransaction.toAccount}
                  </span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">類別</span>
                    <span className="text-gray-800 font-medium">{selectedTransaction.category}</span>
                  </div>
                  {selectedTransaction.account && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">帳戶</span>
                      <span className="text-gray-800 font-medium">{selectedTransaction.account}</span>
                    </div>
                  )}
                </>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-500">日期</span>
                <span className="text-gray-800 font-medium">{selectedTransaction.date}</span>
              </div>
              
              {selectedTransaction.merchant && (
                <div className="flex justify-between">
                  <span className="text-gray-500">商家</span>
                  <span className="text-gray-800 font-medium">{selectedTransaction.merchant}</span>
                </div>
              )}
              
              {selectedTransaction.tags && selectedTransaction.tags.length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-500">標籤</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {selectedTransaction.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedTransaction.note && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-gray-500 text-sm">備註</span>
                  <p className="text-gray-800 mt-1">{selectedTransaction.note}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 p-4 border-t border-gray-100">
            {onEdit && selectedTransaction.type !== 'adjustment' && (
              <button
                onClick={() => {
                  onEdit(selectedTransaction);
                  setSelectedTransaction(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                <Edit size={16} />
                編輯
              </button>
            )}
            <button
              onClick={() => {
                handleDelete(selectedTransaction.id);
                setSelectedTransaction(null);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-500 rounded-xl font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} />
              刪除
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
};
