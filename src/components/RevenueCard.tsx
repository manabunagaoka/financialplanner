"use client";

import React from "react";

interface RevenueRow {
  id: number;
  description: string;
  amounts: number[];
}

interface RevenueCardProps {
  term: number;
  rows: RevenueRow[];
  setRows: React.Dispatch<React.SetStateAction<RevenueRow[]>>;
  columnTotals: number[];
}

export default function RevenueCard({
  term,
  rows,
  setRows,
  columnTotals,
}: RevenueCardProps) {
  function handleDescriptionChange(rowId: number, val: string) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, description: val } : row
      )
    );
  }

  function handleAmountChange(rowId: number, colIdx: number, val: string) {
    const parsed = parseFloat(val) || 0;
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId
          ? {
              ...row,
              amounts: row.amounts.map((amt, i) =>
                i === colIdx ? parsed : amt
              ),
            }
          : row
      )
    );
  }

  function handleRemoveRow(rowId: number) {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  return (
    <div style={cardStyle}>
      <h2>Revenue</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f0f0f0" }}>
            <th style={cellStyle}>Item</th>
            {Array.from({ length: term }).map((_, i) => (
              <th key={i} style={cellStyle}>
                Year {i + 1}
              </th>
            ))}
            <th style={cellStyle}>Delete</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td style={cellStyle}>
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) => handleDescriptionChange(row.id, e.target.value)}
                  style={{ width: "100%" }}
                />
              </td>
              {row.amounts.map((amt, i) => (
                <td key={i} style={cellStyle}>
                  <input
                    type="number"
                    value={amt}
                    onChange={(e) => handleAmountChange(row.id, i, e.target.value)}
                    style={{ width: "5rem" }}
                  />
                </td>
              ))}
              <td style={cellStyle}>
                <button style={{ color: "red" }} onClick={() => handleRemoveRow(row.id)}>
                  X
                </button>
              </td>
            </tr>
          ))}

          {/* total row */}
          <tr style={{ background: "#fafafa", fontWeight: "bold" }}>
            <td style={cellStyle}>Total</td>
            {columnTotals.map((total, i) => (
              <td key={i} style={cellStyle}>
                {total.toFixed(2)}
              </td>
            ))}
            <td style={cellStyle}></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "6px",
};

const cellStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "center",
};
