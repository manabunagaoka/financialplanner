"use client";

import { useState } from "react";

// Each row will have a unique id, a description, and a dynamic set of amounts
interface RevenueItem {
  id: number;
  description: string;
  amounts: Record<string, number>; // Keyed by columnId (e.g., 'year1', 'year2')
}

// Each column has an id (like 'year1') and a label (e.g., 'Year 1')
interface Column {
  id: string;
  label: string;
}

export default function Page() {
  // Start with three default columns (Year 1, Year 2, Year 3)
  const [columns, setColumns] = useState<Column[]>([
    { id: "year1", label: "Year 1" },
    { id: "year2", label: "Year 2" },
    { id: "year3", label: "Year 3" },
  ]);

  // No rows initially. Each row will have .amounts[columnId] = number
  const [revenueItems, setRevenueItems] = useState<RevenueItem[]>([]);

  // Add a new row with blank description and 0 for each column's amount
  const handleAddRow = () => {
    const newRow: RevenueItem = {
      id: Date.now(),
      description: "",
      amounts: {},
    };
    // Initialize all current columns to 0 in the new row
    columns.forEach((col) => {
      newRow.amounts[col.id] = 0;
    });

    setRevenueItems((prev) => [...prev, newRow]);
  };

  // Remove a row by id
  const handleRemoveRow = (id: number) => {
    setRevenueItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Update a row's description or amounts
  const handleChangeDescription = (id: number, value: string) => {
    setRevenueItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, description: value } : item
      )
    );
  };

  const handleChangeAmount = (rowId: number, colId: string, value: string) => {
    const amount = Number(value);
    setRevenueItems((prev) =>
      prev.map((item) => {
        if (item.id === rowId) {
          return {
            ...item,
            amounts: {
              ...item.amounts,
              [colId]: amount,
            },
          };
        }
        return item;
      })
    );
  };

  // Add a new column (e.g., Year 4)
  // We'll auto-generate a column id based on how many columns exist
  const handleAddColumn = () => {
    const nextIndex = columns.length + 1;
    const newColId = `year${nextIndex}`;
    const newColLabel = `Year ${nextIndex}`;

    const newCol: Column = { id: newColId, label: newColLabel };

    // Update each existing row so it has an amount for the new column
    setRevenueItems((prev) =>
      prev.map((item) => ({
        ...item,
        amounts: { ...item.amounts, [newColId]: 0 },
      }))
    );

    // Finally, add the new column to the columns array
    setColumns((prevCols) => [...prevCols, newCol]);
  };

  // Calculate totals for each column across all rows
  const columnTotals: Record<string, number> = {};
  columns.forEach((col) => {
    let sum = 0;
    revenueItems.forEach((item) => {
      sum += item.amounts[col.id] || 0;
    });
    columnTotals[col.id] = sum;
  });

  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>
        3-Year Plan (Expandable)
      </h1>

      <p>
        Below is a dynamic table with multiple years (columns) and revenue items
        (rows). You can add new columns or new rows as needed.
      </p>

      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={handleAddRow}
          style={{
            padding: "8px 16px",
            backgroundColor: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            marginRight: "1rem",
          }}
        >
          Add Revenue Item
        </button>
        <button
          onClick={handleAddColumn}
          style={{
            padding: "8px 16px",
            backgroundColor: "green",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Add Column
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
            {columns.map((col) => (
              <th key={col.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                {col.label}
              </th>
            ))}
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>
              Remove
            </th>
          </tr>
        </thead>
        <tbody>
          {revenueItems.map((item) => (
            <tr key={item.id}>
              {/* Description Cell */}
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) =>
                    handleChangeDescription(item.id, e.target.value)
                  }
                  style={{ width: "100%" }}
                />
              </td>

              {/* Amount Cells for Each Column */}
              {columns.map((col) => (
                <td key={col.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                  <input
                    type="number"
                    value={item.amounts[col.id]}
                    onChange={(e) =>
                      handleChangeAmount(item.id, col.id, e.target.value)
                    }
                    style={{ width: "100%" }}
                  />
                </td>
              ))}

              {/* Remove Row */}
              <td style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}>
                <button
                  onClick={() => handleRemoveRow(item.id)}
                  style={{ color: "red", cursor: "pointer" }}
                >
                  X
                </button>
              </td>
            </tr>
          ))}

          {/* Totals Row */}
          {revenueItems.length > 0 && (
            <tr style={{ backgroundColor: "#fafafa", fontWeight: "bold" }}>
              <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                Totals
              </td>
              {columns.map((col) => (
                <td key={col.id} style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {columnTotals[col.id]}
                </td>
              ))}
              <td style={{ border: "1px solid #ccc", padding: "8px" }} />
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
