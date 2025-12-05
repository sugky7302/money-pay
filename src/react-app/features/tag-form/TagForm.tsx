// Tag Form Feature

import React, { useState } from 'react';
import { Tag } from '../../shared/types';
import { useAppContext } from '../../app/AppContext';
import { generateId } from '../../shared/lib/utils';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const TagForm: React.FC<TagFormProps> = ({ isOpen, onClose }) => {
  const { addTag } = useAppContext();
  
  const [formData, setFormData] = useState({
    name: '',
    color: TAG_COLORS[0],
  });
  
  const handleSubmit = () => {
    if (!formData.name) {
      alert('請輸入標籤名稱');
      return;
    }
    
    const newTag: Tag = {
      id: generateId(),
      name: formData.name,
      color: formData.color,
    };
    
    addTag(newTag);
    onClose();
    
    setFormData({ name: '', color: TAG_COLORS[0] });
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增標籤">
      <div className="space-y-4">
        <Input
          type="text"
          label="標籤名稱"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          placeholder="例如：重要、可報稅"
          autoFocus
        />
        
        <div>
          <label className="text-xs text-gray-500 font-medium ml-1 mb-2 block">
            選擇顏色
          </label>
          <div className="flex gap-2 flex-wrap">
            {TAG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setFormData({...formData, color})}
                className={`w-10 h-10 rounded-full transition-all ${
                  formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
        
        <Button onClick={handleSubmit} className="w-full py-4 text-lg">
          新增標籤
        </Button>
      </div>
    </Modal>
  );
};
