import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";
import type { Dashboard } from "./types";

const dashboard: Dashboard = {
  user: { name: "Warehouse Operator", email: "operator@scanops.demo", role: "operator" },
  summary: { products: 1, totalUnits: 24, lowStock: 0, todayScans: 0 },
  products: [
    {
      barcode: "8410000010011",
      name: "Mineral water 1.5 L",
      category: "Groceries",
      priceCents: 125,
      stock: 24,
      reorderLevel: 8,
      packSize: 6,
    },
  ],
  movements: [],
};

const api = vi.hoisted(() => ({
  getDashboard: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  submitScan: vi.fn(),
}));

vi.mock("./api", () => api);

describe("ScanOps user workflow", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getDashboard.mockRejectedValueOnce(new Error("Sign in is required."));
    api.signIn.mockResolvedValue({ token: "demo", user: dashboard.user });
    api.submitScan.mockResolvedValue({
      id: 1,
      barcode: "8410000010011",
      productName: "Mineral water 1.5 L",
      mode: "sale",
      quantity: -1,
      stockAfter: 23,
      createdAt: "2026-05-27T00:00:00Z",
    });
  });

  it("enters the protected terminal after demo sign-in", async () => {
    api.getDashboard.mockResolvedValueOnce(dashboard);
    render(<App />);

    expect(await screen.findByRole("heading", { name: "Operations terminal" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Enter terminal" }));

    expect(await screen.findByRole("heading", { name: "Record operation" })).toBeInTheDocument();
    expect(api.signIn).toHaveBeenCalledWith("operator@scanops.demo", "demo-operator");
  });

  it("submits a sale from the terminal", async () => {
    const updated = {
      ...dashboard,
      summary: { ...dashboard.summary, totalUnits: 23, todayScans: 1 },
      products: [{ ...dashboard.products[0], stock: 23 }],
    };
    api.getDashboard.mockResolvedValueOnce(dashboard).mockResolvedValueOnce(updated);
    render(<App />);
    fireEvent.click(await screen.findByRole("button", { name: "Enter terminal" }));
    await screen.findByRole("heading", { name: "Record operation" });

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(api.submitScan).toHaveBeenCalledWith("8410000010011", "sale"));
    expect(await screen.findByText(/Sale recorded for Mineral water/)).toBeInTheDocument();
  });

  it("disables movement controls for read-only auditors", async () => {
    const auditor = {
      ...dashboard,
      user: { name: "Inventory Auditor", email: "auditor@scanops.demo", role: "auditor" as const },
    };
    api.signIn.mockResolvedValueOnce({ token: "demo", user: auditor.user });
    api.getDashboard.mockResolvedValueOnce(auditor);
    render(<App />);

    fireEvent.click(await screen.findByRole("button", { name: "Enter terminal" }));
    expect(await screen.findByText(/Read-only auditor role/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit" })).toBeDisabled();
  });
});
