# TrendKart Full-Stack Monorepo

Welcome to the TrendKart professional repository. This project is organized as a monorepo to separate concerns between applications, infrastructure, and automation.

## Project Structure

- **`apps/`**: The core applications.
    - `web/`: React + Vite frontend.
    - `api/`: Express.js backend (REST API).
    - `worker/`: Cloudflare Worker for background tasks.
- **`infrastructure/`**: Deployment and platform configurations.
    - `firebase/`: Firestore security rules.
    - `platforms/`: Platform-specific configs (Render, Wrangler).
- **`scripts/`**: Automation scripts for deployment and maintenance.
- **`docs/`**: Technical documentation.

## Quick Start

### Backend (API)
```bash
cd apps/api
npm install
npm run dev
```

### Frontend (Web)
```bash
cd apps/web
npm install
npm run dev
```

### Worker
```bash
cd apps/worker
npm install
```

## Deployment
Automation scripts are located in the `scripts/` directory. For example:
- `./scripts/deploy-frontend.ps1`
- `./scripts/deploy-full-stack.ps1`

---
*Created with TrendKart Professional Engineering Guidelines.*
