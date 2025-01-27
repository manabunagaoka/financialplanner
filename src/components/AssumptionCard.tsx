"use client";

import React from "react";

interface YoyRate {
  index: number;
  rate: number;
}

interface AssumptionCardProps {
  term: number;
  setTerm: React.Dispatch<React.SetStateAction<number>>;
  numItems: number;
  setNumItems: React.Dispatch<React.SetStateAction<number>>;
  yoyRates: YoyRate[];
  setYoyRates: React.Dispatch<React.SetStateAction<YoyRate[]>>;
}

export default function AssumptionCard({
  term,
  setTerm,
  numItems,
  setNumItems,
  yoyRates,
  setYoyRates,
}: AssumptionCardProps) {
  function handleTermChange(val: string) {
    const parsed = parseInt(val, 10) || 1;
    setTerm(parsed < 1 ? 1 : parsed);
  }

  function handleNumItemsChange(val: string) {
    const parsed = parseInt(val, 10) || 1;
    setNumItems(parsed < 1 ? 1 : parsed);
  }

  function handleRateChange(idx: number, val: string) {
    const parsed = parseFloat(val) || 0;
    setYoyRates((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { index: idx, rate: parsed };
      }
      return copy;
    });
  }

  return (
    <div style={cardStyle}>
      <h2>Assumption</h2>
      <div style={{ marginBottom: "1rem" }}>
        <label>Term (Years): </label>
        <input
          type="number"
          value={term}
          onChange={(e) => handleTermChange(e.target.value)}
          style={{ width: "3rem", marginLeft: "0.5rem" }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label>Number of Items: </label>
        <input
          type="number"
          value={numItems}
          onChange={(e) => handleNumItemsChange(e.target.value)}
          style={{ width: "3rem", marginLeft: "0.5rem" }}
        />
      </div>

      <p>YOY Rates (Year i → i+1):</p>
      <div style={{ display: "flex", gap: "1rem" }}>
        {yoyRates.map((yr, idx) => (
          <div key={yr.index}>
            <label>
              Y{yr.index + 1} → Y{yr.index + 2} (%):
              <input
                type="number"
                step="0.01"
                value={yr.rate}
                onChange={(e) => handleRateChange(idx, e.target.value)}
                style={{ width: "4rem", marginLeft: "0.5rem" }}
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "6px",
};
