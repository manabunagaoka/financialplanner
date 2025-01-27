"use client";
import React from "react";

interface Column {
  id: string;
  label: string;
}

interface RowData {
  id: number;
  description: string;
  amounts: Record<string, number>;
}

interface YoyRate {
  fromCol: string;
  toCol: string;
  rate: number;  // e.g., 5 for 5%
}

interface YoyRatesPanelProps {
  columns: Column[];
  yoyRates: YoyRate[];
  setYoyRates: React.Dispatch<React.SetStateAction<YoyRate[]>>;
  rows: RowData[];
  setRows: React.Dispatch<React.SetStateAction<RowData[]>>;
}

export default function YoyRatesPanel({
  columns,
  yoyRates,
  setYoyRates,
  rows,
  setRows,
}: YoyRatesPanelProps) {

  // If user changes a yoy rate for one pair
  function handleRateChange(index: number, value: string) {
    const parsed = parseFloat(value) || 0;
    setYoyRates((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], rate: parsed };
      return copy;
    });
  }

  // This is the critical part: we actually modify row.amounts
  // for each yoyRate. For example, if yoyRate is { fromCol: 'year1', toCol: 'year2', rate: 5 },
  // we do row.amounts['year2'] = row.amounts['year1'] * 1.05
  function applyGrowth() {
    setRows((prevRows) => {
      // For each row
      return prevRows.map((row) => {
        // For each yoyRate
        yoyRates.forEach((yr) => {
          const fromVal = row.amounts[yr.fromCol] ?? 0;
          const factor = 1 + yr.rate / 100;
          row.amounts[yr.toCol] = Math.round(fromVal * factor * 100) / 100; 
          // rounding to 2 decimals, optional
        });
        return { ...row }; // returning a copy of the row
      });
    });
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h3>Year-over-Year Growth Rates</h3>
      {yoyRates.map((yr, i) => (
        <div key={i} style={{ marginBottom: "0.5rem" }}>
          <label>
            {yr.fromCol} → {yr.toCol}:
            <input
              type="number"
              step="0.01"
              value={yr.rate}
              onChange={(e) => handleRateChange(i, e.target.value)}
              style={{ marginLeft: "0.5rem", width: "4rem" }}
            />
            %
          </label>
        </div>
      ))}

      <button
        onClick={applyGrowth}
        style={{ marginTop: "0.5rem" }}
      >
        Apply Growth
      </button>
    </div>
  );
}
