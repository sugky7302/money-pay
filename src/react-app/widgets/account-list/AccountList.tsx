/**
 * AccountList.tsx - 帳戶列表組件
 *
 * 功能說明：
 * 1. 顯示所有帳戶列表（依類型分組）
 * 2. 支援拖曳排序（觸控/滑鼠）
 * 3. 收合/展開帳戶分組
 * 4. 顯示帳戶餘額和類型
 * 5. 支援編輯、刪除、餘額校正操作
 * 6. 記住排序和分組展開狀態
 */

import { ChevronDown, Edit, Folder, Scale, Trash2, Wallet } from 'lucide-react';
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
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const GROUP_COLLAPSE_KEY = 'account_group_collapse';

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(GROUP_COLLAPSE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          setCollapsedGroups(parsed as Record<string, boolean>);
        }
      }
    } catch (error) {
      console.error('Failed to load group collapse state', error);
    }
  }, []);

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

  const groupedAccounts = useMemo(() => {
    const groups: { name: string; accounts: Account[] }[] = [];
    const indexMap = new Map<string, number>();

    orderedAccounts.forEach((account) => {
      const groupName = account.group?.trim() || '未分組';
      if (indexMap.has(groupName)) {
        const idx = indexMap.get(groupName);
        if (idx !== undefined) {
          groups[idx].accounts.push(account);
        }
      } else {
        indexMap.set(groupName, groups.length);
        groups.push({ name: groupName, accounts: [account] });
      }
    });

    return groups;
  }, [orderedAccounts]);

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
    const moveHandler = touchMoveHandlerRef.current;
    if (moveHandler) {
      window.removeEventListener('touchmove', moveHandler);
      touchMoveHandlerRef.current = null;
    }
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
    // This may cause a warning in the console if the user is scrolling,
    // but it is necessary to prevent the page from scrolling while dragging.
    // The warning is harmless and can be ignored.
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    window.removeEventListener('touchend', handleTouchEnd as EventListener);
    cleanupTouch();
  };

  const handleTouchStart = (id: number) => {
    setDraggingId(id);
    const moveHandler = handleTouchMove(id);
    touchMoveHandlerRef.current = moveHandler;
    window.addEventListener('touchmove', moveHandler, { passive: false });
    window.addEventListener('touchend', handleTouchEnd as EventListener);
  };
  
  
  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除此帳戶嗎？')) {
      deleteAccount(id);
    }
  };

  const persistCollapsed = (nextState: Record<string, boolean>) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(GROUP_COLLAPSE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.error('Failed to save group collapse state', error);
    }
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = { ...prev, [groupName]: !prev[groupName] };
      persistCollapsed(next);
      return next;
    });
  };
  
  return (
    <div className="space-y-4">
      {groupedAccounts.map(({ name, accounts: groupAccounts }) => {
        const groupBalance = groupAccounts.reduce((total, account) => {
          if (account.type === 'credit-card' || account.isVirtual) return total; // 信用卡/虛擬帳戶不計入群組總額
          return total + calculateAccountBalance(account, transactions);
        }, 0);
        const isCollapsed = collapsedGroups[name] ?? false;

        return (
          <div key={name} className="space-y-2">
            <button
              type="button"
              onClick={() => toggleGroup(name)}
              className="w-full flex items-center justify-between rounded-2xl px-3 py-2 bg-gray-50 border border-gray-100 text-left transition hover:bg-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-gray-100 shadow-sm text-gray-500">
                  <Folder size={16} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">
                    {groupAccounts.length} 個帳戶 · {formatCurrency(groupBalance)}
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-gray-400 transition-transform ${isCollapsed ? '-rotate-90' : 'rotate-0'}`}
              />
            </button>

            {!isCollapsed && (
              <div className="space-y-3">
                {groupAccounts.map((account) => {
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
            )}
          </div>
        );
      })}
    </div>
  );
};
