# Quick Start & How to Run Guide

This guide walks you through setting up, running, testing, and exploring **Tech Inject Design Library**.

---

## 📋 Prerequisites

Ensure you have one of the following installed:
- **Node.js**: v18.0.0 or higher (`node -v`)
- **Package Manager**: `npm` (bundled with Node.js) or `bun` (v1.0+)

---

## ⚡ Quick Start (Step-by-Step)

### 1. Install Dependencies

Using `npm`:
```bash
npm install
```

Or using `bun`:
```bash
bun install
```

### 2. Environment Configuration (Optional)

Copy the sample environment file if you wish to customize port or app URL:
```bash
cp .env.example .env
```
*By default, the server runs on port `3000` (http://localhost:3000).*

### 3. Start the Development Server

```bash
npm run dev
# or
bun run dev
```

The application is served at:
👉 **[http://localhost:3000](http://localhost:3000)**

### 4. Running on a Custom Port (if Port 3000 is Busy)

If port 3000 is occupied by another process, you can supply a custom port:

**Via command-line argument:**
```bash
npm run dev -- --port 3001
# or
npm run dev -- --port=3001
```

**Via PowerShell / Command Prompt environment variable:**
```powershell
$env:PORT="3001"; npm run dev
```

**Via `.env` file:**
Set `PORT=3001` in your `.env` file and run `npm run dev`.

---

## 🚀 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Express backend with Vite HMR middleware for live full-stack development |
| `npm run build` | Builds optimized client production assets into `dist/` |
| `npm start` | Runs the server in production mode serving the pre-compiled `dist/` assets |
| `npm test` | Runs the automated 14-point test suite (`tests/security-and-flows.test.ts`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run cli` | Runs the standalone CLI installer (`cli/tech-inject.cjs`) |

---

## 🧪 Running Automated Tests

Run the comprehensive security and flow verification suite:
```bash
npm test
```

Expected result:
```
✔ [PASS] 1. Unauthorized admin writes fail
✔ [PASS] 2. Drafts cannot be publicly accessed
✔ [PASS] 3. Invalid component upload fails
✔ [PASS] 4. Valid publication succeeds
✔ [PASS] 5. Published metadata/source remain consistent
✔ [PASS] 6. Free customer can access free component
✔ [PASS] 7. Free customer cannot access premium source
✔ [PASS] 8. Premium customer can access premium source
✔ [PASS] 9. Revoked premium customer cannot access premium source
✔ [PASS] 10. Customer cannot grant themselves premium
✔ [PASS] 11. Customer cannot access admin APIs
✔ [PASS] 12. Unsafe installation paths fail
✔ [PASS] 13. Existing files are not silently overwritten
✔ [PASS] Additional: AI agent prompt generation contains required sections

Results: 14 passed, 0 failed
```

---

## 🔑 Test Accounts & Demo Credentials

Pre-seeded accounts are immediately available on cold boot. You can also use the 1-click login buttons on the login page:

| Role | Email | Password | Access Tier | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin@techinject.dev` | `admin123` | Unrestricted | Full admin dashboard, component publishing, customer management |
| **Free Customer** | `free@techinject.dev` | `free123` | Free | Access to Free components (e.g. Button), locked on Premium |
| **Premium Customer** | `pro@techinject.dev` | `premium123` | Premium | Full access to Free & Premium components (e.g. Data Table) |

---

## 🧭 Key Routes

- **Catalogue**: [http://localhost:3000/components](http://localhost:3000/components)
- **Getting Started Docs**: [http://localhost:3000/docs/getting-started](http://localhost:3000/docs/getting-started)
- **Login / Switcher**: [http://localhost:3000/login](http://localhost:3000/login)
- **Account Dashboard**: [http://localhost:3000/account](http://localhost:3000/account)
- **Admin Console**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Health Check API**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## 📦 Using the Component CLI

You can test installing components into an application or workspace using:

```bash
# Add a free component
node cli/tech-inject.cjs add button

# Add with authenticated session token
node cli/tech-inject.cjs add data-table --token <session-token>
```
