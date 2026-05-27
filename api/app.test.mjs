import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { Readable } from "node:stream";
import { createHandler } from "./app.mjs";
import { createStore } from "./store.mjs";

describe("REST API", () => {
  const store = createStore();
  const handler = createHandler(store);
  after(() => store.close());

  async function invoke(method, url, body, token = "") {
    const request = Readable.from(body ? [JSON.stringify(body)] : []);
    request.method = method;
    request.url = url;
    request.headers = token ? { authorization: `Bearer ${token}` } : {};
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
    const session = await invoke("POST", "/api/session", {
      email: "operator@scanops.demo",
      password: "demo-operator",
    });
    const response = await invoke("GET", "/api/dashboard", null, session.payload.token);
    assert.equal(response.status, 200);
    assert.equal(response.payload.products.length, 8);
    assert.equal(response.payload.user.role, "operator");
    assert.equal(response.headers["X-Content-Type-Options"], "nosniff");
  });

  it("records a valid operation", async () => {
    const session = await invoke("POST", "/api/session", {
      email: "manager@scanops.demo",
      password: "demo-manager",
    });
    const response = await invoke("POST", "/api/scans", { barcode: "8410000010011", mode: "sale" }, session.payload.token);
    assert.equal(response.status, 201);
    assert.equal(response.payload.quantity, -1);
  });

  it("returns validation failures as client errors", async () => {
    const session = await invoke("POST", "/api/session", {
      email: "operator@scanops.demo",
      password: "demo-operator",
    });
    const response = await invoke("POST", "/api/scans", { barcode: "missing", mode: "sale" }, session.payload.token);
    assert.equal(response.status, 404);
  });

  it("rejects unauthenticated operational reads", async () => {
    const response = await invoke("GET", "/api/dashboard");
    assert.equal(response.status, 401);
  });

  it("permits auditors to read but rejects inventory changes", async () => {
    const session = await invoke("POST", "/api/session", {
      email: "auditor@scanops.demo",
      password: "demo-auditor",
    });
    assert.equal((await invoke("GET", "/api/dashboard", null, session.payload.token)).status, 200);
    const movement = await invoke("POST", "/api/scans", { barcode: "8410000010011", mode: "sale" }, session.payload.token);
    assert.equal(movement.status, 403);
  });
});
