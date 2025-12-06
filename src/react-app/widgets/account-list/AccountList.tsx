// Account List Widget

import { Edit, Scale, Trash2, Wallet } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [orderedIds, setOrderedIds] = useState<number[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const touchMoveHandlerRef = useRef<((e: TouchEvent) => void) | null>(null);

  const persistOrder = (ids: number[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('account_order', JSON.stringify(ids));
    } catch (error) {
      console.error('Failed to save account order', error);
    }
  };

  useEffect(() => {
    const accountIds = accounts.map((a) => a.id);
    let saved: number[] = [];
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('account_order');
      if (raw) {
        try {
          saved = JSON.parse(raw) as number[];
        } catch (error) {
          console.error('Failed to parse account order', error);
        }
      }
    }

    const merged = [
      ...saved.filter((id) => accountIds.includes(id)),
      ...accountIds.filter((id) => !saved.includes(id)),
    ];

    setOrderedIds(merged);
  }, [accounts]);

  const orderedAccounts = useMemo(() => {
    if (!orderedIds.length) return accounts;
    const map = new Map(accounts.map((a) => [a.id, a] as const));
    const arranged: Account[] = [];
    orderedIds.forEach((id) => {
      const found = map.get(id);
      if (found) arranged.push(found);
    });
    accounts.forEach((acc) => {
      if (!orderedIds.includes(acc.id)) arranged.push(acc);
    });
    return arranged;
  }, [accounts, orderedIds]);

  const reorder = (dragId: number, targetId: number) => {
    setOrderedIds((prev) => {
      const base = prev.length ? [...prev] : accounts.map((a) => a.id);
      const from = base.indexOf(dragId);
      const to = base.indexOf(targetId);
      if (from === -1 || to === -1) return prev;
      base.splice(from, 1);
      base.splice(to, 0, dragId);
      persistOrder(base);
      return base;
    });
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>, targetId: number) => {
    event.preventDefault();
    if (draggingId === null || draggingId === targetId) return;
    reorder(draggingId, targetId);
  };

  const cleanupTouch = () => {
    if (touchMoveHandlerRef.current) {
      window.removeEventListener('touchmove', touchMoveHandlerRef.current);
      touchMoveHandlerRef.current = null;
    }
    window.removeEventListener('touchend', handleTouchEnd);
    setDraggingId(null);
  };

  const handleTouchMove = (dragId: number) => (e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const targetCard = el?.closest('[data-account-id]');
    const targetId = targetCard ? Number(targetCard.getAttribute('data-account-id')) : null;
    if (targetId && targetId !== dragId) {
      reorder(dragId, targetId);
    }
    e.preventDefault();
  };

  const handleTouchStart = (id: number) => {
    setDraggingId(id);
    const moveHandler = handleTouchMove(id);
    touchMoveHandlerRef.current = moveHandler;
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('touchend', handleTouchEnd);
  };

  function handleTouchEnd(e: TouchEvent) {
    cleanupTouch();
  }
  
  
  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除此帳戶嗎？')) {
      deleteAccount(id);
    }
  };
  
  return (
    <div className="space-y-3">
      {orderedAccounts.map((account) => {
        // 計算帳戶當前餘額
        const currentBalance = calculateAccountBalance(account, transactions);
        
        return (
          <div 
            key={account.id}
            className="bg-white p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm border border-gray-100 cursor-move"
            draggable
            onDragStart={() => setDraggingId(account.id)}
            onDragOver={(e) => handleDragOver(e, account.id)}
            onDragEnd={() => setDraggingId(null)}
            onTouchStart={() => handleTouchStart(account.id)}
            data-account-id={account.id}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div 
                className="p-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: `${account.color}20`, color: account.color }}
              >
                <Wallet size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <h4
                    className="font-semibold text-gray-800 leading-tight break-words max-w-[220px] sm:max-w-[360px] overflow-hidden"
                    style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
                    title={account.name}
                  >
                    {account.name}
                  </h4>
                  {account.isVirtual && (
                    <span className="inline-flex items-center h-5 px-2 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-medium whitespace-nowrap">
                      虛擬
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">{ACCOUNT_TYPE_LABELS[account.type]}</p>
              </div>
            </div>
            <div className="flex items-center shrink-0 text-right ml-auto -mr-3">
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
                  title="編輯帳戶"
                >
                  <Edit size={16} />
                </button>
              )}
              <button 
                onClick={() => handleDelete(account.id)} 
                className="text-gray-300 hover:text-red-400 p-2"
                title="刪除帳戶"
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
