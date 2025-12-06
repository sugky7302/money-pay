// CategoryPieChart.tsx
// DEPENDENCY: recharts

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../../shared/lib/utils';

interface CategoryData {
  category: string;
  amount: number;
  percentage?: number;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data }) => {
  const total = data.reduce((sum, item) => sum + (item.amount || 0), 0);

  const tooltipFormatter = (value: number, _name: string, props: { payload?: CategoryData }) => {
    const pct = props.payload?.percentage ?? (total > 0 ? (value / total) * 100 : 0);
    return [`${formatCurrency(value)} (${pct.toFixed(1)}%)`, props.payload?.category || '金額'];
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="amount"
          nameKey="category"
          label={({ cx, cy, midAngle, innerRadius, outerRadius, payload }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
            const pct = payload?.percentage ?? 0;
            return (
              <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                {`${pct.toFixed(0)}%`}
              </text>
            );
          }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
