"use client";

import React from "react";

interface CagrCardProps {
  cagrValue: number | null; // if null => no valid CAGR
}

export default function CagrCard({ cagrValue }: CagrCardProps) {
  return (
    <div style={cardStyle}>
      <h2>CAGR</h2>
      {cagrValue === null ? (
        <p>N/A</p>
      ) : (
        <p>{cagrValue.toFixed(2)}%</p>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  border: "1px solid #ccc",
  padding: "1rem",
  marginBottom: "1rem",
  borderRadius: "6px",
};
