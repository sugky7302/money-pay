// CategoryChart.tsx
// DEPENDENCY: recharts

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '../../../shared/lib/utils';

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryChartProps {
  data: CategoryData[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="category"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={80}
          tickFormatter={(value) => (value.length > 5 ? `${value.slice(0, 5)}...` : value)}
        />
        <Tooltip
          cursor={{ fill: 'rgba(243, 244, 246, 0.5)' }}
          contentStyle={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
            padding: '8px 12px',
          }}
          formatter={(value: number) => [formatCurrency(value), '金額']}
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};