// Settings Page

import React, { useState } from 'react';
import { Cloud, Check, AlertCircle, Plus, Tag, Store, FolderPlus } from 'lucide-react';
import { useAppContext } from '../../app/AppContext';
import { CategoryForm } from '../../features/category-form/CategoryForm';
import { TagForm } from '../../features/tag-form/TagForm';
import { MerchantForm } from '../../features/merchant-form/MerchantForm';

export const SettingsPage: React.FC<{ setIsManagementModalOpen: (isOpen: boolean) => void }> = ({ setIsManagementModalOpen }) => {
  const { syncData, clearAllData, lastSyncTime, categories, tags, merchants } = useAppContext();
  const [isSyncing, setIsSyncing] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showMerchantModal, setShowMerchantModal] = useState(false);
  
  const handleSync = async () => {
    setIsSyncing(true);
    await syncData();
    setTimeout(() => setIsSyncing(false), 1500);
  };
  
  const handleClearAll = () => {
    if (window.confirm("確定要清除所有資料嗎？這無法復原。")) {
      clearAllData();
      window.location.reload();
    }
  };
  
  return (
    <div className="pb-24 pt-12 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">設定</h1>
      
      <div className="space-y-6">
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 ml-2">
            資料管理
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <button
              onClick={() => {
                setShowCategoryModal(true);
                setIsManagementModalOpen(true);
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
                setIsManagementModalOpen(true);
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
                setIsManagementModalOpen(true);
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
            雲端備份
          </h3>
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="p-4 flex items-center justify-between border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                  <Cloud size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">下載備份檔</h4>
                  <p className="text-xs text-gray-500">格式：JSON</p>
                </div>
              </div>
              <div className="text-green-500 bg-green-50 p-1 rounded-full">
                <Check size={16} />
              </div>
            </div>
            <button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full p-4 text-center text-blue-600 font-medium text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSyncing ? '準備下載中...' : '立即下載備份'}
            </button>
            <div className="p-3 bg-gray-50 flex gap-2 items-start">
              <AlertCircle size={14} className="text-gray-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400 leading-relaxed">
                請定期下載備份並儲存到您的 Google Drive。更換手機時需要此檔案。<br />
                上次備份：{lastSyncTime}
              </p>
            </div>
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
          setIsManagementModalOpen(false);
        }}
      />
      
      <TagForm 
        isOpen={showTagModal}
        onClose={() => {
          setShowTagModal(false);
          setIsManagementModalOpen(false);
        }}
      />
      
      <MerchantForm 
        isOpen={showMerchantModal}
        onClose={() => {
          setShowMerchantModal(false);
          setIsManagementModalOpen(false);
        }}
      />
    </div>
  );
};
