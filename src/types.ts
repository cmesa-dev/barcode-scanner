export type ScanMode = "sale" | "restock";

export interface Product {
  barcode: string;
  name: string;
  category: string;
  priceCents: number;
  stock: number;
  reorderLevel: number;
  packSize: number;
}

export interface Movement {
  id: number;
  barcode: string;
  productName: string;
  mode: ScanMode;
  quantity: number;
  stockAfter: number;
  createdAt: string;
}

export interface Summary {
  products: number;
  totalUnits: number;
  lowStock: number;
  todayScans: number;
}

export interface User {
  name: string;
  email: string;
  role: "operator" | "manager" | "auditor";
}

export interface Dashboard {
  summary: Summary;
  products: Product[];
  movements: Movement[];
  user: User;
}

export interface Session {
  token: string;
  user: User;
}
