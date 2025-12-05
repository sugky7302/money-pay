// Main App Component

import React, { useState } from 'react';
import { Plus, Settings, Wallet, CreditCard, ArrowLeftRight } from 'lucide-react';
import { AppProvider } from './AppContext';
import { HomePage } from '../pages/home/HomePage';
import { AccountsPage } from '../pages/accounts/AccountsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { TransactionForm } from '../features/transaction-form/TransactionForm';
import { TransferForm } from '../features/transfer-form/TransferForm';

type Tab = 'home' | 'accounts' | 'settings';

const TabBar: React.FC<{ activeTab: Tab; setActiveTab: (tab: Tab) => void; onAddClick: () => void }> = ({ 
  activeTab, 
  setActiveTab, 
  onAddClick 
}) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 pb-safe pt-2 px-4 z-50 h-20 md:max-w-md md:mx-auto md:relative md:border-t-0 md:bg-transparent">
    <div className="grid grid-cols-5 gap-2 items-center max-w-md mx-auto">
      <button 
        onClick={() => setActiveTab('home')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'home' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <Wallet size={24} />
        <span className="text-[10px] font-medium">錢包</span>
      </button>
      
      <button 
        onClick={() => setActiveTab('accounts')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'accounts' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <CreditCard size={24} />
        <span className="text-[10px] font-medium">帳戶</span>
      </button>
      
      <button 
        onClick={onAddClick} 
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg transform -translate-y-4 hover:bg-blue-600 transition-colors active:scale-95 justify-self-center"
      >
        <Plus size={28} />
      </button>

      <button 
        onClick={() => setActiveTab('settings')} 
        className={`flex flex-col items-center space-y-1 ${activeTab === 'settings' ? 'text-blue-500' : 'text-gray-400'}`}
      >
        <Settings size={24} />
        <span className="text-[10px] font-medium">設定</span>
      </button>
      
      <div className="opacity-0">
        <span className="text-[10px]">占位</span>
      </div>
    </div>
  </div>
);

const AddMenu: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void; 
  onSelectTransaction: () => void;
  onSelectTransfer: () => void;
}> = ({ 
  isOpen, 
  onClose, 
  onSelectTransaction,
  onSelectTransfer 
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div className="bg-white w-full md:w-[450px] md:rounded-2xl rounded-t-3xl p-6 relative z-10 animate-in slide-in-from-bottom duration-300 shadow-2xl">
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-6 md:hidden" />
        
        <h2 className="text-xl font-bold text-gray-800 mb-4">新增紀錄</h2>
        
        <div className="space-y-3">
          <button
            onClick={onSelectTransaction}
            className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-blue-500 text-white p-3 rounded-full">
              <Plus size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold">收入 / 支出</h3>
              <p className="text-xs text-blue-600">記錄一般交易</p>
            </div>
          </button>
          
          <button
            onClick={onSelectTransfer}
            className="w-full bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-xl flex items-center gap-4 transition-colors"
          >
            <div className="bg-green-500 text-white p-3 rounded-full">
              <ArrowLeftRight size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-bold">轉帳</h3>
              <p className="text-xs text-green-600">帳戶之間轉帳</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransferForm, setShowTransferForm] = useState(false);
  
  const handleAddClick = () => {
    setShowAddMenu(true);
  };
  
  const handleSelectTransaction = () => {
    setShowAddMenu(false);
    setShowTransactionForm(true);
  };
  
  const handleSelectTransfer = () => {
    setShowAddMenu(false);
    setShowTransferForm(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 font-sans md:flex md:items-center md:justify-center md:bg-gray-200">
      <div className="w-full min-h-screen md:min-h-[800px] md:max-h-[850px] md:max-w-[400px] md:bg-gray-50 md:rounded-[40px] md:shadow-2xl md:overflow-hidden relative flex flex-col">
        <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-2xl z-50" />
        
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'accounts' && <AccountsPage />}
          {activeTab === 'settings' && <SettingsPage />}
        </div>
        
        <TabBar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          onAddClick={handleAddClick}
        />
        
        <AddMenu
          isOpen={showAddMenu}
          onClose={() => setShowAddMenu(false)}
          onSelectTransaction={handleSelectTransaction}
          onSelectTransfer={handleSelectTransfer}
        />
        
        <TransactionForm 
          isOpen={showTransactionForm}
          onClose={() => setShowTransactionForm(false)}
          mode="add"
        />
        
        <TransferForm 
          isOpen={showTransferForm}
          onClose={() => setShowTransferForm(false)}
        />
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};
