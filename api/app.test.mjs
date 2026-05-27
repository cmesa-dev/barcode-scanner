import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { Readable } from "node:stream";
import { createHandler } from "./app.mjs";
import { createStore } from "./store.mjs";

describe("REST API", () => {
  const store = createStore();
  const handler = createHandler(store);
  after(() => store.close());

  async function invoke(method, url, body) {
    const request = Readable.from(body ? [JSON.stringify(body)] : []);
    request.method = method;
    request.url = url;
    return new Promise((resolve) => {
      const response = {
        status: 0,
        headers: {},
        writeHead(status, headers) {
          this.status = status;
          this.headers = headers;
        },
        end(payload = "") {
          resolve({ status: this.status, headers: this.headers, payload: payload ? JSON.parse(payload) : null });
        },
      };
      void handler(request, response);
    });
  }

  it("returns a dashboard payload", async () => {
    const response = await invoke("GET", "/api/dashboard");
    assert.equal(response.status, 200);
    assert.equal(response.payload.products.length, 8);
    assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
  });

  it("records a valid operation", async () => {
    const response = await invoke("POST", "/api/scans", { barcode: "8410000010011", mode: "sale" });
    assert.equal(response.status, 201);
    assert.equal(response.payload.quantity, -1);
  });

  it("returns validation failures as client errors", async () => {
    const response = await invoke("POST", "/api/scans", { barcode: "missing", mode: "sale" });
    assert.equal(response.status, 404);
  });
});
