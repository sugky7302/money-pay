// Settings Page

import { AlertCircle, Cloud, Download, FolderPlus, LogOut, Plus, RefreshCw, Store, Tag, Upload, User, Zap } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { useAuth } from '../../app/AuthContext';
import { CategoryForm } from '../../features/category-form/CategoryForm';
import { MerchantForm } from '../../features/merchant-form/MerchantForm';
import { TagForm } from '../../features/tag-form/TagForm';
import { useUIStore } from '../../shared/stores/useUIStore';

export const SettingsPage: React.FC = () => {
  const { setManagementModalOpen } = useUIStore();
  const { syncToCloud, loadFromCloud, downloadBackup, clearAllData, lastSyncTime, categories, tags, merchants, isSyncing, autoSyncEnabled, toggleAutoSync } = useAppContext();
  const { logout, userInfo } = useAuth();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  
  const handleSyncToCloud = async () => {
    await syncToCloud();
  };
  
  const handleLoadFromCloud = async () => {
    if (window.confirm('從雲端載入資料將會覆蓋本機資料，確定要繼續嗎？')) {
      await loadFromCloud();
    }
  };
  
  const handleClearAll = () => {
    if (window.confirm("確定要清除所有資料嗎？這無法復原。")) {
      clearAllData();
      window.location.reload();
    }
  };
  
  const handleLogout = () => {
    if (window.confirm("確定要登出嗎？")) {
      logout();
    }
  };
  
  return (
    <div className="pb-24 pt-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">設定</h1>
      
      <div className="space-y-6">
        {userInfo && (
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
              帳戶資訊
            </h3>
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="p-4 flex items-center justify-between border-b border-gray-50">
                <div className="flex items-center gap-3">
                  {userInfo.picture ? (
                    <img 
                      src={userInfo.picture} 
                      alt={userInfo.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="bg-blue-50 p-2 rounded-full text-blue-600">
                      <User size={24} />
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium text-gray-800">{userInfo.name}</h4>
                    <p className="text-xs text-gray-500">{userInfo.email}</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full p-4 flex items-center justify-center gap-2 text-red-600 font-medium text-sm hover:bg-red-50 transition-colors"
              >
                <LogOut size={18} />
                登出帳號
              </button>
            </div>
          </section>
        )}
        
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
            資料管理
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setManagementModalOpen(true);
              }}
              className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                  <FolderPlus size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">管理分類</h4>
                  <p className="text-xs text-gray-500">{categories.length} 個分類</p>
                </div>
              </div>
              <Plus size={20} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => {
                setShowTagModal(true);
                setManagementModalOpen(true);
              }}
              className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-green-50 p-2 rounded-lg text-green-600">
                  <Tag size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">管理標籤</h4>
                  <p className="text-xs text-gray-500">{tags.length} 個標籤</p>
                </div>
              </div>
              <Plus size={20} className="text-gray-400" />
            </button>
            
            <button
              onClick={() => {
                setShowMerchantModal(true);
                setManagementModalOpen(true);
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                  <Store size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">管理商家</h4>
                  <p className="text-xs text-gray-500">{merchants.length} 個商家</p>
                </div>
              </div>
              <Plus size={20} className="text-gray-400" />
            </button>
          </div>
        </section>
        
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
            Google Drive 雲端同步
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Cloud size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">雲端同步</h4>
                  <p className="text-xs text-gray-500">同步至 Google Drive</p>
                </div>
              </div>
              {isSyncing && (
                <RefreshCw size={18} className="text-blue-500 animate-spin" />
              )}
            </div>
            <div className="flex border-b border-gray-50">
              <button 
                onClick={handleSyncToCloud}
                disabled={isSyncing}
                className="flex-1 p-4 flex items-center justify-center gap-2 text-blue-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50 border-r border-gray-50"
              >
                <Upload size={16} />
                上傳到雲端
              </button>
              <button 
                onClick={handleLoadFromCloud}
                disabled={isSyncing}
                className="flex-1 p-4 flex items-center justify-center gap-2 text-green-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download size={16} />
                從雲端載入
              </button>
            </div>
            <button
              onClick={toggleAutoSync}
              className="w-full p-4 flex items-center justify-between border-b border-gray-50 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${autoSyncEnabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                  <Zap size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">自動同步</h4>
                  <p className="text-xs text-gray-500">資料變更後自動上傳</p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${autoSyncEnabled ? 'bg-green-500' : 'bg-gray-300'}`}>
                <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
              </div>
            </button>
            <div className="p-3 bg-gray-50 flex gap-2 items-start">
              <AlertCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                資料會同步到 Google Drive 中的 cloudbudget 資料夾。<br />
                上次同步：{lastSyncTime}
              </p>
            </div>
          </div>
        </section>
        
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
            本機備份
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <button 
              onClick={downloadBackup}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gray-100 p-2 rounded-lg text-gray-600">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-medium text-gray-800">下載 JSON 備份</h4>
                  <p className="text-xs text-gray-500">匯出所有資料到檔案</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
            一般
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <span className="text-gray-700 font-medium">貨幣單位</span>
              <span className="text-gray-400 text-sm">TWD (NT$)</span>
            </div>
            <div className="p-4 flex items-center justify-between">
              <span className="text-gray-700 font-medium">主題顏色</span>
              <div className="flex gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-500 ring-2 ring-offset-2 ring-blue-500" />
                <div className="w-5 h-5 rounded-full bg-purple-500" />
                <div className="w-5 h-5 rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </section>
        
        <div className="pt-4 text-center">
          <button 
            onClick={handleClearAll}
            className="text-red-400 text-xs py-2 px-4 rounded-full hover:bg-red-50 transition-colors"
          >
            清除所有資料並重置 App
          </button>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-300">CloudBudget v2.0.0</p>
      </div>
      
      <CategoryForm 
        isOpen={showCategoryModal}
        onClose={() => {
          setShowCategoryModal(false);
          setManagementModalOpen(false);
        }}
      />
      
      <TagForm 
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setManagementModalOpen(false);
        }}
      />
      
      <MerchantForm 
        isOpen={showMerchantModal}
        onClose={() => {
          setShowMerchantModal(false);
          setManagementModalOpen(false);
        }}
      />
    </div>
  );
};
