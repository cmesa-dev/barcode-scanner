import { mkdirSync } from "node:fs";
import { createServer } from "node:http";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHandler } from "./app.mjs";
import { createAuth } from "./auth.mjs";
import { createStore } from "./store.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const database = process.env.DB_PATH ?? join(root, "data", "scanops.sqlite");
if (database !== ":memory:") mkdirSync(dirname(database), { recursive: true });

const store = createStore(database);
const server = createServer(createHandler(store, { distDir: join(root, "dist"), auth: createAuth() }));
const port = Number(process.env.PORT ?? 3000);

server.listen(port, () => {
  console.log(`ScanOps API listening at http://localhost:${port}`);
});

function shutdown() {
  server.close(() => {
    store.close();
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
