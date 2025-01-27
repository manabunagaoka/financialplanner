import FinancialDashboard from "@/components/FinancialDashboard";

export default function Page() {
  return (
    <main style={{ padding: "2rem" }}>
      <h1 style={{ marginBottom: "1rem" }}>Dashboard</h1>
      {/* Render the main client component */}
      <FinancialDashboard />
    </main>
  );
}
