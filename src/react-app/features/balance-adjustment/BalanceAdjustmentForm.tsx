// Balance Adjustment Form

import { Scale } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { formatCurrency, generateId, getCurrentDate } from '../../shared/lib/utils';
import { Account } from '../../shared/types';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';

interface BalanceAdjustmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | undefined;
  currentBalance: number;
}

export const BalanceAdjustmentForm: React.FC<BalanceAdjustmentFormProps> = ({
  isOpen,
  onClose,
  account,
  currentBalance,
}) => {
  const { addTransaction } = useAppContext();
  const [actualBalance, setActualBalance] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen && account) {
      setActualBalance(currentBalance.toString());
      setNote('');
    }
  }, [isOpen, account, currentBalance]);

  const difference = actualBalance ? Number(actualBalance) - currentBalance : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account || difference === 0) {
      onClose();
      return;
    }

    // 建立校正交易記錄
    addTransaction({
      id: generateId(),
      type: 'adjustment',
      amount: difference, // 正數表示增加，負數表示減少
      category: '餘額校正',
      date: getCurrentDate(),
      note: note || `餘額校正: ${formatCurrency(currentBalance)} → ${formatCurrency(Number(actualBalance))}`,
      account: account.name,
      tags: ['校正'],
    });

    onClose();
  };

  if (!account) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="餘額校正">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 帳戶資訊 */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${account.color}20`, color: account.color }}
            >
              <Scale size={20} />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">{account.name}</h4>
              <p className="text-xs text-gray-400">目前系統餘額</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(currentBalance)}
          </p>
        </div>

        {/* 實際餘額輸入 */}
        <Input
          label="實際餘額"
          type="number"
          value={actualBalance}
          onChange={(e) => setActualBalance(e.target.value)}
          placeholder="輸入實際餘額"
          required
        />

        {/* 差額顯示 */}
        {difference !== 0 && (
          <div className={`p-4 rounded-xl ${difference > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className="text-sm text-gray-600 mb-1">差額</p>
            <p className={`text-xl font-bold ${difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {difference > 0 ? '+' : ''}{formatCurrency(difference)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {difference > 0 ? '系統餘額將增加' : '系統餘額將減少'}
            </p>
          </div>
        )}

        {/* 備註 */}
        <Input
          label="備註（選填）"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如：盤點現金、銀行利息、遺漏支出"
        />

        {/* 提示 */}
        <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
          <p>💡 校正記錄會保存在交易紀錄中，可隨時查閱</p>
        </div>

        {/* 按鈕 */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={difference === 0}
            className="flex-1 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            確認校正
          </button>
        </div>
      </form>
    </Modal>
  );
};
