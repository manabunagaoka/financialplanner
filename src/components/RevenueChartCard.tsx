// src/components/RevenueChartCard.tsx
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// Props: we expect an array of columnTotals
interface RevenueChartCardProps {
  columnTotals: number[];
}

export default function RevenueChartCard({ columnTotals }: RevenueChartCardProps) {
  const data = columnTotals.map((val, idx) => ({
    name: `Year ${idx + 1}`,
    total: val,
  }));

  return (
    <div style={cardStyle}>
      <h2>Revenue Chart</h2>
      <BarChart width={500} height={300} data={data}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='name' />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey='total' fill='#8884d8' />
      </BarChart>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '1rem',
  marginBottom: '1rem',
  borderRadius: '6px',
};
