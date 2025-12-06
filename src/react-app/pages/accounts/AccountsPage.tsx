/**
 * AccountsPage.tsx - 帳戶管理頁面
 * 
 * 功能說明：
 * 1. 顯示所有帳戶列表
 * 2. 顯示總資產統計
 * 3. 新增帳戶功能
 * 4. 編輯帳戶功能
 * 5. 刪除帳戶功能
 * 6. 帳戶餘額校正功能
 */

import { Plus, Wallet } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { AccountForm } from '../../features/account-form/AccountForm';
import { BalanceAdjustmentForm } from '../../features/balance-adjustment/BalanceAdjustmentForm';
import { calculateTotalBalance, formatCurrency } from '../../shared/lib/utils';
import { useUIStore } from '../../shared/stores/useUIStore';
import { Account } from '../../shared/types';
import { AccountList } from '../../widgets/account-list/AccountList';

/**
 * 帳戶管理頁面組件
 * @returns 帳戶管理頁面 UI
 */
export const AccountsPage: React.FC = () => {
  const { accounts, transactions } = useAppContext();
  const { setAccountFormOpen } = useUIStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | undefined>();
  const [adjustingAccount, setAdjustingAccount] = useState<Account | undefined>();
  const [adjustingBalance, setAdjustingBalance] = useState(0);
  
  // 計算總資產 (所有帳戶的當前餘額總和)
  const totalBalance = calculateTotalBalance(accounts, transactions);
  
  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowEditModal(true);
    setAccountFormOpen(true);
  };

  const handleAdjust = (account: Account, currentBalance: number) => {
    setAdjustingAccount(account);
    setAdjustingBalance(currentBalance);
    setShowAdjustModal(true);
  };
  
  return (
    <div className="pb-24 pt-12 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">帳戶管理</h1>
        <button
          onClick={() => {
            setShowAddModal(true);
            setAccountFormOpen(true);
          }}
          className="bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>
      
      <div className="bg-linear-to-br from-blue-500 to-blue-600 text-white p-6 rounded-3xl shadow-xl mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Wallet size={20} />
          <p className="text-blue-100 text-sm font-medium">總資產</p>
        </div>
        <h2 className="text-4xl font-bold tracking-tight">{formatCurrency(totalBalance)}</h2>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-800 mb-4">
          我的帳戶 
          <span className="text-sm text-gray-400 font-normal ml-2">
            ({accounts.length} 個)
          </span>
        </h3>
      </div>
      
      {accounts.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Wallet size={48} className="mx-auto mb-3 opacity-20" />
          <p className="mb-4">還沒有帳戶</p>
          <button
            onClick={() => {
              setShowAddModal(true);
              setAccountFormOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            新增第一個帳戶
          </button>
        </div>
      ) : (
        <AccountList accounts={accounts} onEdit={handleEdit} onAdjust={handleAdjust} />
      )}
      
      <AccountForm 
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAccountFormOpen(false);
        }}
        mode="add"
      />
      
      <AccountForm 
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingAccount(undefined);
          setAccountFormOpen(false);
        }}
        account={editingAccount}
        mode="edit"
      />

      <BalanceAdjustmentForm
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setAdjustingAccount(undefined);
        }}
        account={adjustingAccount}
        currentBalance={adjustingBalance}
      />
    </div>
  );
};
