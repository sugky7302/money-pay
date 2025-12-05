// Merchant Form Feature

import React, { useState } from 'react';
import { Merchant } from '../../shared/types';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

interface MerchantFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MerchantForm: React.FC<MerchantFormProps> = ({ isOpen, onClose }) => {
  const { addMerchant } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
  });
  
  const handleSubmit = () => {
    if (!formData.name) {
      alert('請輸入商家名稱');
      return;
    }
    
    const newMerchant: Merchant = {
      id: generateId(),
      name: formData.name,
      category: formData.category,
    };
    
    addMerchant(newMerchant);
    onClose();
    
    setFormData({ name: '', category: '' });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增商家">
      <div className="space-y-4">
        <Input
          type="text"
          label="商家名稱"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="例如：7-11、全家"
          autoFocus
        />
        
        <Input
          type="text"
          label="分類（選填）"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
          placeholder="例如：便利商店"
        />
        
        <Button onClick={handleSubmit} className="w-full py-4 text-lg">
          新增商家
        </Button>
      </div>
    </Modal>
  );
};
