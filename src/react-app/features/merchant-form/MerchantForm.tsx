// Merchant Form Feature

import { Store, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Merchant } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';

interface MerchantFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantForm: React.FC<MerchantFormProps> = ({ isOpen, onClose }) => {
  const { merchants, addMerchant, deleteMerchant } = useAppContext();
  
  const [name, setName] = useState('');
  
  const handleSubmit = () => {
    if (!name.trim()) {
      alert('請輸入商家名稱');
      return;
    }
    
    const newMerchant: Merchant = {
      id: generateId(),
      name: name.trim(),
    };
    
    addMerchant(newMerchant);
    setName('');
  };

  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這個商家嗎？')) {
      deleteMerchant(id);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理商家">
      <div className="space-y-4">
        {/* 現有商家列表 */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            目前有 {merchants.length} 個商家
          </p>
          {merchants.length > 0 ? (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {merchants.map((merchant) => (
                <div 
                  key={merchant.id} 
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-gray-400" />
                    <span className="text-gray-800">{merchant.name}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(merchant.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">尚無商家</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">新增商家</p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：7-11、全家"
              className="flex-1"
            />
            <Button onClick={handleSubmit} className="px-4">
              新增
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
