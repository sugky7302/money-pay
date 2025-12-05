// Shared utility functions

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('zh-TW', { 
    style: 'currency', 
    currency: 'TWD', 
    minimumFractionDigits: 0 
  }).format(amount);
};

export const getCurrentMonth = (): string => {
  return new Date().toISOString().slice(0, 7);
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

export const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const generateId = (): number => {
  return Date.now();
};
