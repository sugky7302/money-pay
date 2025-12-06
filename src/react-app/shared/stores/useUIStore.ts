/**
 * useUIStore.ts - UI 狀態管理 Store
 * 
 * 功能說明：
 * 1. 管理各種 Modal 的開關狀態
 * 2. 提供全域 UI 狀態存取
 * 3. 檢查是否有任何 Modal 開啟（用於隱藏 TabBar）
 */

import { create } from 'zustand';

/** UI 狀態介面 */
interface UIState {
  // Modal 狀態
  isSearchModalOpen: boolean;
  isManagementModalOpen: boolean;
  isAddMenuOpen: boolean;
  isTransactionFormOpen: boolean;
  isTransferFormOpen: boolean;
  isAccountFormOpen: boolean;
  
  // 操作方法
  setSearchModalOpen: (open: boolean) => void;
  setManagementModalOpen: (open: boolean) => void;
  setAddMenuOpen: (open: boolean) => void;
  setTransactionFormOpen: (open: boolean) => void;
  setTransferFormOpen: (open: boolean) => void;
  setAccountFormOpen: (open: boolean) => void;
  
  // 計算屬性 - 檢查是否有任何 Modal 開啟（用於隱藏 TabBar）
  isAnyModalOpen: () => boolean;
}

/**
 * UI 狀態管理 Hook
 * 使用 Zustand 管理全域 UI 狀態
 */
export const useUIStore = create<UIState>((set, get) => ({
  // Initial states
  isSearchModalOpen: false,
  isManagementModalOpen: false,
  isAddMenuOpen: false,
  isTransactionFormOpen: false,
  isTransferFormOpen: false,
  isAccountFormOpen: false,
  
  // Actions
  setSearchModalOpen: (open) => set({ isSearchModalOpen: open }),
  setManagementModalOpen: (open) => set({ isManagementModalOpen: open }),
  setAddMenuOpen: (open) => set({ isAddMenuOpen: open }),
  setTransactionFormOpen: (open) => set({ isTransactionFormOpen: open }),
  setTransferFormOpen: (open) => set({ isTransferFormOpen: open }),
  setAccountFormOpen: (open) => set({ isAccountFormOpen: open }),
  
  // Check if any modal that should hide TabBar is open
  isAnyModalOpen: () => {
    const state = get();
    return state.isSearchModalOpen || state.isManagementModalOpen || state.isAccountFormOpen;
  },
}));
