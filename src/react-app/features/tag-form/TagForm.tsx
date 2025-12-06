/**
 * TagForm.tsx - 標籤管理表單組件
 *
 * 功能說明：
 * 1. 顯示現有標籤列表
 * 2. 新增標籤（指定名稱和顏色）
 * 3. 刪除標籤（確認後刪除）
 * 4. 提供 10 種預設顏色選擇
 */

import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { useAppContext } from '../../app/AppContext';
import { useToast } from '../../app/ToastContext';
import { generateId } from '../../shared/lib/utils';
import { Tag } from '../../shared/types';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';

interface TagFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const TAG_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', 
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1'
];

export const TagForm: React.FC<TagFormProps> = ({ isOpen, onClose }) => {
  const { tags, addTag, deleteTag } = useAppContext();
  const { showToast } = useToast();
  
  const [formData, setFormData] = useState({
    name: '',
    color: TAG_COLORS[0],
  });
  
  const handleSubmit = () => {
    if (!formData.name) {
      showToast('請輸入標籤名稱', 'error');
      return;
    }
    
    const newTag: Tag = {
      id: generateId(),
      name: formData.name,
      color: formData.color,
    };
    
    addTag(newTag);
    setFormData({ name: '', color: TAG_COLORS[0] });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('確定要刪除這個標籤嗎？')) {
      deleteTag(id);
    }
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理標籤">
      <div className="space-y-4">
        {/* 現有標籤列表 */}
        <div>
          <p className="text-xs text-gray-500 mb-2">
            目前有 {tags.length} 個標籤
          </p>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {tags.map((tag) => (
                <div 
                  key={tag.id} 
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full text-white text-sm"
                  style={{ backgroundColor: tag.color }}
                >
                  <span>{tag.name}</span>
                  <button
                    onClick={() => handleDelete(tag.id)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-4">尚無標籤</p>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">新增標籤</p>
          
          <Input
            type="text"
            label="標籤名稱"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="例如：重要、可報稅"
          />
          
          <div className="mt-3">
            <label className="text-xs text-gray-500 font-medium ml-1 mb-2 block">
              選擇顏色
            </label>
            <div className="flex gap-2 flex-wrap">
              {TAG_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({...formData, color})}
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          
          <Button onClick={handleSubmit} className="w-full py-3 mt-4">
            新增標籤
          </Button>
        </div>
      </div>
    </Modal>
  );
};
