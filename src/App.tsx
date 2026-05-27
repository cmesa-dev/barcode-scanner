import { FormEvent, useEffect, useMemo, useState } from "react";
import { getDashboard, submitScan } from "./api";
import type { Dashboard, Product, ScanMode } from "./types";
import "./styles.css";

const DEMO_CODES = ["8410000010011", "8410000010042", "8410000010073"];

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function stockState(product: Product): string {
  if (product.stock === 0) return "empty";
  if (product.stock <= product.reorderLevel) return "low";
  return "healthy";
}

export default function App() {
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [barcode, setBarcode] = useState(DEMO_CODES[0]);
  const [mode, setMode] = useState<ScanMode>("sale");
  const [notice, setNotice] = useState("Select a workflow and submit a barcode.");
  const [pending, setPending] = useState(false);

  async function refresh() {
    try {
      setDashboard(await getDashboard());
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Unable to load inventory.");
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const movement = await submitScan(barcode.trim(), mode);
      setNotice(
        `${movement.mode === "sale" ? "Sale" : "Restock"} recorded for ${movement.productName}. Stock: ${movement.stockAfter}.`,
      );
      await refresh();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Scan could not be recorded.");
    } finally {
      setPending(false);
    }
  }

  const sortedProducts = useMemo(
    () => [...(dashboard?.products ?? [])].sort((a, b) => a.stock - b.stock),
    [dashboard],
  );

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">PUBLIC ENGINEERING DEMO</p>
          <h1>ScanOps</h1>
          <p className="subtitle">A small retail inventory terminal with persistent operations and an auditable activity log.</p>
        </div>
        <span className="live">SQLite-backed API</span>
      </header>

      <main>
        <section className="metrics" aria-label="Inventory metrics">
          <Metric label="Products" value={dashboard?.summary.products ?? "-"} />
          <Metric label="Units in stock" value={dashboard?.summary.totalUnits ?? "-"} />
          <Metric label="Low stock" value={dashboard?.summary.lowStock ?? "-"} warning />
          <Metric label="Scans today" value={dashboard?.summary.todayScans ?? "-"} />
        </section>

        <div className="workspace">
          <section className="panel terminal" aria-label="Scan terminal">
            <p className="eyebrow">TERMINAL</p>
            <h2>Record operation</h2>
            <form onSubmit={handleSubmit}>
              <fieldset className="modes">
                <legend>Operation type</legend>
                <label className={mode === "sale" ? "selected" : ""}>
                  <input type="radio" name="mode" checked={mode === "sale"} onChange={() => setMode("sale")} />
                  Sale - remove one unit
                </label>
                <label className={mode === "restock" ? "selected" : ""}>
                  <input type="radio" name="mode" checked={mode === "restock"} onChange={() => setMode("restock")} />
                  Restock - add one pack
                </label>
              </fieldset>
              <label className="input-label" htmlFor="barcode">Barcode</label>
              <div className="scan-row">
                <input id="barcode" value={barcode} onChange={(event) => setBarcode(event.target.value)} inputMode="numeric" required />
                <button disabled={pending} type="submit">{pending ? "Saving..." : "Submit"}</button>
              </div>
            </form>
            <div className="samples">
              <span>Sample codes</span>
              {DEMO_CODES.map((code) => (
                <button className="code" type="button" key={code} onClick={() => setBarcode(code)}>{code}</button>
              ))}
            </div>
            <p className="notice" role="status">{notice}</p>
          </section>

          <section className="panel" aria-label="Recent activity">
            <p className="eyebrow">AUDIT TRAIL</p>
            <h2>Recent activity</h2>
            <ol className="activity">
              {(dashboard?.movements ?? []).map((movement) => (
                <li key={movement.id}>
                  <span className={`operation ${movement.mode}`}>{movement.mode}</span>
                  <strong>{movement.productName}</strong>
                  <small>{movement.quantity > 0 ? "+" : ""}{movement.quantity} units | stock {movement.stockAfter}</small>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className="panel inventory" aria-label="Inventory">
          <div className="section-head">
            <div>
              <p className="eyebrow">CATALOGUE</p>
              <h2>Inventory status</h2>
            </div>
            <p>Fictitious demonstration data</p>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr><th>Product</th><th>Barcode</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th></tr>
              </thead>
              <tbody>
                {sortedProducts.map((product) => (
                  <tr key={product.barcode}>
                    <td><strong>{product.name}</strong></td>
                    <td className="mono">{product.barcode}</td>
                    <td>{product.category}</td>
                    <td>{formatMoney(product.priceCents)}</td>
                    <td>{product.stock}</td>
                    <td><span className={`stock ${stockState(product)}`}>{stockState(product)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer>Public demo built with React, TypeScript, Node.js and SQLite. All catalogue records are synthetic.</footer>
    </div>
  );
}

function Metric({ label, value, warning = false }: { label: string; value: string | number; warning?: boolean }) {
  return (
    <article className={`metric ${warning ? "warning" : ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
