import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { getDashboard, signIn, signOut, submitScan } from "./api";
import type { Dashboard, Product, ScanMode, User } from "./types";
import "./styles.css";

const DEMO_CODES = ["8410000010011", "8410000010042", "8410000010073"];
const HOSTED_DEMO = import.meta.env.VITE_PUBLIC_DEMO === "true";

interface DetectorResult {
  rawValue: string;
}

interface Detector {
  detect(source: ImageBitmapSource): Promise<DetectorResult[]>;
}

type DetectorConstructor = new (options: { formats: string[] }) => Detector;

function formatMoney(cents: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(cents / 100);
}

function stockState(product: Product): string {
  if (product.stock === 0) return "empty";
  if (product.stock <= product.reorderLevel) return "low";
  return "healthy";
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [barcode, setBarcode] = useState(DEMO_CODES[0]);
  const [mode, setMode] = useState<ScanMode>("sale");
  const [notice, setNotice] = useState("Ready for a keyboard scanner or a sample barcode.");
  const [pending, setPending] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);

  async function refresh() {
    try {
      const result = await getDashboard();
      setDashboard(result);
      setUser(result.user);
    } catch {
      setDashboard(null);
      setUser(null);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  async function handleLogin(email: string, password: string) {
    const session = await signIn(email, password);
    setUser(session.user);
    await refresh();
  }

  async function handleSignOut() {
    await signOut();
    setDashboard(null);
    setUser(null);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const movement = await submitScan(barcode.trim(), mode);
      setNotice(`${movement.mode === "sale" ? "Sale" : "Restock"} recorded for ${movement.productName}. Stock: ${movement.stockAfter}.`);
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
  const canOperate = user?.role !== "auditor";

  if (!user || !dashboard) return <Login onLogin={handleLogin} />;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">PUBLIC ENGINEERING DEMO</p>
          <h1>ScanOps</h1>
          <p className="subtitle">A small retail inventory terminal with persistent operations and an auditable activity log.</p>
        </div>
        <div className="identity">
          <span className="live">{HOSTED_DEMO ? "Browser-hosted demo" : "SQLite-backed API"}</span>
          <p><strong>{user.name}</strong><small>{user.role}</small></p>
          <button className="text-button" type="button" onClick={() => void handleSignOut()}>Sign out</button>
        </div>
      </header>

      <main>
        <section className="metrics" aria-label="Inventory metrics">
          <Metric label="Products" value={dashboard.summary.products} />
          <Metric label="Units in stock" value={dashboard.summary.totalUnits} />
          <Metric label="Low stock" value={dashboard.summary.lowStock} warning />
          <Metric label="Scans today" value={dashboard.summary.todayScans} />
        </section>

        <div className="workspace">
          <section className="panel terminal" aria-label="Scan terminal">
            <p className="eyebrow">TERMINAL</p>
            <h2>Record operation</h2>
            <form onSubmit={handleSubmit}>
              <fieldset className="modes">
                <legend>Operation type</legend>
                <label className={mode === "sale" ? "selected" : ""}>
                  <input type="radio" name="mode" checked={mode === "sale"} onChange={() => setMode("sale")} disabled={!canOperate} />
                  Sale - remove one unit
                </label>
                <label className={mode === "restock" ? "selected" : ""}>
                  <input type="radio" name="mode" checked={mode === "restock"} onChange={() => setMode("restock")} disabled={!canOperate} />
                  Restock - add one pack
                </label>
              </fieldset>
              <label className="input-label" htmlFor="barcode">Barcode or connected scanner input</label>
              <div className="scan-row">
                <input id="barcode" value={barcode} onChange={(event) => setBarcode(event.target.value)} inputMode="numeric" required autoFocus disabled={!canOperate} />
                <button disabled={pending || !canOperate} type="submit">{pending ? "Saving..." : "Submit"}</button>
              </div>
            </form>
            <div className="terminal-actions">
              <div className="samples">
                <span>Samples</span>
                {DEMO_CODES.map((code) => (
                  <button className="code" type="button" key={code} onClick={() => setBarcode(code)} disabled={!canOperate}>{code}</button>
                ))}
              </div>
              <button className="camera-button" type="button" onClick={() => setCameraOpen(true)} disabled={!canOperate}>Use camera</button>
            </div>
            <p className="notice" role="status">{canOperate ? notice : "Read-only auditor role: movements are visible, operational actions are disabled."}</p>
          </section>

          <section className="panel" aria-label="Recent activity">
            <p className="eyebrow">AUDIT TRAIL</p>
            <h2>Recent activity</h2>
            {dashboard.movements.length === 0 && <p className="empty-state">No movements yet. Record a sale or restock event.</p>}
            <ol className="activity">
              {dashboard.movements.map((movement) => (
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

      {cameraOpen && (
        <CameraScanner
          onClose={() => setCameraOpen(false)}
          onDetect={(value) => {
            setBarcode(value);
            setCameraOpen(false);
            setNotice("Barcode captured. Confirm the operation to record it.");
          }}
        />
      )}
      <footer>
        {HOSTED_DEMO
          ? "Hosted interaction preview using local browser state. The repository includes the full Node.js and SQLite implementation."
          : "Public demo built with React, TypeScript, Node.js and SQLite. All catalogue records are synthetic."}
      </footer>
    </div>
  );
}

function Login({ onLogin }: { onLogin: (email: string, password: string) => Promise<void> }) {
  const [email, setEmail] = useState("operator@scanops.demo");
  const [password, setPassword] = useState("demo-operator");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    try {
      setError("");
      await onLogin(email, password);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "Unable to sign in.");
    }
  }

  return (
    <main className="login-shell">
      <section className="login-card">
        <p className="eyebrow">SCANOPS ACCESS</p>
        <h1>Operations terminal</h1>
        <p className="subtitle">Sign in with a public demo account to inspect the controlled inventory workflow.</p>
        <form onSubmit={submit}>
          <label className="input-label" htmlFor="email">Email</label>
          <input id="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <label className="input-label" htmlFor="password">Password</label>
          <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button type="submit">Enter terminal</button>
        </form>
        <p className="credentials">Operator: `operator@scanops.demo` / `demo-operator`<br />Manager: `manager@scanops.demo` / `demo-manager`</p>
        <p className="credentials secondary-credential">Auditor (read only): `auditor@scanops.demo` / `demo-auditor`</p>
        {error && <p className="login-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}

function CameraScanner({ onDetect, onClose }: { onDetect: (value: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("Starting camera...");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let interval: number | null = null;
    const BarcodeDetector = (window as Window & { BarcodeDetector?: DetectorConstructor }).BarcodeDetector;

    async function start() {
      if (!BarcodeDetector) {
        setMessage("Barcode detection is not available in this browser. Use a USB scanner or sample code.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        const detector = new BarcodeDetector({ formats: ["ean_13", "code_128"] });
        setMessage("Point the camera at a supported barcode.");
        interval = window.setInterval(async () => {
          if (!videoRef.current) return;
          const detected = await detector.detect(videoRef.current);
          if (detected[0]?.rawValue) onDetect(detected[0].rawValue);
        }, 500);
      } catch {
        setMessage("Camera access was not granted. Use a USB scanner or sample code.");
      }
    }
    void start();
    return () => {
      if (interval) window.clearInterval(interval);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [onDetect]);

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Camera scanner">
      <section className="camera-modal">
        <div className="modal-head"><h2>Camera scanner</h2><button type="button" onClick={onClose}>Close</button></div>
        <video ref={videoRef} muted playsInline />
        <p>{message}</p>
      </section>
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
