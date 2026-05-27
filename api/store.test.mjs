import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { createStore, StoreError } from "./store.mjs";

describe("inventory store", () => {
  let store;
  beforeEach(() => {
    store = createStore();
  });
  afterEach(() => store.close());

  it("provides seeded operational metrics", () => {
    const dashboard = store.dashboard();
    assert.equal(dashboard.summary.products, 8);
    assert.equal(dashboard.summary.lowStock, 3);
    assert.equal(dashboard.movements.length, 0);
  });

  it("records a sale and adjusts inventory", () => {
    const movement = store.recordScan("8410000010011", "sale");
    assert.equal(movement.quantity, -1);
    assert.equal(movement.stockAfter, 23);
    assert.equal(store.dashboard().summary.todayScans, 1);
  });

  it("restocks by the configured pack size", () => {
    const movement = store.recordScan("8410000010073", "restock");
    assert.equal(movement.quantity, 6);
    assert.equal(movement.stockAfter, 6);
  });

  it("rejects a sale when stock is empty", () => {
    assert.throws(
      () => store.recordScan("8410000010073", "sale"),
      (error) => error instanceof StoreError && error.status === 409,
    );
  });
});
