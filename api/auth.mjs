import { randomUUID } from "node:crypto";

const DEMO_ACCOUNTS = [
  {
    email: "operator@scanops.demo",
    password: "demo-operator",
    name: "Warehouse Operator",
    role: "operator",
  },
  {
    email: "manager@scanops.demo",
    password: "demo-manager",
    name: "Operations Manager",
    role: "manager",
  },
  {
    email: "auditor@scanops.demo",
    password: "demo-auditor",
    name: "Inventory Auditor",
    role: "auditor",
  },
];

export function createAuth() {
  const sessions = new Map();

  return {
    signIn(email, password) {
      const account = DEMO_ACCOUNTS.find((entry) => entry.email === email && entry.password === password);
      if (!account) return null;
      const token = randomUUID();
      const user = { name: account.name, email: account.email, role: account.role };
      sessions.set(token, user);
      return { token, user };
    },
    userFor(token) {
      return token ? sessions.get(token) ?? null : null;
    },
    signOut(token) {
      return sessions.delete(token);
    },
  };
}
