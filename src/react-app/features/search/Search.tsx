// Search Feature

import React, { useState } from 'react';
import { Transaction, SearchFilters } from '../../shared/types';
import { useAppContext } from '../../app/AppContext';
import { Modal } from '../../shared/ui/Modal';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';

interface SearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (results: Transaction[]) => void;
}

export const Search: React.FC<SearchProps> = ({ isOpen, onClose, onSearch }) => {
  const { transactions } = useAppContext();
  
  const [filters, setFilters] = useState<SearchFilters>({
    startDate: '',
    endDate: '',
    tags: [],
    categories: [],
    minAmount: undefined,
    maxAmount: undefined,
  });
  
  const handleSearch = () => {
    let results = [...transactions];
    
    // Filter by date range
    if (filters.startDate) {
      results = results.filter(t => t.date >= filters.startDate!);
    }
    if (filters.endDate) {
      results = results.filter(t => t.date <= filters.endDate!);
    }
    
    // Filter by category
    if (filters.categories && filters.categories.length > 0) {
      results = results.filter(t => filters.categories!.includes(t.category));
    }
    
    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter(t => 
        t.tags && t.tags.some((tag: string) => filters.tags!.includes(tag))
      );
    }
    
    // Filter by amount range
    if (filters.minAmount !== undefined) {
      results = results.filter(t => t.amount >= filters.minAmount!);
    }
    if (filters.maxAmount !== undefined) {
      results = results.filter(t => t.amount <= filters.maxAmount!);
    }
    
    // Filter by merchant
    if (filters.merchant) {
      results = results.filter(t => t.merchant === filters.merchant);
    }
    
    // Filter by account
    if (filters.account) {
      results = results.filter(t => t.account === filters.account);
    }
    
    onSearch(results);
    onClose();
  };
  
  const handleReset = () => {
    setFilters({
      startDate: '',
      endDate: '',
      tags: [],
      categories: [],
      minAmount: undefined,
      maxAmount: undefined,
    });
    onSearch(transactions);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="搜尋交易">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="起始日期"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
          />
          <Input
            type="date"
            label="結束日期"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="number"
            label="最小金額"
            value={filters.minAmount || ''}
            onChange={(e) => setFilters({...filters, minAmount: e.target.value ? Number(e.target.value) : undefined})}
            placeholder="0"
          />
          <Input
            type="number"
            label="最大金額"
            value={filters.maxAmount || ''}
            onChange={(e) => setFilters({...filters, maxAmount: e.target.value ? Number(e.target.value) : undefined})}
            placeholder="無上限"
          />
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleSearch} className="flex-1 py-3">
            搜尋
          </Button>
          <Button onClick={handleReset} variant="secondary" className="flex-1 py-3">
            重置
          </Button>
        </div>
      </div>
    </Modal>
  );
};
