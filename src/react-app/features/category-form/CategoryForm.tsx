// Category Form Feature

import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Category } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';

interface CategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({ isOpen, onClose }) => {
  const { categories, addCategory, deleteCategory } = useAppContext();
  
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
    setFormData({ ...formData, name: '' });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這個分類嗎？')) {
      deleteCategory(id);
    }
  };

  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  const displayCategories = formData.type === 'expense' ? expenseCategories : incomeCategories;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理分類">
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

        {/* 現有分類列表 */}
        <div className="max-h-48 overflow-y-auto">
          <p className="text-xs text-gray-500 mb-2">
            目前有 {displayCategories.length} 個{formData.type === 'expense' ? '支出' : '收入'}分類
          </p>
          {displayCategories.length > 0 ? (
            <div className="space-y-2">
              {displayCategories.map((category) => (
                <div 
                  key={category.id} 
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                >
                  <span className="text-gray-800">{category.name}</span>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">尚無分類</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">新增分類</p>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="輸入分類名稱"
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
