"use client";
import { useState } from 'react';
import DataTable from '@/components/DataTable';
import YoyRatesPanel from '@/components/YoyRatesPanel';

export default function FinancialPlanner() {
  const [columns, setColumns] = useState([
    { id: 'year1', label: 'Year 1' },
    { id: 'year2', label: 'Year 2' },
    { id: 'year3', label: 'Year 3' },
  ]);

  const [rows, setRows] = useState([
    { id: 1, description: 'Licensing', amounts: { year1: 100, year2: 110, year3: 120 } },
    { id: 2, description: 'Subscriptions', amounts: { year1: 50, year2: 55, year3: 60 } },
  ]);

  const [yoyRates, setYoyRates] = useState([
    { fromCol: 'year1', toCol: 'year2', rate: 5 },
    { fromCol: 'year2', toCol: 'year3', rate: 10 },
  ]);

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Financial Planner</h2>

      <YoyRatesPanel
        columns={columns}
        yoyRates={yoyRates}
        setYoyRates={setYoyRates}
        rows={rows}
        setRows={setRows}
      />

      <DataTable columns={columns} rows={rows} setRows={setRows} />
    </div>
  );
}
