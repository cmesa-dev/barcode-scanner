import type { Dashboard, Movement, Product, ScanMode, Session, User } from "./types";

const publicDemo = import.meta.env.VITE_PUBLIC_DEMO === "true";
const TOKEN_KEY = "scanops.token";
const LOCAL_STATE_KEY = "scanops.pages.state";
let activeUser: User | null = null;

const PRODUCTS: Product[] = [
  { barcode: "8410000010011", name: "Mineral water 1.5 L", category: "Groceries", priceCents: 125, stock: 24, reorderLevel: 8, packSize: 6 },
  { barcode: "8410000010028", name: "Rustic bread", category: "Bakery", priceCents: 245, stock: 10, reorderLevel: 5, packSize: 8 },
  { barcode: "8410000010035", name: "Whole milk 1 L", category: "Groceries", priceCents: 115, stock: 18, reorderLevel: 8, packSize: 6 },
  { barcode: "8410000010042", name: "Ground coffee 250 g", category: "Groceries", priceCents: 495, stock: 4, reorderLevel: 5, packSize: 6 },
  { barcode: "8410000010059", name: "Rice 1 kg", category: "Groceries", priceCents: 210, stock: 14, reorderLevel: 6, packSize: 12 },
  { barcode: "8410000010066", name: "Olive oil 1 L", category: "Groceries", priceCents: 945, stock: 3, reorderLevel: 4, packSize: 6 },
  { barcode: "8410000010073", name: "Free range eggs 12 u", category: "Fresh", priceCents: 385, stock: 0, reorderLevel: 4, packSize: 6 },
  { barcode: "8410000010080", name: "Dark chocolate", category: "Snacks", priceCents: 290, stock: 20, reorderLevel: 6, packSize: 12 },
];

function token(): string {
  return sessionStorage.getItem(TOKEN_KEY) ?? "";
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Request failed");
  return body;
}

function localState(): { products: Product[]; movements: Movement[] } {
  const saved = localStorage.getItem(LOCAL_STATE_KEY);
  if (saved) return JSON.parse(saved) as { products: Product[]; movements: Movement[] };
  return { products: structuredClone(PRODUCTS), movements: [] };
}

function saveLocalState(state: { products: Product[]; movements: Movement[] }) {
  localStorage.setItem(LOCAL_STATE_KEY, JSON.stringify(state));
}

export async function signIn(email: string, password: string): Promise<Session> {
  if (publicDemo) {
    const roles: Record<string, { password: string; user: User }> = {
      "operator@scanops.demo": { password: "demo-operator", user: { name: "Warehouse Operator", email, role: "operator" } },
      "manager@scanops.demo": { password: "demo-manager", user: { name: "Operations Manager", email, role: "manager" } },
      "auditor@scanops.demo": { password: "demo-auditor", user: { name: "Inventory Auditor", email, role: "auditor" } },
    };
    const account = roles[email];
    if (!account || account.password !== password) throw new Error("Invalid demo credentials.");
    activeUser = account.user;
    sessionStorage.setItem(TOKEN_KEY, "pages-demo-session");
    return { token: "pages-demo-session", user: account.user };
  }
  const session = await readJson<Session>(await fetch("/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  }));
  sessionStorage.setItem(TOKEN_KEY, session.token);
  activeUser = session.user;
  return session;
}

export async function signOut(): Promise<void> {
  if (!publicDemo && token()) {
    await fetch("/api/session", { method: "DELETE", headers: { Authorization: `Bearer ${token()}` } });
  }
  sessionStorage.removeItem(TOKEN_KEY);
  activeUser = null;
}

export async function getDashboard(): Promise<Dashboard> {
  if (publicDemo) {
    if (!activeUser || !token()) throw new Error("Sign in is required.");
    const state = localState();
    return {
      user: activeUser,
      products: state.products,
      movements: state.movements.slice(0, 8),
      summary: {
        products: state.products.length,
        totalUnits: state.products.reduce((sum, item) => sum + item.stock, 0),
        lowStock: state.products.filter((item) => item.stock <= item.reorderLevel).length,
        todayScans: state.movements.length,
      },
    };
  }
  return readJson<Dashboard>(await fetch("/api/dashboard", { headers: { Authorization: `Bearer ${token()}` } }));
}

export async function submitScan(barcode: string, mode: ScanMode): Promise<Movement> {
  if (publicDemo) {
    if (!activeUser || !token()) throw new Error("Sign in is required.");
    if (activeUser.role === "auditor") throw new Error("This role cannot record movements.");
    const state = localState();
    const product = state.products.find((item) => item.barcode === barcode);
    if (!product) throw new Error("Barcode not found in the demo catalogue.");
    if (mode === "sale" && product.stock === 0) throw new Error("Sale rejected: product has no available stock.");
    const quantity = mode === "sale" ? -1 : product.packSize;
    product.stock += quantity;
    const movement: Movement = {
      id: Date.now(),
      barcode,
      productName: product.name,
      mode,
      quantity,
      stockAfter: product.stock,
      createdAt: new Date().toISOString(),
    };
    state.movements.unshift(movement);
    saveLocalState(state);
    return movement;
  }
  return readJson<Movement>(await fetch("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token()}` },
    body: JSON.stringify({ barcode, mode }),
  }));
}
