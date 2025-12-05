// UI State Store using Zustand

import { create } from 'zustand';

interface UIState {
  // Modal states
  isSearchModalOpen: boolean;
  isManagementModalOpen: boolean;
  isAddMenuOpen: boolean;
  isTransactionFormOpen: boolean;
  isTransferFormOpen: boolean;
  isAccountFormOpen: boolean;
  
  // Actions
  setSearchModalOpen: (open: boolean) => void;
  setManagementModalOpen: (open: boolean) => void;
  setAddMenuOpen: (open: boolean) => void;
  setTransactionFormOpen: (open: boolean) => void;
  setTransferFormOpen: (open: boolean) => void;
  setAccountFormOpen: (open: boolean) => void;
  
  // Computed - check if any modal is open (for hiding TabBar)
  isAnyModalOpen: () => boolean;
}

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
