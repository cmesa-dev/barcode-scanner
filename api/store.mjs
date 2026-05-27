import { DatabaseSync } from "node:sqlite";

const SEED_PRODUCTS = [
  ["8410000010011", "Mineral water 1.5 L", "Groceries", 125, 24, 8, 6],
  ["8410000010028", "Rustic bread", "Bakery", 245, 10, 5, 8],
  ["8410000010035", "Whole milk 1 L", "Groceries", 115, 18, 8, 6],
  ["8410000010042", "Ground coffee 250 g", "Groceries", 495, 4, 5, 6],
  ["8410000010059", "Rice 1 kg", "Groceries", 210, 14, 6, 12],
  ["8410000010066", "Olive oil 1 L", "Groceries", 945, 3, 4, 6],
  ["8410000010073", "Free range eggs 12 u", "Fresh", 385, 0, 4, 6],
  ["8410000010080", "Dark chocolate", "Snacks", 290, 20, 6, 12],
];

export function createStore(filename = ":memory:") {
  const db = new DatabaseSync(filename);
  db.exec(`
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS products (
      barcode TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
      stock INTEGER NOT NULL CHECK (stock >= 0),
      reorder_level INTEGER NOT NULL CHECK (reorder_level >= 0),
      pack_size INTEGER NOT NULL CHECK (pack_size > 0)
    );
    CREATE TABLE IF NOT EXISTS movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      barcode TEXT NOT NULL REFERENCES products(barcode),
      mode TEXT NOT NULL CHECK (mode IN ('sale', 'restock')),
      quantity INTEGER NOT NULL,
      stock_after INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (db.prepare("SELECT COUNT(*) AS count FROM products").get().count === 0) {
    const insert = db.prepare(`
      INSERT INTO products (barcode, name, category, price_cents, stock, reorder_level, pack_size)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    for (const product of SEED_PRODUCTS) insert.run(...product);
  }

  function products() {
    return db.prepare(`
      SELECT barcode, name, category, price_cents AS priceCents, stock,
             reorder_level AS reorderLevel, pack_size AS packSize
      FROM products ORDER BY name
    `).all();
  }

  function movements(limit = 8) {
    return db.prepare(`
      SELECT movements.id, movements.barcode, products.name AS productName,
             movements.mode, movements.quantity, movements.stock_after AS stockAfter,
             movements.created_at AS createdAt
      FROM movements JOIN products USING (barcode)
      ORDER BY movements.id DESC LIMIT ?
    `).all(limit);
  }

  function summary() {
    const stock = db.prepare(`
      SELECT COUNT(*) AS products, SUM(stock) AS totalUnits,
             SUM(CASE WHEN stock <= reorder_level THEN 1 ELSE 0 END) AS lowStock
      FROM products
    `).get();
    const scans = db.prepare(`
      SELECT COUNT(*) AS todayScans FROM movements
      WHERE date(created_at) = date('now')
    `).get();
    return { ...stock, ...scans };
  }

  function recordScan(barcode, mode) {
    if (!["sale", "restock"].includes(mode)) {
      throw new StoreError("Operation must be sale or restock.", 400);
    }
    const product = db.prepare("SELECT * FROM products WHERE barcode = ?").get(barcode);
    if (!product) throw new StoreError("Barcode not found in the demo catalogue.", 404);
    const quantity = mode === "sale" ? -1 : product.pack_size;
    if (mode === "sale" && product.stock === 0) {
      throw new StoreError("Sale rejected: product has no available stock.", 409);
    }

    db.exec("BEGIN");
    try {
      const stockAfter = product.stock + quantity;
      db.prepare("UPDATE products SET stock = ? WHERE barcode = ?").run(stockAfter, barcode);
      const result = db.prepare(`
        INSERT INTO movements (barcode, mode, quantity, stock_after)
        VALUES (?, ?, ?, ?)
      `).run(barcode, mode, quantity, stockAfter);
      db.exec("COMMIT");
      return db.prepare(`
        SELECT movements.id, movements.barcode, products.name AS productName,
               movements.mode, movements.quantity, movements.stock_after AS stockAfter,
               movements.created_at AS createdAt
        FROM movements JOIN products USING (barcode)
        WHERE movements.id = ?
      `).get(result.lastInsertRowid);
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  }

  return {
    dashboard: () => ({ summary: summary(), products: products(), movements: movements() }),
    recordScan,
    close: () => db.close(),
  };
}

export class StoreError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
