import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createAuth } from "./auth.mjs";
import { StoreError } from "./store.mjs";

const CONTENT_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
};
const SECURITY_HEADERS = {
  "Content-Security-Policy": "default-src 'self'; style-src 'self'; script-src 'self'; connect-src 'self'",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};

function json(response, status, body) {
  response.writeHead(status, {
    ...SECURITY_HEADERS,
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  response.end(JSON.stringify(body));
}

async function requestJson(request) {
  let input = "";
  for await (const chunk of request) {
    input += chunk;
    if (input.length > 10_000) throw new StoreError("Request body is too large.", 413);
  }
  try {
    return JSON.parse(input || "{}");
  } catch {
    throw new StoreError("Request body must be valid JSON.", 400);
  }
}

function serveAsset(response, distDir, urlPath) {
  if (!distDir) return false;
  const requested = normalize(urlPath === "/" ? "index.html" : urlPath)
    .replace(/^[/\\]+/, "")
    .replace(/^(\.\.[/\\])+/, "");
  let filename = join(distDir, requested);
  if (!existsSync(filename) || statSync(filename).isDirectory()) filename = join(distDir, "index.html");
  if (!existsSync(filename)) return false;
  response.writeHead(200, {
    ...SECURITY_HEADERS,
    "Content-Type": CONTENT_TYPES[extname(filename)] ?? "application/octet-stream",
  });
  createReadStream(filename).pipe(response);
  return true;
}

function bearerToken(request) {
  const authorization = request.headers?.authorization ?? "";
  return authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
}

export function createHandler(store, { distDir, auth = createAuth() } = {}) {
  return async function handler(request, response) {
    try {
      if (request.method === "OPTIONS") {
        response.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        });
        return response.end();
      }
      if (request.method === "GET" && request.url === "/api/health") {
        return json(response, 200, { status: "ok" });
      }
      if (request.method === "POST" && request.url === "/api/session") {
        const { email, password } = await requestJson(request);
        const session = auth.signIn(email, password);
        if (!session) throw new StoreError("Invalid demo credentials.", 401);
        return json(response, 201, session);
      }
      if (request.method === "DELETE" && request.url === "/api/session") {
        auth.signOut(bearerToken(request));
        return json(response, 200, { status: "signed-out" });
      }
      const user = auth.userFor(bearerToken(request));
      if ((request.url === "/api/dashboard" || request.url === "/api/scans") && !user) {
        throw new StoreError("Sign in is required.", 401);
      }
      if (request.method === "GET" && request.url === "/api/dashboard") {
        return json(response, 200, { ...store.dashboard(), user });
      }
      if (request.method === "POST" && request.url === "/api/scans") {
        if (!["operator", "manager"].includes(user.role)) {
          throw new StoreError("This role cannot record movements.", 403);
        }
        const { barcode, mode } = await requestJson(request);
        if (typeof barcode !== "string" || barcode.trim() === "") {
          throw new StoreError("Barcode is required.", 400);
        }
        return json(response, 201, store.recordScan(barcode.trim(), mode));
      }
      if (request.url?.startsWith("/api/")) {
        return json(response, 404, { error: "Endpoint not found." });
      }
      if (serveAsset(response, distDir, request.url ?? "/")) return;
      return json(response, 404, { error: "Build the frontend or use the Vite development server." });
    } catch (error) {
      if (error instanceof StoreError) return json(response, error.status, { error: error.message });
      console.error(error);
      return json(response, 500, { error: "Unexpected server error." });
    }
  };
}
