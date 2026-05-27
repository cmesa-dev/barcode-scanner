# ScanOps Architecture

## Goal

This public demo proves an operational inventory flow without exposing the implementation or data of the private source project. An operator submits a barcode as either a sale or a restock event; inventory and an audit trail update immediately.

## Components

```text
React + TypeScript UI (Vite)
        |
        | JSON REST requests
        v
Node HTTP API
        |
        | transactional writes
        v
SQLite database
```

## Decisions

| Choice | Reason | Trade-off |
|---|---|---|
| React and TypeScript | Components and type-checked client contracts match modern product UI work | Requires a build step |
| Node built-in HTTP server | Keeps backend dependency surface small for a public demo | No middleware ecosystem used |
| Node built-in SQLite | Real persistence and atomic inventory updates without an external service | Single-node demonstration only |
| Synthetic seed data | Demo is immediately testable and does not expose private data | Not representative of production catalogue scale |

## Reliability Boundary

The API validates operation type and barcode presence, rejects sales when stock is zero, writes movement plus resulting stock in a transaction and returns baseline browser security headers. Automated tests cover initial metrics, sale, restock, empty-stock rejection and HTTP responses.

## At Production Scale

The next design iteration would introduce authentication and roles, idempotency keys from scanning devices, append-only event storage, synchronisation for intermittently connected terminals, database migrations, monitoring and a deployment target with backups.
