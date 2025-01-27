// src/components/DataTable.tsx
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

interface DataTableProps {
  columns: Column[];
  rows: RowData[];
  setRows: React.Dispatch<React.SetStateAction<RowData[]>>;
}

export default function DataTable({ columns, rows, setRows }: DataTableProps) {
  function handleDescriptionChange(rowId: number, value: string) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, description: value } : row
      )
    );
  }

  function handleAmountChange(rowId: number, colId: string, value: string) {
    const numVal = Number(value);
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              amounts: { ...row.amounts, [colId]: numVal },
            }
          : row
      )
    );
  }

  function handleRemoveRow(rowId: number) {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem" }}>
      <h3>Data Table</h3>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#f0f0f0" }}>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Description
            </th>
            {columns.map((col) => (
              <th key={col.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                {col.label}
              </th>
            ))}
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Remove</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {/* Description */}
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              {/* Amounts */}
              {columns.map((col) => {
                const val = row.amounts[col.id] || 0;
                return (
                  <td key={col.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => handleAmountChange(row.id, col.id, e.target.value)}
                      style={{ width: "100%" }}
                    />
                  </td>
                );
              })}
              {/* Remove button */}
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                <button style={{ color: "red" }} onClick={() => handleRemoveRow(row.id)}>
                  X
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
