<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:071a1e,100:11675f&height=190&section=header&text=ScanOps&fontSize=62&fontColor=ffffff&animation=fadeIn&fontAlignY=39&desc=Inventory%20Terminal%20%C2%B7%20Public%20Engineering%20Demo&descAlignY=57" width="100%"/>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React-TypeScript-087EA4?style=for-the-badge&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/API-Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/Data-SQLite-0F80CC?style=for-the-badge&logo=sqlite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Original%20Project-Private-334155?style=for-the-badge"/>
</div>

## Problem

Retail operators need to record high-frequency inventory movements with very little friction: scan a product, identify whether stock is leaving or arriving, and see the resulting state immediately.

**ScanOps** is a sanitized public product slice derived from that operational problem. It contains synthetic data only and does not disclose source code or data from the private original project.

![ScanOps inventory terminal preview](docs/scanops-preview.png)

## What I Built

- Responsive React and TypeScript terminal interface.
- REST API implemented with Node.js.
- SQLite persistence with transactional inventory movements.
- Demo authentication with operator, manager and read-only auditor roles.
- Sale and restock flows with validation and explicit out-of-stock rejection.
- Keyboard-scanner input plus optional browser camera barcode capture where supported.
- Recent activity audit trail and low-stock status indicators.
- Automated domain, API and UI tests, Lighthouse quality gates, CI workflow, Docker image and deployable hosted preview.

## Architecture

```text
React + TypeScript UI  ->  JSON REST API (Node.js)  ->  SQLite
```

The browser app reads the dashboard from the API and submits operational events. Each accepted scan updates stock and records its resulting state in a single transaction.

Read the design decisions in [docs/architecture.md](docs/architecture.md).

## Hosted Preview

Once GitHub Pages is enabled for this repository, the hosted interaction preview is published at:

[`https://cmesa-dev.github.io/barcode-scanner/`](https://cmesa-dev.github.io/barcode-scanner/)

GitHub Pages runs the same frontend with synthetic browser-local data. The Node.js and SQLite implementation is exercised locally or through the Docker container, because static hosting cannot operate the API service.

## Run Locally

Requires Node.js 22.5 or later because the API uses the built-in SQLite module.

```bash
npm install
npm run api
```

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`.

Demo accounts:

```text
operator@scanops.demo / demo-operator
manager@scanops.demo  / demo-manager
auditor@scanops.demo  / demo-auditor   (read only)
```

### Production-style run

```bash
npm run build
npm start
```

Open `http://localhost:3000`.

### Container

```bash
docker build -t scanops-demo .
docker run --rm -p 3000:3000 scanops-demo
```

## Verification

```bash
npm run check
```

The test suite covers seeded metrics, stock decrement/increment behavior, access control, rejection of impossible sales, HTTP API responses and the frontend login/operation workflow. The build performs TypeScript validation before generating frontend assets. The CI workflow runs Lighthouse against the static build with enforceable accessibility and best-practice thresholds.

## Scope Boundary

| Included publicly | Deliberately outside this demo |
|---|---|
| Operational UI, sample catalogue, REST API, SQLite events, tests | Private product code and data |
| Demo sessions, role enforcement, sale/restock flows and audit list | Production identity provider and multi-store tenant model |
| Container and CI verification | Production deployment and monitoring |

## Next Production Iteration

For a deployed multi-terminal system I would add authenticated device identities, idempotent event ingestion, role-based access, offline synchronisation, migrations, monitoring and backup/restore procedures.
