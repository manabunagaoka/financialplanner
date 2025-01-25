"use client";

import { useState } from "react";

// Each column: e.g., { id: 'year1', label: 'Year 1' }
interface Column {
  id: string;
  label: string;
}

// Each row: e.g., { id: 12345, description: 'Licensing', amounts: { year1: 100, year2: 110 } }
interface RowData {
  id: number;
  description: string;
  amounts: Record<string, number>;
}

export default function Page() {
  // -----------------------
  // INITIAL COLUMNS
  // -----------------------
  const [revenueColumns, setRevenueColumns] = useState<Column[]>([
    { id: "year1", label: "Year 1" },
    { id: "year2", label: "Year 2" },
    { id: "year3", label: "Year 3" },
  ]);
  const [expenseColumns, setExpenseColumns] = useState<Column[]>([
    { id: "year1", label: "Year 1" },
    { id: "year2", label: "Year 2" },
    { id: "year3", label: "Year 3" },
  ]);

  // -----------------------
  // ROW DATA
  // -----------------------
  const [revenueRows, setRevenueRows] = useState<RowData[]>([]);
  const [expenseRows, setExpenseRows] = useState<RowData[]>([]);

  // -----------------------
  // YOY GROWTH STATE
  // -----------------------
  const [yoyGrowth, setYoyGrowth] = useState<number>(0);

  // -----------------------
  // HELPER FUNCTIONS
  // -----------------------

  // Add a new column (for either revenue or expenses)
  function handleAddColumn(
    columns: Column[],
    setColumns: React.Dispatch<React.SetStateAction<Column[]>>,
    rows: RowData[],
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  ) {
    const nextIndex = columns.length + 1;
    const newColId = `year${nextIndex}`;
    const newColLabel = `Year ${nextIndex}`;

    // Add this new column to each row in 'rows' with an initial amount of 0
    setRows((prevRows) =>
      prevRows.map((row) => ({
        ...row,
        amounts: { ...row.amounts, [newColId]: 0 },
      }))
    );

    // Add the column to the columns array
    setColumns((prevCols) => [
      ...prevCols,
      { id: newColId, label: newColLabel },
    ]);
  }

  // Add a new row (for either revenue or expenses)
  function handleAddRow(
    columns: Column[],
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  ) {
    const newRow: RowData = {
      id: Date.now(),
      description: "",
      amounts: {},
    };

    // Initialize all current columns to 0
    columns.forEach((col) => {
      newRow.amounts[col.id] = 0;
    });

    setRows((prev) => [...prev, newRow]);
  }

  // Remove a row by ID
  function handleRemoveRow(
    rowId: number,
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  ) {
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  }

  // Handle description change
  function handleDescriptionChange(
    rowId: number,
    value: string,
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  ) {
    setRows((prev) =>
      prev.map((row) =>
        row.id === rowId ? { ...row, description: value } : row
      )
    );
  }

  // Handle amount change
  function handleAmountChange(
    rowId: number,
    colId: string,
    value: string,
    setRows: React.Dispatch<React.SetStateAction<RowData[]>>
  ) {
    // Parse float so we can store decimal values
    const amount = parseFloat(value) || 0;
    setRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return {
            ...row,
            amounts: {
              ...row.amounts,
              [colId]: amount,
            },
          };
        }
        return row;
      })
    );
  }

  // Compute totals for each column
  function computeColumnTotals(columns: Column[], rows: RowData[]) {
    const totals: Record<string, number> = {};
    columns.forEach((col) => {
      let sum = 0;
      rows.forEach((row) => {
        sum += row.amounts[col.id] || 0;
      });
      totals[col.id] = sum;
    });
    return totals;
  }

  // Apply YoY growth with TWO DECIMAL rounding
  // Sort columns by numeric suffix (year1, year2, etc.), then for each row:
  //   row.amounts[year2] = row.amounts[year1] * (1 + yoyGrowth/100)
  //   row.amounts[year3] = row.amounts[year2] * (1 + yoyGrowth/100), etc.
  function applyYoyGrowth(
    columns: Column[],
    rows: RowData[],
    growth: number
  ): RowData[] {
    if (growth === 0) return rows; // no change if growth is 0

    // Sort columns in ascending numeric order: year1, year2, year3...
    const sortedCols = [...columns].sort((a, b) => {
      const aNum = parseInt(a.id.replace("year", ""), 10);
      const bNum = parseInt(b.id.replace("year", ""), 10);
      return aNum - bNum;
    });

    const updatedRows = rows.map((row) => {
      let prevVal = row.amounts[sortedCols[0].id] || 0;

      for (let i = 1; i < sortedCols.length; i++) {
        const colId = sortedCols[i].id;
        const factor = 1 + growth / 100;
        // Calculate new value
        const newVal = prevVal * factor;
        // Round to two decimals
        const twoDecimals = Math.round(newVal * 100) / 100;
        row.amounts[colId] = twoDecimals;
        prevVal = twoDecimals;
      }
      return row;
    });

    return updatedRows;
  }

  // Compute CAGR for revenue
  // Must have at least 2 columns (year1, year2).
  // Formula: ((lastYearTotal / firstYearTotal)^(1/(numYears-1)) - 1) * 100
  function computeCAGR(columns: Column[], totals: Record<string, number>) {
    if (columns.length < 2) return "N/A";

    // Sort columns to find first and last
    const sortedCols = [...columns].sort((a, b) => {
      const aNum = parseInt(a.id.replace("year", ""), 10);
      const bNum = parseInt(b.id.replace("year", ""), 10);
      return aNum - bNum;
    });
    const firstCol = sortedCols[0].id;
    const lastCol = sortedCols[sortedCols.length - 1].id;

    const firstVal = totals[firstCol] || 0;
    const lastVal = totals[lastCol] || 0;
    if (firstVal === 0) return "N/A"; // avoid division by zero

    const numYears = sortedCols.length;
    const cagr = Math.pow(lastVal / firstVal, 1 / (numYears - 1)) - 1;
    const cagrPct = cagr * 100;

    // Format to two decimals
    return cagrPct.toFixed(2) + "%";
  }

  // -----------------------
  // CALCULATE TOTALS
  // -----------------------
  const revenueTotals = computeColumnTotals(revenueColumns, revenueRows);
  const expenseTotals = computeColumnTotals(expenseColumns, expenseRows);

  // Net = revenue - expenses for each column
  const netTotals: Record<string, number> = {};
  revenueColumns.forEach((col) => {
    const r = revenueTotals[col.id] || 0;
    const e = expenseTotals[col.id] || 0;
    netTotals[col.id] = r - e;
  });

  // Compute revenue CAGR (two+ columns needed)
  const revenueCAGR = computeCAGR(revenueColumns, revenueTotals);

  // -----------------------
  // RENDER
  // -----------------------
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        Financial Planner: 2-Decimal YoY + P&L
      </h1>
      <p>
        Enter a YoY Growth rate and click \"Apply Growth\". \"Year 1\" is
        your baseline, subsequent columns multiply by (1 + rate/100) with two-decimal rounding.
      </p>

      {/* YoY Growth Input */}
      <div style={{ marginBottom: "1rem" }}>
        <label htmlFor="yoyGrowth" style={{ marginRight: "0.5rem" }}>
          YoY Growth (%):
        </label>
        <input
          id="yoyGrowth"
          type="number"
          value={yoyGrowth}
          onChange={(e) => setYoyGrowth(parseFloat(e.target.value) || 0)}
          style={{ width: "4rem", marginRight: "1rem" }}
        />
        <button
          style={{
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            padding: "8px 16px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
          onClick={() => {
            // Apply growth to both revenue and expenses (optional, or just revenue)
            const updatedRev = applyYoyGrowth(
              revenueColumns,
              revenueRows,
              yoyGrowth
            );
            setRevenueRows([...updatedRev]);

            const updatedExp = applyYoyGrowth(
              expenseColumns,
              expenseRows,
              yoyGrowth
            );
            setExpenseRows([...updatedExp]);
          }}
        >
          Apply Growth
        </button>
      </div>

      {/* REVENUE SECTION */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Revenue</h2>
        <div>
          <button
            onClick={() => handleAddRow(revenueColumns, setRevenueRows)}
            style={{
              marginRight: "1rem",
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Revenue Row
          </button>
          <button
            onClick={() =>
              handleAddColumn(
                revenueColumns,
                setRevenueColumns,
                revenueRows,
                setRevenueRows
              )
            }
            style={{
              padding: "8px 16px",
              backgroundColor: "green",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Revenue Column
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Description
              </th>
              {revenueColumns.map((col) => (
                <th
                  key={col.id}
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                >
                  {col.label}
                </th>
              ))}
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Remove
              </th>
            </tr>
          </thead>
          <tbody>
            {revenueRows.map((row) => (
              <tr key={row.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      handleDescriptionChange(row.id, e.target.value, setRevenueRows)
                    }
                    style={{ width: "100%" }}
                  />
                </td>
                {revenueColumns.map((col) => {
                  // 2-decimal display
                  const val = row.amounts[col.id] ?? 0;
                  return (
                    <td
                      key={col.id}
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                    >
                      <input
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={(e) =>
                          handleAmountChange(row.id, col.id, e.target.value, setRevenueRows)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                  );
                })}
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleRemoveRow(row.id, setRevenueRows)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {revenueRows.length > 0 && (
              <tr style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Total
                </td>
                {revenueColumns.map((col) => {
                  const total = revenueTotals[col.id] ?? 0;
                  return (
                    <td
                      key={col.id}
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                    >
                      {total.toFixed(2)}
                    </td>
                  );
                })}
                <td style={{ border: "1px solid #ccc", padding: "8px" }} />
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* EXPENSE SECTION */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Expenses</h2>
        <div>
          <button
            onClick={() => handleAddRow(expenseColumns, setExpenseRows)}
            style={{
              marginRight: "1rem",
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Expense Row
          </button>
          <button
            onClick={() =>
              handleAddColumn(
                expenseColumns,
                setExpenseColumns,
                expenseRows,
                setExpenseRows
              )
            }
            style={{
              padding: "8px 16px",
              backgroundColor: "green",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Add Expense Column
          </button>
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Description
              </th>
              {expenseColumns.map((col) => (
                <th
                  key={col.id}
                  style={{ border: "1px solid #ccc", padding: "8px" }}
                >
                  {col.label}
                </th>
              ))}
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Remove
              </th>
            </tr>
          </thead>
          <tbody>
            {expenseRows.map((row) => (
              <tr key={row.id}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <input
                    type="text"
                    value={row.description}
                    onChange={(e) =>
                      handleDescriptionChange(row.id, e.target.value, setExpenseRows)
                    }
                    style={{ width: "100%" }}
                  />
                </td>
                {expenseColumns.map((col) => {
                  const val = row.amounts[col.id] ?? 0;
                  return (
                    <td
                      key={col.id}
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                    >
                      <input
                        type="number"
                        step="0.01"
                        value={val}
                        onChange={(e) =>
                          handleAmountChange(row.id, col.id, e.target.value, setExpenseRows)
                        }
                        style={{ width: "100%" }}
                      />
                    </td>
                  );
                })}
                <td
                  style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    textAlign: "center",
                  }}
                >
                  <button
                    onClick={() => handleRemoveRow(row.id, setExpenseRows)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    X
                  </button>
                </td>
              </tr>
            ))}

            {/* Totals row */}
            {expenseRows.length > 0 && (
              <tr style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  Total
                </td>
                {expenseColumns.map((col) => {
                  const total = expenseTotals[col.id] ?? 0;
                  return (
                    <td
                      key={col.id}
                      style={{ border: "1px solid #ccc", padding: "8px" }}
                    >
                      {total.toFixed(2)}
                    </td>
                  );
                })}
                <td style={{ border: "1px solid #ccc", padding: "8px" }} />
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* SUMMARY (NET INCOME + CAGR) */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>Summary</h2>
        <table style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Column
              </th>
              <th style={{ border: "1px solid #ccc", padding: "8px" }}>
                Net Income
              </th>
            </tr>
          </thead>
          <tbody>
            {revenueColumns.map((col) => {
              const net = netTotals[col.id] ?? 0;
              return (
                <tr key={col.id}>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {col.label}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                    {net.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ marginTop: "1rem" }}>
          <strong>Revenue CAGR:</strong> {revenueCAGR}
        </div>
      </section>
    </main>
  );
}
