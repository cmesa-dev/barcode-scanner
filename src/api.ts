import type { Dashboard, Movement, ScanMode } from "./types";

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.json() as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "Request failed");
  }
  return body;
}

export async function getDashboard(): Promise<Dashboard> {
  return readJson<Dashboard>(await fetch("/api/dashboard"));
}

export async function submitScan(barcode: string, mode: ScanMode): Promise<Movement> {
  const response = await fetch("/api/scans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ barcode, mode }),
  });
  return readJson<Movement>(response);
}
