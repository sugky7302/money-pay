// Account List Widget

import { Edit, Scale, Trash2, Wallet } from 'lucide-react';
import React from 'react';
import { useAppContext } from '../../app/AppContext';
import { calculateAccountBalance, formatCurrency } from '../../shared/lib/utils';
import { Account } from '../../shared/types';

interface AccountListProps {
  accounts: Account[];
  onEdit?: (account: Account) => void;
  onAdjust?: (account: Account, currentBalance: number) => void;
}

const ACCOUNT_TYPE_LABELS: Record<Account['type'], string> = {
  'bank': '銀行',
  'cash': '現金',
  'e-wallet': '電子支付',
  'credit-card': '信用卡',
  'other': '其他',
};

export const AccountList: React.FC<AccountListProps> = ({ accounts, onEdit, onAdjust }) => {
  const { deleteAccount, transactions } = useAppContext();
  
  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除此帳戶嗎？')) {
      deleteAccount(id);
    }
  };
  
  return (
    <div className="space-y-3">
      {accounts.map((account) => {
        // 計算帳戶當前餘額
        const currentBalance = calculateAccountBalance(account, transactions);
        
        return (
          <div 
            key={account.id}
            className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm border border-gray-100"
          >
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${account.color}20`, color: account.color }}
              >
                <Wallet size={20} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{account.name}</h4>
                <p className="text-xs text-gray-400">{ACCOUNT_TYPE_LABELS[account.type]}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`font-bold ${currentBalance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
                {formatCurrency(currentBalance).replace('NT$', '')}
              </span>
              {onAdjust && (
                <button 
                  onClick={() => onAdjust(account, currentBalance)} 
                  className="text-gray-300 hover:text-orange-400 p-2"
                  title="餘額校正"
                >
                  <Scale size={16} />
                </button>
              )}
              {onEdit && (
                <button 
                  onClick={() => onEdit(account)} 
                  className="text-gray-300 hover:text-blue-400 p-2"
                >
                  <Edit size={16} />
                </button>
              )}
              <button 
                onClick={() => handleDelete(account.id)} 
                className="text-gray-300 hover:text-red-400 p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
