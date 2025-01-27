"use client";

import { useState, useEffect } from "react";
import AssumptionCard from "./AssumptionCard";
import RevenueCard from "./RevenueCard";
import RevenueChartCard from "./RevenueChartCard";
import CagrCard from "./CagrCard";

/** yoyRates => array with e.g. { index:0, rate:5 } for Y1->Y2. */
interface YoyRate {
  index: number;
  rate: number;
}

/** Each row in the revenue table */
interface RevenueRow {
  id: number;
  description: string;
  amounts: number[]; // length = term
}

/** Sums each column i across all rows */
function getColumnTotals(rows: RevenueRow[], term: number): number[] {
  const totals = Array(term).fill(0);
  rows.forEach((row) => {
    row.amounts.forEach((amt, i) => {
      if (i < term) {
        totals[i] += amt;
      }
    });
  });
  return totals;
}

/** CAGR formula: (lastVal / firstVal)^(1/(term-1)) - 1 */
function computeCagr(columnTotals: number[], term: number): number | null {
  if (term < 2) return null;
  const firstVal = columnTotals[0] || 0;
  const lastVal = columnTotals[term - 1] || 0;
  if (firstVal <= 0) return null; // avoid div by zero or negative

  const cagr = Math.pow(lastVal / firstVal, 1 / (term - 1)) - 1;
  return cagr * 100; // e.g. 22 => 22%
}

export default function FinancialDashboard() {
  // ---------------------------
  // State
  // ---------------------------
  const [term, setTerm] = useState(3);         // e.g. 3 => Y1,Y2,Y3
  const [numItems, setNumItems] = useState(3); // how many rows

  // yoyRates => e.g. for term=3, yoyRates: 2 elements
  const [yoyRates, setYoyRates] = useState<YoyRate[]>([
    { index: 0, rate: 5 },  // Y1->Y2
    { index: 1, rate: 10 }, // Y2->Y3
  ]);

  // The rows in our table
  const [rows, setRows] = useState<RevenueRow[]>(() => {
    // default 3 items for a 3-year plan
    const init: RevenueRow[] = [];
    for (let i = 0; i < 3; i++) {
      init.push({
        id: Date.now() + i,
        description: "",
        amounts: [0, 0, 0],
      });
    }
    return init;
  });

  // We track if we’re in the middle of an internal update to avoid infinite loops
  const [internalUpdate, setInternalUpdate] = useState(false);

  // ---------------------------
  // 1) Adjust yoyRates + row array sizes if term or numItems changes
  // ---------------------------
  useEffect(() => {
    if (internalUpdate) return;

    setInternalUpdate(true);

    // (A) yoyRates => size = term-1
    const newYoy: YoyRate[] = [];
    for (let i = 0; i < term - 1; i++) {
      newYoy.push({
        index: i,
        rate: yoyRates[i]?.rate ?? 0,
      });
    }

    // (B) rows => amounts => length = term
    let newRows = rows.map((row) => {
      const copy = [...row.amounts];
      while (copy.length < term) copy.push(0);
      while (copy.length > term) copy.pop();
      return { ...row, amounts: copy };
    });

    // (C) if numItems changed => add or remove row
    if (newRows.length < numItems) {
      const needed = numItems - newRows.length;
      for (let i = 0; i < needed; i++) {
        newRows.push({
          id: Date.now() + i,
          description: "",
          amounts: Array(term).fill(0),
        });
      }
    } else if (newRows.length > numItems) {
      newRows = newRows.slice(0, numItems);
    }

    setYoyRates(newYoy);
    setRows(newRows);

    // release lock
    setTimeout(() => setInternalUpdate(false), 0);
  }, [term, numItems]); 
  // <= Important: don't include "rows" or "yoyRates" in dependency array here
  // or it might re-trigger repeatedly.

  // ---------------------------
  // 2) Recalc yoy if yoyRates or first-year amounts changed
  // ---------------------------
  useEffect(() => {
    if (internalUpdate) return;

    // We'll produce a new version of rows with updated yoy for columns > 0
    let changed = false;
    const updated = rows.map((row) => {
      const newAmts = [...row.amounts];
      for (let i = 1; i < term; i++) {
        const yoy = yoyRates[i - 1]?.rate ?? 0;
        const oldVal = newAmts[i];
        const newVal = Math.round(newAmts[i - 1] * (1 + yoy / 100) * 100) / 100;
        if (newVal !== oldVal) {
          changed = true;
          newAmts[i] = newVal;
        }
      }
      return { ...row, amounts: newAmts };
    });

    if (changed) {
      setInternalUpdate(true);
      setRows(updated);
      setTimeout(() => setInternalUpdate(false), 0);
    }
  }, [rows, yoyRates, term]); 
  // <= we don't watch `internalUpdate` here. If "changed = false" => we won't setRows.

  // ---------------------------
  // 3) Compute columnTotals + CAGR
  // ---------------------------
  const columnTotals = getColumnTotals(rows, term);
  const cagrValue = computeCagr(columnTotals, term);

  return (
    <div>
      <AssumptionCard
        term={term}
        setTerm={setTerm}
        numItems={numItems}
        setNumItems={setNumItems}
        yoyRates={yoyRates}   // ensure yoyRates is passed
        setYoyRates={setYoyRates}
      />

      <RevenueCard
        term={term}
        rows={rows}
        setRows={setRows}
        columnTotals={columnTotals}
      />

      {/* dynamically import or direct import if it doesn't cause hydration issues */}
      <RevenueChartCard columnTotals={columnTotals} />

      <CagrCard cagrValue={cagrValue} />
    </div>
  );
}
