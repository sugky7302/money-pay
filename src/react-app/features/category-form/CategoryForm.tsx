// Category Form Feature

import React, { useState } from 'react';
import { Category } from '../../shared/types';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ isOpen, onClose }) => {
  const { addCategory } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'expense' as 'expense' | 'income',
  });
  
  const handleSubmit = () => {
    if (!formData.name) {
      alert('請輸入分類名稱');
      return;
    }
    
    const newCategory: Category = {
      id: generateId(),
      name: formData.name,
      type: formData.type,
    };
    
    addCategory(newCategory);
    onClose();
    
    setFormData({ name: '', type: 'expense' });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增分類">
      <div className="space-y-4">
        <div className="flex bg-gray-200 rounded-lg p-1 mb-4">
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              formData.type === 'expense' ? 'bg-white shadow text-red-500' : 'text-gray-500'
            }`}
            onClick={() => setFormData({...formData, type: 'expense'})}
          >
            支出分類
          </button>
          <button 
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${
              formData.type === 'income' ? 'bg-white shadow text-green-500' : 'text-gray-500'
            }`}
            onClick={() => setFormData({...formData, type: 'income'})}
          >
            收入分類
          </button>
        </div>
        
        <Input
          type="text"
          label="分類名稱"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="例如：寵物、訂閱服務"
          autoFocus
        />
        
        <Button onClick={handleSubmit} className="w-full py-4 text-lg">
          新增分類
        </Button>
      </div>
    </Modal>
  );
};
